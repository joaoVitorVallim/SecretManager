import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SlackService implements OnModuleInit {
	private readonly logger = new Logger(SlackService.name);
	private webhookUrl?: string;

	constructor(private readonly configService: ConfigService) {}

	onModuleInit() {
		const webhookUrl = this.configService.get<string>('slack.webhookUrl');

		if (!webhookUrl) {
			this.logger.warn('Slack not configured. Skipping webhook setup.');
			return;
		}

		this.webhookUrl = webhookUrl;
	}

	async sendText(text: string) {
		if (!this.webhookUrl) {
			this.logger.warn('Slack not configured. Skipping send.');
			return;
		}

		try {
			await axios.post(this.webhookUrl, { text });
			this.logger.log('Slack message sent.');
		} catch (error) {
			this.logger.error('Failed to send Slack message', error);
		}
	}
}
