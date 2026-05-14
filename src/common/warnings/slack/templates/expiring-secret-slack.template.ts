export function expiringSecretSlackMessage(
  secrets: {
    type: string;
    system: string;
    identifiers: string[];
    expires_at: Date;
    credentials: Record<string, any>;
  }[],
) {
  const today = new Date().toLocaleDateString('pt-BR');

  return {
    text: 'Secret Manager',

    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `🚨 ${secrets.length} secret(s) próximos do vencimento • ${today}`,
        },
      },

      {
        type: 'divider',
      },

      ...secrets.flatMap((s) => {
        const expiresAt =
          s.expires_at.toLocaleDateString('pt-BR');

        const credentialKeys =
          Object.keys(s.credentials ?? {}).join(', ') ||
          'N/A';

        return [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: [
                `💻 *${s.type}:${s.system}:${s.identifiers.join(':')}*`,
                `🔑 ${credentialKeys}`,
                `⏳ ${expiresAt}`,
              ].join('  •  '),
            },
          },

          {
            type: 'divider',
          },
        ];
      }),
    ],
  };
}