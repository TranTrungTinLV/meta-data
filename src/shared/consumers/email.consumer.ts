import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { MailerService } from 'src/modules/emails/mailer.service';
import { EBullJobName, EBullQueueName } from 'src/common/enums';
import { Email } from 'src/modules/users/schema/email.schema';

@Processor(EBullQueueName.SEND_EMAIL)
export class EmailConsumer {
  constructor(
    // ** Models
    @InjectModel(Email.name)
    private readonly emailModel: Model<Email>,

    // ** Services
    private readonly mailService: MailerService,
  ) {}

  @Process(EBullJobName.REGISTER_EMAIL)
  async jobRegisterEmail(job: Job<unknown>) {
    await this.mailService.sendEmail(
      job.data['to'],
      'OTP Đặt Lại Mật Khẩu',
      `Mã OTP của bạn là: ${job.data['otp']}. Mã này chỉ có hiệu lực trong 1 phút.`,
    );
  }

  @Process(EBullJobName.DELETE_PASSWORD_RESET)
  async jobDeleteEmail(job: Job<{ userId }>) {
    return await this.emailModel.deleteOne({ userId: job.data.userId });
  }
}
