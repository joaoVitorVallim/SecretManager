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
	description: 'Registra um secret. Campos extras nao mapeados sao aceitos.',
	schema: {
		type: 'object',
		additionalProperties: true,
		example: secretRegisterExample,
	},
};

export const rotateBody: ApiBodyOptions = {
	description: 'Inativa o secret ativo e cria outro.',
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
	description: 'Tipo do segredo',
};

export const rowSystemQuery: ApiQueryOptions = {
	name: 'system',
	required: true,
	example: 'bling',
	description: 'Sistema de origem',
};

export const rowIdentifiersQuery: ApiQueryOptions = {
	name: 'identifiers',
	required: true,
	example: '123,456',
	description: 'Lista de identificadores separados por virgula',
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
	description: 'Cadastro criado',
	schema: {
		example: secretResponseExample,
	},
};

export const secretOkResponse: ApiResponseOptions = {
	description: 'Cadastro ativo',
	schema: {
		example: secretResponseExample,
	},
};

export const deactivateOkResponse: ApiResponseOptions = {
	description: 'Cadastro inativado',
	schema: {
		example: secretDeactivateResponseExample,
	},
};

export const badRequestResponse: ApiResponseOptions = {
	description: 'Parametros invalidos',
	schema: {
		example: {
			statusCode: 400,
			message: 'Parametro obrigatorio: identifiers',
			error: 'Bad Request',
		},
	},
};

export const conflictResponse: ApiResponseOptions = {
	description: 'Cadastro ativo ja existe',
	schema: {
		example: {
			statusCode: 409,
			message: 'Cadastro ativo ja existe',
			error: 'Conflict',
		},
	},
};

export const notFoundActiveResponse: ApiResponseOptions = {
	description: 'Cadastro ativo nao encontrado',
	schema: {
		example: {
			statusCode: 404,
			message: 'Cadastro ativo nao encontrado',
			error: 'Not Found',
		},
	},
};

export const notFoundResponse: ApiResponseOptions = {
	description: 'Cadastro nao encontrado',
	schema: {
		example: {
			statusCode: 404,
			message: 'Cadastro nao encontrado',
			error: 'Not Found',
		},
	},
};
