import { SecretEntity } from '../entities/secret.entity';

export default function toResponse(
  secret: SecretEntity,
  decrypt: (payload: SecretEntity['credentials']) => Record<string, any>,
) {
  return {
    ...secret,
    credentials: decrypt(secret.credentials),
  };
}