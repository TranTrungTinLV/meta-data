import { Injectable } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';


import * as sgMail from '@sendgrid/mail';
@Injectable()
export class MailerService {
  constructor(
    private configService: ConfigService,
    ) {
      sgMail.setApiKey('SG.Wf8_uXrkQ1SKhUEy0d5UOQ.h7c0DJNWVVpkkSRv134_DYOP534Gp30bJ16Ts4oGGsIs')
    }
  async sendEmail(to: string, subject: string, message: string): Promise<void> {
    const msg = {
      to: to,
      from: 'noreply@sgod.vn',
      subject: subject,
      html: message
    }

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
