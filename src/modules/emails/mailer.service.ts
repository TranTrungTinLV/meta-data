import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class MailerService {
  constructor(private configService: ConfigService) {
    sgMail.setApiKey(this.configService.get<string>('MAILER_KEY'));
  }
  async sendEmail(to: string, subject: string, message: string): Promise<void> {
    const msg = {
      to: to,
      from: this.configService.get<string>('MAILER_ADDR'),
      subject: subject,
      html: message,
    };

    try {
      await sgMail.send(msg);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email', error);
      if (error.response) {
        console.error(error.response.body);
      }
    }
  }
}
