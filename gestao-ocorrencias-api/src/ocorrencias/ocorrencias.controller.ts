import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { OcorrenciasService } from './ocorrencias.service';
import { CreateOcorrenciaDto } from './dto/create-ocorrencia.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { RolesGuard } from '../dominio/auth/roles.guard';
import { Perfis } from '../dominio/auth/perfis.decorator';
import { PerfilUsuario } from '../dominio/enums';
import { ApiOperation, ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Ocorrencias')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('ocorrencias')
export class OcorrenciasController {
  constructor(private readonly ocorrenciasService: OcorrenciasService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova ocorrência' })
  @Perfis(PerfilUsuario.PROFESSOR, PerfilUsuario.COORDENADOR, PerfilUsuario.ADMIN)
  create(@Body() createOcorrenciaDto: CreateOcorrenciaDto) {
    return this.ocorrenciasService.create(createOcorrenciaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista ocorrências (Com filtro inteligente de perfil)' })
  @Perfis(PerfilUsuario.ALUNO, PerfilUsuario.PROFESSOR, PerfilUsuario.COORDENADOR, PerfilUsuario.ADMIN, PerfilUsuario.EQUIPE_PEDAGOGICA)
  findAll(@Req() request: any) {
    return this.ocorrenciasService.findAll(request.user);
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Retorna estatísticas gerenciais para o Dashboard' })
  @Perfis(PerfilUsuario.COORDENADOR, PerfilUsuario.ADMIN)
  getDashboard() {
    return this.ocorrenciasService.getDashboardEstatisticas();
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualiza o status de uma ocorrência' })
  @Perfis(PerfilUsuario.COORDENADOR, PerfilUsuario.ADMIN, PerfilUsuario.PROFESSOR)
  updateStatus(
    @Param('id') id: string, 
    @Body() updateStatusDto: UpdateStatusDto,
    @Req() request: any
  ) {
    return this.ocorrenciasService.updateStatus(id, updateStatusDto, request.user);
  }

  @Post(':id/evidencias')
  @ApiOperation({ summary: 'Anexa uma evidência (imagem ou PDF) à ocorrência' })
  @ApiConsumes('multipart/form-data') // <-- Avisa que vai receber arquivo
  @ApiBody({ // <-- Desenha o botão de upload na tela do Swagger
    schema: {
      type: 'object',
      properties: {
        arquivo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Perfis(PerfilUsuario.PROFESSOR, PerfilUsuario.COORDENADOR, PerfilUsuario.ADMIN)
  uploadEvidencia(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5000000 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|pdf)' }),
        ],
      }),
    ) arquivo: Express.Multer.File,
  ) {
    return this.ocorrenciasService.anexarEvidencia(id, arquivo);
  }
}