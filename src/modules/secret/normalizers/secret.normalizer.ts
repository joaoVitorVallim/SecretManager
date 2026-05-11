import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class SecretNormalizer {
  segment(value: string, label: string): string {
    const normalized = (value ?? '').trim();
    if (!normalized) {
      throw new BadRequestException(`Required parameter: ${label}`);
    }
    return normalized;
  }

  optionalSegment(value?: string): string | undefined {
    const normalized = (value ?? '').trim();
    return normalized || undefined;
  }

  identifiers(identifiers: string[]): string[] {
    const normalized = this.parseIdentifiers(identifiers);
    if (!normalized.length) {
      throw new BadRequestException('Required parameter: identifiers');
    }
    return normalized;
  }

  optionalIdentifiers(identifiers?: string[]): string[] | undefined {
    const normalized = this.parseIdentifiers(identifiers);
    return normalized.length ? normalized : undefined;
  }

  date(value?: string): Date | null {
    if (!value) return null;

    const normalized = value.trim();
    const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (dateOnlyRegex.test(normalized)) {
      return new Date(`${normalized}T00:00:00-03:00`);
    }

    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('expires_at is invalid');
    }

    return parsed;
  }

  private parseIdentifiers(identifiers?: string[]): string[] {
    if (!identifiers) return [];
    return identifiers.map((item) => String(item).trim()).filter(Boolean);
  }
}