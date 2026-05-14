export type EncryptedPayload = {
  iv: string;
  tag: string;
  _enc: string;
};

export type SecretPayload = {
  type: string;
  system: string;
  identifiers: string[];
  credentials: Record<string, any>;
  expires_at: Date;
}