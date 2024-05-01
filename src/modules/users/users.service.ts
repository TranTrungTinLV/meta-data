import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import * as crypto from 'crypto';
// import * as bcrypt from 'bcrypt';
import { User } from './schema/create-user.schema';

import { MailerService } from '../mailer/mailer.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as bcrypt from 'bcrypt';
import { CacheService } from 'src/common/utils/cache.service';
import { UpdateUser } from './dto/update-user.dto';
import { PasswordReset } from './schema/passwordReset.schema';
import { CreateRegistorDto } from '../auth/dto/create-users.dto';
import { isPhoneNumber, validateEmail } from 'src/common/utils/checker.helper';
import { CreateAdminDto } from './dto/create-admin.dto';
import { Admin } from './schema/create-admin.schema';
import { Role } from './interfaces/users.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly UserModel: mongoose.Model<User>,
    @InjectModel(Admin.name)
    private readonly AdminModel: mongoose.Model<Admin>,
    @InjectModel(PasswordReset.name)
    private readonly resetPasswordModel: mongoose.Model<PasswordReset>,
    private readonly cacheService: CacheService,
    private readonly mailService: MailerService,
    @InjectQueue('send-mail')
    private readonly sendEmail: Queue,
  ) {
    console.log('UserService contructor');
  }

  async findOne(username: string) {
    return await this.UserModel.findOne({ username }).select(
      'id username role',
    );
  }
  async findAll() {
    return this.UserModel.find();
  }

  async findWithFilter(keyword: string) {
    if (!keyword) {
      console.log(`không tồn tên ký tự người dùng`);
      return this.UserModel.find().exec();
    }
    return this.UserModel.find({
      username: {
        $regex: keyword,
        $options: 'i',
      },
    }).populate('username');
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
      throw new HttpException(
        'Invalid ID format or other error',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOneWithEmailorUserName(loginIndentifier: string) {
    return await this.UserModel.findOne({
      $or: [
        {
          email: loginIndentifier,
        },
        {
          username: loginIndentifier,
        },
      ],
    });
  }

  async registerUser(signUpDto: CreateRegistorDto) {
    const {
      username,
      password,
      email,
      role,
      slug,
      sex,
      birthday,
      phone,
      fullname,
      avatar,
    } = signUpDto;

    // if(!this.validateEmail(email)) {
    //   throw new HttpException('email không hợp lệ', HttpStatus.BAD_REQUEST);
    // }
    if (email && !validateEmail(email)) {
      throw new HttpException(
        'Email không hợp lệ hoặc không phải là địa chỉ Gmail',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (phone && !isPhoneNumber(phone)) {
      throw new HttpException(
        'số điện thoại không hợp lệ vui lòng kiểm tra lai6',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if the username or email is already taken
    const existingUser = await this.UserModel.findOne({ username });
    // const existingEmail = await this.userModel.findOne({ email });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const existingEmail = email
      ? await this.UserModel.findOne({ email: email })
      : null;

    if (existingEmail) {
      throw new ConflictException('Email already taken');
    }

    if (existingUser) {
      throw new ConflictException('Username already taken');
    }

    const encryptedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');

    const user = new this.UserModel({
      username,
      password: password,
      role,
      avatar: avatar ? avatar : null,
      birthday: birthday ? birthday : null,
      phone: phone ? phone : null,
      sex: sex ? sex : null,
      fullname: fullname ? fullname : null,
      email: email ? email : null,

      slug,
    });
    try {
      await user.save();
      return { message: 'User registered successfully', userId: user._id };
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Email đã tồn tại');
      }
      throw error;
    }
    // const payload = { username: username, role: user.role, sub: user.id };

    // return {
    //   access_token: await this.jwtService.signAsync(payload),
    // };
  }

  async registerAdmin(createAdminDto: CreateAdminDto) {
    const {
      username,
      password,
      email,
      avatar,
      birthday,
      phone,
      fullname,
      sex,
    } = createAdminDto;
    if (email && !validateEmail(email)) {
      throw new HttpException(
        'Email không hợp lệ hoặc không phải là địa chỉ Gmail',
        HttpStatus.BAD_REQUEST,
      );
    }
    // Check if the username or email is already taken

    // if (!password) {
    //   throw new BadRequestException('Password is required');
    // }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const existingEmail = email
      ? await this.UserModel.findOne({ email: email })
      : null;
    const isUserExist = await this.findOneWithEmailorUserName(username);
    if (isUserExist) {
      throw new BadRequestException('User already exists');
    }
    if (existingEmail) {
      throw new ConflictException('Email already taken');
    }
    const saltOrRounds = await bcrypt.genSalt();

    const hashedPassword = await bcrypt.hash(password, saltOrRounds);
    console.log("Password:", password); // Should show the password input
    console.log("Salt/Rounds:", saltOrRounds); // Should show the generated salt
    const admin = new this.AdminModel({
      username,
      password: hashedPassword,
      role: Role.Admin,
      avatar: avatar ? avatar : null,
      birthday: birthday ? birthday : null,
      phone: phone ? phone : null,
      sex: sex ? sex : null,
      fullname: fullname ? fullname : null,
      email: email ? email : null,
    });
    return await admin.save();
  }
  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    await this.UserModel.findByIdAndUpdate(userId, { refreshToken });
  }

  async deleteUser(id: string): Promise<User> {
    const result = await this.UserModel.findByIdAndDelete(id);
    if (!result) {
      console.log(`${result}`);
      throw new NotFoundException(`Không tồn tại người dùng này`);
    }
    return result;
  }

  async blockUser(userId: string): Promise<User> {
    const user = await this.UserModel.findByIdAndUpdate(
      userId,
      { isBlocked: true },
      { new: true },
    ).exec();
    if (!user) {
      throw new NotFoundException(`User not found with ID: ${userId}`);
    }
    return user;
  }

  async unblockUser(userId: string): Promise<User> {
    const user = await this.UserModel.findByIdAndUpdate(
      userId,
      { isBlocked: false },
      { new: true },
    ).exec();
    if (!user) {
      throw new NotFoundException(`User not found with ID: ${userId}`);
    }
    return user;
  }

  async updateUser(userId: string, updateUserDto: UpdateUser): Promise<User> {
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException(
        `Không tìm thấy người dùng với ID: ${userId}`,
      );
    }

    // Kiểm tra email nếu được cập nhật
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      if (!validateEmail(updateUserDto.email)) {
        throw new HttpException(
          'Email không hợp lệ hoặc không phải là địa chỉ Gmail',
          HttpStatus.BAD_REQUEST,
        );
      }
      const existingEmail = await this.UserModel.findOne({
        email: updateUserDto.email,
      });
      if (existingEmail) {
        throw new ConflictException(
          'Email này đã được sử dụng bởi người dùng khác',
        );
      }
    }

    // Kiểm tra số điện thoại nếu được cập nhật
    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      if (!isPhoneNumber(updateUserDto.phone)) {
        throw new HttpException(
          'Số điện thoại không hợp lệ',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    Object.entries(updateUserDto).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        user[key] = value;
      }
    });

    await user.save();
    return user;
  }

  async updateUserById(
    userId: string,
    updateUserDto: UpdateUser,
  ): Promise<User> {
    const user = await this.UserModel.findById(userId);
    if (!user) {
      throw new NotFoundException(
        `Không tìm thấy người dùng với ID: ${userId}`,
      );
    }

    // Kiểm tra email nếu được cập nhật
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      if (!validateEmail(updateUserDto.email)) {
        throw new HttpException(
          'Email không hợp lệ hoặc không phải là địa chỉ Gmail',
          HttpStatus.BAD_REQUEST,
        );
      }
      const existingEmail = await this.UserModel.findOne({
        email: updateUserDto.email,
      });
      if (existingEmail) {
        throw new ConflictException(
          'Email này đã được sử dụng bởi người dùng khác',
        );
      }
    }

    // Kiểm tra số điện thoại nếu được cập nhật
    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      if (!isPhoneNumber(updateUserDto.phone)) {
        throw new HttpException(
          'Số điện thoại không hợp lệ',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    Object.entries(updateUserDto).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        user[key] = value;
      }
    });

    await user.save();
    return user;
  }

  async sendForgotPasswordOtp(email: string) {
    const user = await this.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng với email này.');
    } else {
    }
    console.log(user);

    //random number otp
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.cacheService.set(`OTP:${email}`, otp, 60);
    //hash otp
    const salt = await bcrypt.genSalt();
    const hashedOtp = await bcrypt.hash(otp, salt);

    // Tạo và lưu document mới với OTP và thông tin người dùng
    const passwordReset = await this.resetPasswordModel.create({
      userId: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      otp: hashedOtp,
    });
    await passwordReset;

    // Gửi OTP qua email
    try {
      await this.sendEmail.add(
        'register',
        {
          to: user.email,
          name: user.username,
          otp: otp,
        },
        {
          removeOnComplete: true,
        },
      );
      //xoá dữ liệu sao 1p
      await this.sendEmail.add(
        'deletePasswordReset',
        { userId: user._id },
        { delay: 60 },
      );
      return {
        message:
          'Mã OTP đã được gửi qua email. Vui lòng kiểm tra email của bạn.',
        otp,
      };
      // console.log("Thành công")
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
