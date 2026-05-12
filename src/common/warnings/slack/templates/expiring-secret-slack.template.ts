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

    const rows = secrets.map((s) => {
      const expiresAt = s.expires_at.toLocaleDateString('pt-BR');
      const credentialKeys = Object.keys(s.credentials ?? {}).join(', ');

      return [
        `💻 *${s.type}* • ${s.system}`,
        `📌 \`${s.identifiers.join(':')}\``,
        `🔑 ${credentialKeys || 'N/A'}`,
        `Expira em: *${expiresAt}*`,
      ].join('\n');
  })
  .join('\n\n━━━━━━━━━━━━━━━━━━\n\n');

  return [
    `📋 *Relatório do dia ${today}*`,
    '',
    `🚨 *${secrets.length} secret(s) próximos do vencimento*`,
    '',
    rows,
    '',
    '👉 Rotacione as credenciais no *Secret Manager*.',
  ].join('\n\n');
}