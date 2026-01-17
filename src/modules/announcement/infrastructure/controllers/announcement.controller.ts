import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  Req,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { Public } from '@modules/authentication/infrastructure/decorators/public.decorator';
import {
  CheckPolicies,
  Can,
} from '@modules/authorization/infrastructure/decorators';
import { Action, Subject } from '@modules/authorization/domain/enums';
import { AnnouncementTarget } from '../../domain/enums/announcement.enums';
import { CreateAnnouncementDto } from '../../application/dtos/create-announcement.dto';
import { UpdateAnnouncementDto } from '../../application/dtos/update-announcement.dto';
import { AnnouncementResponseDto } from '../../application/dtos/announcement-response.dto';
import { ListAnnouncementsDto } from '../../application/dtos/list-announcements.dto';
import {
  CreateAnnouncementUseCase,
  DeleteAnnouncementUseCase,
  GetActiveAnnouncementUseCase,
  ListAnnouncementsUseCase,
  UpdateAnnouncementUseCase,
} from '../../application/use-cases';

@ApiTags('Announcements')
@ApiBearerAuth()
@Controller('announcements')
export class AnnouncementController {
  private readonly logger = new Logger(AnnouncementController.name);

  constructor(
    private readonly createUseCase: CreateAnnouncementUseCase,
    private readonly listUseCase: ListAnnouncementsUseCase,
    private readonly updateUseCase: UpdateAnnouncementUseCase,
    private readonly deleteUseCase: DeleteAnnouncementUseCase,
    private readonly getActiveUseCase: GetActiveAnnouncementUseCase,
  ) {}

  @Post()
  @CheckPolicies(Can(Action.Create, Subject.Announcement))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new announcement' })
  @ApiOkResponse({ type: AnnouncementResponseDto })
  async create(
    @Body() dto: CreateAnnouncementDto,
    @Req() req: any,
  ): Promise<AnnouncementResponseDto> {
    const creatorId = req.user.id;
    return this.createUseCase.execute(dto, creatorId);
  }

  @Get()
  @CheckPolicies(Can(Action.Read, Subject.Announcement))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List announcements' })
  @ApiOkResponse({
    description: 'List of announcements',
  })
  async list(@Query() dto: ListAnnouncementsDto): Promise<{ data: AnnouncementResponseDto[]; meta: { pagination: any } }> {
    return this.listUseCase.execute(dto);
  }

  @Get('active')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get active announcement' })
  @ApiOkResponse({ type: [AnnouncementResponseDto] })
  async getActive(@Req() req: any): Promise<AnnouncementResponseDto[]> {
    const target = req.user ? AnnouncementTarget.LOGGED_IN : AnnouncementTarget.GUEST;
    return this.getActiveUseCase.execute(target);
  }

  @Patch(':id')
  @CheckPolicies(Can(Action.Update, Subject.Announcement))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an announcement' })
  @ApiBody({ type: UpdateAnnouncementDto })
  @ApiOkResponse({ type: AnnouncementResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateAnnouncementDto,
  ): Promise<AnnouncementResponseDto> {
    return this.updateUseCase.execute(id, dto);
  }

  @Delete(':id')
  @CheckPolicies(Can(Action.Delete, Subject.Announcement))
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an announcement' })
  @ApiNoContentResponse()
  async delete(@Param('id') id: string): Promise<void> {
    return this.deleteUseCase.execute(id);
  }
}
