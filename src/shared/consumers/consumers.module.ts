// ** Libraries
import { Module } from '@nestjs/common';

// ** DI injections
import { EmailConsumer } from './email.consumer';
import { MongooseModule } from '@nestjs/mongoose';
import { MailerModule } from 'src/modules/emails/mailer.module';
import { Email, EmailSchema } from 'src/modules/users/schema/email.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Email.name, schema: EmailSchema }]),
    MailerModule,
  ],
  providers: [EmailConsumer],
  exports: [EmailConsumer],
})
export class ConsumersModule {}
