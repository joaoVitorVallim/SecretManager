export function secretDisabledSlackMessage(secret: {
  type: string;
  system: string;
  identifiers: string[];
}) {
  const today = new Date().toLocaleString('pt-BR');

  return {
    text: '',

    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '⛔ Secret desativada',
        },
      },

      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: [
            `💻 *${secret.type}:${secret.system}:${secret.identifiers.join(':')}*`,
            `📅 ${today}`,
          ].join('\n'),
        },
      },

      {
        type: 'divider',
      },

      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: '⚠️ A secret foi desativada via API.',
          },
        ],
      },
    ],
  };
}