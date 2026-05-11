import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class PaginationHelper {
  parse(pageValue?: string | number, limitValue?: string | number) {
    const page = this.parsePositiveInt(pageValue, 1, 'page');
    const limit = this.parsePositiveInt(limitValue, 20, 'limit');

    if (limit > 100) {
      throw new BadRequestException('limit must be less than or equal to 100');
    }

    return { page, limit, skip: (page - 1) * limit };
  }

  private parsePositiveInt(value: string | number | undefined, fallback: number, label: string): number {
    if (value === undefined || value === null || value === '') return fallback;

    const parsed = typeof value === 'number' ? value : Number.parseInt(String(value), 10);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new BadRequestException(`${label} must be a positive integer`);
    }

    return parsed;
  }
}