// Libraries
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as bcrypt from 'bcrypt';

// ** DI injections
import { User } from './schema/users.schema';
import { UpdateUser } from './dtos/update-user.dto';
import { Email } from './schema/email.schema';
import { RedisService } from 'src/shared/redis/redis.service';
import { EBullQueueName } from 'src/common';

@Injectable()
export class UsersService {
  constructor(
    // ** Models
    @InjectModel(User.name)
    private readonly UserModel: Model<User>,
    @InjectModel(Email.name)
    private readonly resetPasswordModel: Model<Email>,

    // ** Services
    @Inject(RedisService)
    private readonly cacheService: RedisService,

    // ** Mailer
    // @InjectQueue(EBullQueueName.SEND_EMAIL)
    // private readonly sendEmail: Queue,
  ) {}

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
    const user = await this.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng với email này.');
    }

    // random number otp
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.cacheService.setJSON(`OTP:${email}`, otp, 300);
    // hash otp
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
    // try {
    //   await this.sendEmail.add(
    //     'register',
    //     {
    //       to: user.email,
    //       name: user.username,
    //       otp: otp,
    //     },
    //     {
    //       removeOnComplete: true,
    //     },
    //   );
    //   //xoá dữ liệu sao 1p
    //   await this.sendEmail.add(
    //     'delete-password-reset',
    //     { userId: user._id },
    //     { delay: 300000 },
    //   );
    //   return {
    //     message:
    //       'Mã OTP đã được gửi qua email. Vui lòng kiểm tra email của bạn.',
    //     otp,
    //   };
    // } catch (error) {
    //   throw new BadRequestException(error);
    // }
  }
}
