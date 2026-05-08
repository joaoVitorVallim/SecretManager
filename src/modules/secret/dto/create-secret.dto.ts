import {
  IsDateString,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSecretDto {
  @ApiProperty({
    example: 'API:bling:123,456',
    description: 'TYPE:SYSTEM:IDENTIFIERS',
  })
  @IsString()
  @IsNotEmpty()
  reference_row: string;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    example: {
      client_cert: '----BEGIN CERTIFICATE----\n...\n----END CERTIFICATE----',
      client_key: '----BEGIN PRIVATE KEY----\n...\n----END PRIVATE KEY----',
      username: 'napp154878',
      password: '154878',
    },
  })
  @IsObject()
  @IsNotEmptyObject()
  credentials: Record<string, any>;

  @ApiPropertyOptional({
    example: '2026-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  expires_at?: string;
}