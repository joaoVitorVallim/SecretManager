import {
	ApiBodyOptions,
	ApiParamOptions,
	ApiQueryOptions,
	ApiResponseOptions,
} from '@nestjs/swagger';

import {
	secretDeactivateResponseExample,
	secretRegisterExample,
	secretResponseExample,
} from './secret.examples';

export const registerBody: ApiBodyOptions = {
	description: 'Registers a secret. Extra unmapped fields are accepted.',
	schema: {
		type: 'object',
		additionalProperties: true,
		example: secretRegisterExample,
	},
};

export const rotateBody: ApiBodyOptions = {
	description: 'Deactivates the active secret and creates a new one.',
	schema: {
		type: 'object',
		additionalProperties: true,
		example: secretRegisterExample,
	},
};

export const rowTypeQuery: ApiQueryOptions = {
	name: 'type',
	required: true,
	example: 'API',
	description: 'Secret type',
};

export const rowSystemQuery: ApiQueryOptions = {
	name: 'system',
	required: true,
	example: 'bling',
	description: 'Origin system',
};

export const rowIdentifiersQuery: ApiQueryOptions = {
	name: 'identifiers',
	required: true,
	example: '123,456',
	description: 'Comma-separated identifiers',
};

export const hashParam: ApiParamOptions = {
	name: 'hash',
	required: true,
	example: 'd41d8cd98f00b204e9800998ecf8427e',
};

export const idParam: ApiParamOptions = {
	name: 'id',
	required: true,
	example: 1,
};

export const secretCreatedResponse: ApiResponseOptions = {
	description: 'Secret created',
	schema: {
		example: secretResponseExample,
	},
};

export const secretOkResponse: ApiResponseOptions = {
	description: 'Active secret',
	schema: {
		example: secretResponseExample,
	},
};

export const deactivateOkResponse: ApiResponseOptions = {
	description: 'Secret deactivated',
	schema: {
		example: secretDeactivateResponseExample,
	},
};

export const badRequestResponse: ApiResponseOptions = {
	description: 'Invalid parameters',
	schema: {
		example: {
			statusCode: 400,
			message: 'Required parameter: identifiers',
			error: 'Bad Request',
		},
	},
};

export const conflictResponse: ApiResponseOptions = {
	description: 'Active secret already exists',
	schema: {
		example: {
			statusCode: 409,
			message: 'Active secret already exists',
			error: 'Conflict',
		},
	},
};

export const notFoundActiveResponse: ApiResponseOptions = {
	description: 'Active secret not found',
	schema: {
		example: {
			statusCode: 404,
			message: 'Active secret not found',
			error: 'Not Found',
		},
	},
};

export const notFoundResponse: ApiResponseOptions = {
	description: 'Secret not found',
	schema: {
		example: {
			statusCode: 404,
			message: 'Secret not found',
			error: 'Not Found',
		},
	},
};
