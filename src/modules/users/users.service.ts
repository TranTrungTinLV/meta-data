import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';


import { User } from './schema/create-user.schema';


import { MailerService } from '../mailer/mailer.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as bcrypt from 'bcrypt'
import { CacheService } from 'src/utils/cache.service';
import { UpdateUser } from './dto/update-user.dto';
import { PasswordReset } from './schema/passwordReset.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly UserModel: mongoose.Model<User>,
    @InjectModel(PasswordReset.name)
    private readonly resetPasswordModel: mongoose.Model<PasswordReset>,
    private readonly cacheService: CacheService,
    private readonly mailService: MailerService,
    @InjectQueue('send-mail')
    private readonly sendEmail: Queue

  ) {
    console.log('UserService contructor');
  }

  async findOne(username: string) {
    return await this.UserModel.findOne({ username }).select(
      'id username role',
    );
  }
  async findAll(){
    return this.UserModel.find()
  }

  async findWithFilter(keyword:string){
      if(!keyword){
        console.log(`không tồn tên ký tự người dùng`)
        return this.UserModel.find().exec();
      }
      return this.UserModel.find({
        username:{
          $regex: keyword, $options: 'i'
        }
      }).populate('username')
  }
  async findOneByEmail(email: string): Promise<User | undefined> {
    return this.UserModel.findOne({ email }).exec();
  }

  async findOneById(id: string): Promise<User> {
    try {
      const user = await this.UserModel.findById(id).exec();
      if (!user) {
        throw new UnauthorizedException(`User not found with ID: ${id}`);
      }
      return user;
    } catch (error) {
      throw new HttpException('Invalid ID format or other error', HttpStatus.BAD_REQUEST);
    }
  }
  
  //addPurchaseProducts
  // async addPurchasedProducts(userId: string, orderIds: string[]): Promise<User> {
  //   return await this.UserModel.findByIdAndUpdate(userId, {
  //     $push: { orders: { $each: orderIds } }
  //   }, { new: true }).exec();
  // }

  async findOneWithEmailorUserName(loginIndentifier: string){
    return await this.UserModel.findOne(
      {
        $or: [{
          email: loginIndentifier
        },
      {
        username: loginIndentifier
      }]
      }
    )
  }

  // async findOneWithPassword(username: string) {
  //   const user = await this.UserModel.findOne({ username });
  //   return user;
  // }



  async updateRefreshToken(userId: string,refreshToken: string): Promise<void> {
     await this.UserModel.findByIdAndUpdate(userId,{refreshToken});
  }
  
  async deleteUser(id: string):Promise<User> {
    const result = await this.UserModel.findByIdAndDelete(
      id
    )
    if(!result){
      console.log(`${result}`)
      throw new NotFoundException(`Không tồn tại người dùng này`)
    }
    return result
  }

  async blockUser(userId: string): Promise<User> {
    const user = await this.UserModel.findByIdAndUpdate(userId,{isBlocked: true},{new:true}).exec();
    if (!user) {
      throw new NotFoundException(`User not found with ID: ${userId}`);
    }
    return user
  }

  async unblockUser(userId: string): Promise<User> {
    const user = await this.UserModel.findByIdAndUpdate(userId,{isBlocked: false},{new:true}).exec();
    if (!user) {
      throw new NotFoundException(`User not found with ID: ${userId}`);
    }
    return user
  }

  async updateUser(userId: string, updateUserDto: UpdateUser): Promise<User> {
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${userId}`);
    }
  
    Object.entries(updateUserDto).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        user[key] = value;
      }
    });
  
    await user.save();
    return user;
  }


  async updateUserById(userId: string, updateUserDto: UpdateUser): Promise<User> {
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${userId}`);
    }
  
    Object.entries(updateUserDto).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        user[key] = value;
      }
    });
  
    await user.save();
    return user;
  }
  
  validateEmail(email: string) {
    const regex = /^[\w-\.]+@gmail\.com$/;
    return regex.test(email);
  }


  async sendForgotPasswordOtp(email: string) {
    const user = await this.findOneByEmail(email)
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng với email này.');
    }else{
      
    }
    console.log(user)

    //random number otp
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.cacheService.set(`OTP:${email}`, otp, 300);
    //hash otp
    const salt = await bcrypt.genSalt();
    const hashedOtp = await bcrypt.hash(otp, salt);

     // Tạo và lưu document mới với OTP và thông tin người dùng
  const passwordReset =  await this.resetPasswordModel.create({
    userId: user._id,
    email: user.email,
    username: user.username,
    role: user.role,
    otp: hashedOtp
  });
  await passwordReset;


  // Gửi OTP qua email
  try{
     await this.sendEmail.add(
      'register',
      {
        to: user.email,
        name: user.username,
        otp: otp
      },
      {
        removeOnComplete: true
      }
      )
      //xoá dữ liệu sao 1p
  await this.sendEmail.add('deletePasswordReset',{userId: user._id},{delay: 300000})
  return { message: 'Mã OTP đã được gửi qua email. Vui lòng kiểm tra email của bạn.' };
      // console.log("Thành công")
  }catch(error){
    
    throw new BadRequestException(error)
  }


  

  
  }

  

  }

