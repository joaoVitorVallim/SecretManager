import { SecretEntity } from "../entities/secret.entity";


export default function toResponse(secret: SecretEntity) {
  const { reference_hash, ...data } = secret;

  return {
    ...data,
    credentials: this.cryptoService.decrypt(
      secret.credentials,
    ),
  };
}