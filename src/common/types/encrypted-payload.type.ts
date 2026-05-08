export type EncryptedPayload = {
  iv: string;
  tag: string;
  _enc: string;
};