import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

export interface ParseIdentifiersOptions {
  required?: boolean;
  separator?: string;
}

@Injectable()
export class ParseIdentifiersPipe implements PipeTransform {
  constructor(private readonly options: ParseIdentifiersOptions = {}) {}

  transform(value: unknown): string[] | undefined {
    const { required = true, separator = ',' } = this.options;

    if (value === undefined || value === null || value === '') {
      if (required) {
        throw new BadRequestException('Required parameter: identifiers');
      }

      return undefined;
    }

    const rawItems = Array.isArray(value) ? value : String(value).split(separator);
    const identifiers = rawItems
      .map((item) => String(item).trim())
      .filter(Boolean);

    if (!identifiers.length) {
      if (required) {
        throw new BadRequestException('Required parameter: identifiers');
      }

      return undefined;
    }

    return identifiers;
  }
}
