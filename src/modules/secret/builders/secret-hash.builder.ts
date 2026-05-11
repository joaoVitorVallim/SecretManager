import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class SecretHashBuilder {
  build(type: string, system: string, identifiers: string[]): string {
    const value = this.buildReferenceValue(type, system, identifiers);
    return this.compute(value);
  }

  buildReferenceValue(type: string, system: string, identifiers: string[]): string {
    return `${type}:${system}:${identifiers.join(':')}`;
  }

  compute(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }
}