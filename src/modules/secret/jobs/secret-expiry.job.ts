import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ConfigService } from '@nestjs/config';

import { SecretEntity } from '../entities/secret.entity';
import { MailService } from 'src/common/warnings/mail/mail.service';
import { expiringSecretMailTemplate } from 'src/common/warnings/mail/templates/expiring-secret-mail.template';
import { SlackService } from 'src/common/warnings/slack/slack.service';
import { CryptoService } from 'src/common/guards/crypto.service';

@Injectable()
export class SecretExpiryJob {
  private readonly logger = new Logger(
    SecretExpiryJob.name,
  );

  constructor(
    @InjectRepository(SecretEntity)
    private readonly secretRepository: Repository<SecretEntity>,
    private readonly mailService: MailService,
    private readonly slackService: SlackService,
    private readonly configService: ConfigService,
    private readonly cryptoService: CryptoService
  ) {}
  
  @Cron('*/30 * * * * *', { timeZone: 'America/Sao_Paulo' })
  //@Cron('0 0 8 * * 1-5', { timeZone: 'America/Sao_Paulo' })
  async checkExpiringSecrets() {
    this.logger.log('Verificando secrets próximos do vencimento...');

    const days = this.configService.get<number>('mail.expiryAlertDays', 5);

    if (!days || days <= 0) {
      this.logger.warn('MAIL_EXPIRY_ALERT_DAYS inválido. Ignorando alerta.');
      return;
    }

    const now = new Date();
    const threshold = new Date();

    threshold.setDate(now.getDate() + days);

    const expiring =
      await this.secretRepository.find({
        where: {
          is_active: true,
          expires_at: Between(
            now,
            threshold,
          ),
        },
      });

    const withExpiry = expiring.filter(
      (
        s,
      ): s is SecretEntity & {
        expires_at: Date;
      } => s.expires_at instanceof Date,
    );

    if (!withExpiry.length) {
      this.logger.log('Nenhum secret próximo do vencimento.');
      return;
    }

    this.logger.warn(`${withExpiry.length} secret(s) próximos do vencimento.`);

    const decryptedSecrets = withExpiry.map(
      (secret) => ({
        ...secret,

        credentials:
          this.cryptoService.decrypt(
            secret.credentials,
          ),
      }),
    );
    /*
      =========================
      EMAIL
      =========================
    */

    const recipients =
      this.configService.get<string[]>('mail.alertRecipients', []);

    if (recipients.length) {
      const html = expiringSecretMailTemplate(decryptedSecrets);

      await this.mailService.sendHtml(
        recipients,

        `⚠️ [Secret Manager] ${withExpiry.length} secret(s) vencem em até ${days} dias`,

        html,
      );

      this.logger.log('E-mail de alerta enviado.');

    } else {
      this.logger.warn('MAIL_ALERT_RECIPIENTS vazio. Ignorando envio de e-mail.');
    }

    /*
      =========================
      SLACK
      =========================
    */

    this.slackService.notifySecretExpiring(decryptedSecrets);
    
  }
}