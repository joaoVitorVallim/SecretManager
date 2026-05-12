import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter?: Transporter;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('mail.host');
    const port = this.configService.get<number>('mail.port', 587);
    const user = this.configService.get<string>('mail.user');
    const pass = this.configService.get<string>('mail.pass');
    const from = this.configService.get<string>('mail.from');

    if (!host || !user || !pass || !from) {
      this.logger.warn('Email not configured. Skipping transporter setup.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  async sendHtml(to: string | string[], subject: string, html: string) {
    if (!this.transporter) {
      this.logger.warn('Email not configured. Skipping send.');
      return;
    }

    const from = this.configService.get<string>('mail.from');
    if (!from) {
      this.logger.warn('MAIL_FROM not configured. Skipping send.');
      return;
    }

    try {
      await this.transporter.sendMail({
        from,
        to: Array.isArray(to) ? to.join(',') : to,
        subject,
        html,
      });
      this.logger.log(`E-mail enviado para: ${to}`);
    } catch (error) {
      this.logger.error('Falha ao enviar e-mail', error);
    }
  }
}