import { Processor, Process } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Job } from "bull";
import { Model } from "mongoose";
import { MailerService } from "src/modules/mailer/mailer.service";
import { PasswordReset } from "../users/schema/passwordReset.schema";
import { InjectModel } from "@nestjs/mongoose";

@Processor("send-mail")
export class EmailConsumer {
  constructor(
    private readonly mailService: MailerService,
    @InjectModel(PasswordReset.name)
    private readonly resetPasswordModel: Model<PasswordReset>,
  ) {}
  @Process("register")
  async registerEmail(job: Job<unknown>) {
    console.log("mã nè", job.data);
    const time1 = new Date();
    console.log(time1);
    await this.mailService.sendEmail(
      job.data["to"],
      "OTP Đặt Lại Mật Khẩu",
      `Mã OTP của bạn là: ${job.data["otp"]}. Mã này chỉ có hiệu lực trong 1 phút.`,
    );

    console.log("send success ");
    const time2 = new Date();
    console.log("send Success: ", time2.getTime() - time1.getTime(), "ms");
  }

  @Process("deletePasswordReset")
  async handleDeletePasswordReset(job: Job<{ userId: string }>): Promise<any> {
    return await this.resetPasswordModel.deleteOne({ userId: job.data.userId });
  }
}
