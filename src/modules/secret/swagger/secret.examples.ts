export const secretCredentialsExample = {
	client_cert: '----BEGIN CERTIFICATE----\n...\n----END CERTIFICATE----',
	client_key: '----BEGIN PRIVATE KEY----\n...\n----END PRIVATE KEY----',
	username: 'napp154878',
	password: '154878',
};

export const secretRegisterExample = {
	reference_row: 'API:bling:123,456',
	credentials: secretCredentialsExample,
};

export const secretResponseExample = {
	id: 1,
	reference_hash: 'd41d8cd98f00b204e9800998ecf8427e',
	reference_row: 'API:bling:123,456',
	credentials: secretCredentialsExample,
	is_active: true,
	created_at: '2026-05-07T10:00:00.000Z',
	deactivated_at: null,
	expires_at: null,
};

export const secretDeactivateResponseExample = {
	message: 'Secret deactivated',
};
