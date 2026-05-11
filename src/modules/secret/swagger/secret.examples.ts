export const secretCredentialsExample = {
	client_cert: '----BEGIN CERTIFICATE----\n...\n----END CERTIFICATE----',
	client_key: '----BEGIN PRIVATE KEY----\n...\n----END PRIVATE KEY----',
	username: 'napp154878',
	password: '154878',
};

export const secretEncryptedCredentialsExample = {
	iv: '0a5f93d18f7a9c8b2d3e4f5a',
	tag: 'bb2c4d5e6f7a8899aabbccdd',
	_enc: 'e1f2a3b4c5d6e7f8091a2b3c4d5e6f7a',
};

export const secretRegisterExample = {
	type: 'API',
	system: 'bling',
	identifiers: ['123', '456'],
	credentials: secretCredentialsExample,
	expires_at: '2026-12-31T23:59:59.000Z',
};

export const secretResponseExample = {
	id: 1,
	reference_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd38f7c6d94b8a4f8a1',
	type: 'API',
	system: 'bling',
	identifiers: ['123', '456'],
	credentials: secretCredentialsExample,
	is_active: true,
	created_at: '2026-05-11T10:00:00.000Z',
	deactivated_at: null,
	expires_at: '2026-12-31T23:59:59.000Z',
};

export const secretEncryptedResponseExample = {
	id: 1,
	reference_hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd38f7c6d94b8a4f8a1',
	type: 'API',
	system: 'bling',
	identifiers: ['123', '456'],
	credentials: secretEncryptedCredentialsExample,
	is_active: true,
	created_at: '2026-05-11T10:00:00.000Z',
	deactivated_at: null,
	expires_at: '2026-12-31T23:59:59.000Z',
};

export const secretListResponseExample = {
	data: [secretResponseExample],
	meta: {
		page: 1,
		limit: 20,
		total: 1,
		pages: 1,
	},
};

export const secretDeactivateResponseExample = {
	message: 'Secret API:bling:123:456 deactivated',
};

export const secretAlreadyInactiveResponseExample = {
	message: 'Secret already inactive',
};
