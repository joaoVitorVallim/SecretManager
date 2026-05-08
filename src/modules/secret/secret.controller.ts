import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Patch } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SecretService } from './secret.service';
import { CreateSecretDto } from './dto/create-secret.dto';
import {
  badRequestResponse,
  conflictResponse,
  deactivateOkResponse,
  hashParam,
  idParam,
  notFoundActiveResponse,
  notFoundResponse,
  registerBody,
  rotateBody,
  rowIdentifiersQuery,
  rowSystemQuery,
  rowTypeQuery,
  secretCreatedResponse,
  secretOkResponse,
} from './swagger/secret.swagger';

@Controller('secrets')
@ApiTags('secrets')
@ApiBearerAuth('access-token')
export class SecretController {
  constructor(private readonly secretService: SecretService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar secret' })
  @ApiBody(registerBody)
  @ApiCreatedResponse(secretCreatedResponse)
  @ApiConflictResponse(conflictResponse)
  @ApiBadRequestResponse(badRequestResponse)
  register(@Body() body: CreateSecretDto) {
    return this.secretService.register(body);
  }

  @Post('rotate')
  @ApiOperation({ summary: 'Rotacionar secret' })
  @ApiBody(rotateBody)
  @ApiCreatedResponse(secretCreatedResponse)
  @ApiNotFoundResponse(notFoundActiveResponse)
  @ApiBadRequestResponse(badRequestResponse)
  rotate(@Body() body: CreateSecretDto) {
    return this.secretService.rotate(body);
  }

  @Get('by-row')
  @ApiOperation({ summary: 'Buscar secret ativo por row' })
  @ApiQuery(rowTypeQuery)
  @ApiQuery(rowSystemQuery)
  @ApiQuery(rowIdentifiersQuery)
  @ApiOkResponse(secretOkResponse)
  @ApiNotFoundResponse(notFoundActiveResponse)
  @ApiBadRequestResponse(badRequestResponse)
  findByRow(
    @Query('type') type: string,
    @Query('system') system: string,
    @Query('identifiers') identifiers: string | string[],
  ) {
    return this.secretService.findActiveByRow(type, system, identifiers);
  }

  @Get('by-hash/:hash')
  @ApiOperation({ summary: 'Buscar secret ativo por hash' })
  @ApiParam(hashParam)
  @ApiOkResponse(secretOkResponse)
  @ApiNotFoundResponse(notFoundActiveResponse)
  findByHash(@Param('hash') hash: string) {
    return this.secretService.findActiveByHash(hash);
  }

  @Get('by-id/:id')
  @ApiOperation({ summary: 'Buscar secret por id' })
  @ApiParam(idParam)
  @ApiOkResponse(secretOkResponse)
  @ApiNotFoundResponse(notFoundResponse)
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.secretService.findById(id);
  }

  @Patch('by-row/deactivate')
  @ApiOperation({ summary: 'Inativar secret por row' })
  @ApiQuery(rowTypeQuery)
  @ApiQuery(rowSystemQuery)
  @ApiQuery(rowIdentifiersQuery)
  @ApiOkResponse(deactivateOkResponse)
  @ApiNotFoundResponse(notFoundActiveResponse)
  @ApiBadRequestResponse(badRequestResponse)
  deactivateByRow(
    @Query('type') type: string,
    @Query('system') system: string,
    @Query('identifiers') identifiers: string | string[],
  ) {
    return this.secretService.deactivateByRow(type, system, identifiers);
  }

  @Patch('by-hash/:hash/deactivate')
  @ApiOperation({ summary: 'Inativar secret por hash' })
  @ApiParam(hashParam)
  @ApiOkResponse(deactivateOkResponse)
  @ApiNotFoundResponse(notFoundActiveResponse)
  deactivateByHash(@Param('hash') hash: string) {
    return this.secretService.deactivateByHash(hash);
  }

  @Patch('by-id/:id/deactivate')
  @ApiOperation({ summary: 'Inativar secret por id' })
  @ApiParam(idParam)
  @ApiOkResponse(deactivateOkResponse)
  @ApiNotFoundResponse(notFoundResponse)
  deactivateById(@Param('id', ParseIntPipe) id: number) {
    return this.secretService.deactivateById(id);
  }
}