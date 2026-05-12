export function expiringSecretMailTemplate(secrets: {
  type: string;
  system: string;
  identifiers: string[];
  expires_at: Date;
}[]) {
  const rows = secrets
    .map(
      (s) => `
      <tr>
        <td>${s.type}</td>
        <td>${s.system}</td>
        <td>${s.identifiers.join(':')}</td>
        <td><strong>${s.expires_at.toLocaleDateString('pt-BR')}</strong></td>
      </tr>`,
    )
    .join('');

  return `
    <h2>⚠️ Secrets próximos do vencimento</h2>
    <p>Os seguintes secrets irão expirar em breve:</p>
    <table border="1" cellpadding="8" cellspacing="0">
      <thead>
        <tr>
          <th>Type</th>
          <th>System</th>
          <th>Identifiers</th>
          <th>Expira em</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p>Acesse o Secret Manager e rotacione as credenciais antes do vencimento.</p>
  `;
}

