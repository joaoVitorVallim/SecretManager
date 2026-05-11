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
import { ParseIdentifiersPipe } from 'src/common/pipes/parse-identifiers.pipe';
import {
  badRequestResponse,
  conflictResponse,
  deactivateOkResponse,
  hashParam,
  idParam,
  identifiersParam,
  limitQuery,
  notFoundActiveResponse,
  notFoundResponse,
  pageQuery,
  registerBody,
  rotateBody,
  rotateNotFoundResponse,
  searchIdentifiersQuery,
  searchSystemQuery,
  searchTypeQuery,
  activeQuery,
  rowIdentifiersQuery,
  rowSystemQuery,
  rowTypeQuery,
  secretCreatedResponse,
  secretEncryptedOkResponse,
  secretListOkResponse,
  secretOkResponse,
  systemParam,
  typeParam,
} from './swagger/secret.swagger';

@Controller('secrets')
@ApiTags('secrets')
@ApiBearerAuth('access-token')
export class SecretController {
  constructor(private readonly secretService: SecretService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register secret' })
  @ApiBody(registerBody)
  @ApiCreatedResponse(secretCreatedResponse)
  @ApiConflictResponse(conflictResponse)
  @ApiBadRequestResponse(badRequestResponse)
  register(@Body() body: CreateSecretDto) {
    return this.secretService.register(body);
  }

  @Get()
  @ApiOperation({ summary: 'List secrets' })
  @ApiQuery(searchTypeQuery)
  @ApiQuery(searchSystemQuery)
  @ApiQuery(searchIdentifiersQuery)
  @ApiQuery(activeQuery)
  @ApiQuery(pageQuery)
  @ApiQuery(limitQuery)
  @ApiOkResponse(secretListOkResponse)
  getAll(
    @Query('type') type?: string,
    @Query('system') system?: string,
    @Query('identifiers', new ParseIdentifiersPipe({ required: false })) identifiers?: string[],
    @Query('active') active?: boolean,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.secretService.getAll({ type, system, identifiers, active, page, limit });
  }

  @Post('rotate')
  @ApiOperation({ summary: 'Rotate secret' })
  @ApiBody(rotateBody)
  @ApiCreatedResponse(secretCreatedResponse)
  @ApiNotFoundResponse(rotateNotFoundResponse)
  @ApiBadRequestResponse(badRequestResponse)
  rotate(@Body() body: CreateSecretDto) {
    return this.secretService.rotate(body);
  }

  @Get('by-row')
  @ApiOperation({ summary: 'Get active secret by row' })
  @ApiQuery(rowTypeQuery)
  @ApiQuery(rowSystemQuery)
  @ApiQuery(rowIdentifiersQuery)
  @ApiOkResponse(secretOkResponse)
  @ApiNotFoundResponse(notFoundActiveResponse)
  @ApiBadRequestResponse(badRequestResponse)
  findByRow(
    @Query('type') type: string,
    @Query('system') system: string,
    @Query('identifiers', new ParseIdentifiersPipe()) identifiers: string[],
  ) {
    return this.secretService.findActiveByRow(type, system, identifiers);
  }

  @Get('by-hash/:hash')
  @ApiOperation({ summary: 'Get active secret by hash' })
  @ApiParam(hashParam)
  @ApiOkResponse(secretOkResponse)
  @ApiNotFoundResponse(notFoundActiveResponse)
  findByHash(@Param('hash') hash: string) {
    return this.secretService.findActiveByHash(hash);
  }

  @Get('by-id/:id')
  @ApiOperation({ summary: 'Get secret by id' })
  @ApiParam(idParam)
  @ApiOkResponse(secretEncryptedOkResponse)
  @ApiNotFoundResponse(notFoundResponse)
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.secretService.findActiveById(id);
  }

  @Patch('by-row/:type/:system/:identifiers/deactivate')
  @ApiOperation({ summary: 'Deactivate secret by row' })
  @ApiParam(typeParam)
  @ApiParam(systemParam)
  @ApiParam(identifiersParam)
  @ApiOkResponse(deactivateOkResponse)
  @ApiNotFoundResponse(notFoundResponse)
  @ApiBadRequestResponse(badRequestResponse)
  deactivateByRow(
    @Param('type') type: string,
    @Param('system') system: string,
    @Param('identifiers', new ParseIdentifiersPipe()) identifiers: string[],
  ) {
    return this.secretService.deactivateByRow(type, system, identifiers);
  }

  @Patch('by-hash/:hash/deactivate')
  @ApiOperation({ summary: 'Deactivate secret by hash' })
  @ApiParam(hashParam)
  @ApiOkResponse(deactivateOkResponse)
  @ApiNotFoundResponse(notFoundResponse)
  deactivateByHash(@Param('hash') hash: string) {
    return this.secretService.deactivateByHash(hash);
  }

  @Patch('by-id/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate secret by id' })
  @ApiParam(idParam)
  @ApiOkResponse(deactivateOkResponse)
  @ApiNotFoundResponse(notFoundResponse)
  deactivateById(@Param('id', ParseIntPipe) id: number) {
    return this.secretService.deactivateById(id);
  }
}