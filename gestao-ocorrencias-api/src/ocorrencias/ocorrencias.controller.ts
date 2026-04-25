import { Controller, Post, Body, Patch, Param } from '@nestjs/common';
import { OcorrenciasService } from './ocorrencias.service';
import { CreateOcorrenciaDto } from './dto/create-ocorrencia.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ApiOperation, ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Ocorrências')
@Controller('ocorrencias')
export class OcorrenciasController {
  constructor(private readonly ocorrenciasService: OcorrenciasService) {}

  @Post()
  @ApiOperation({ summary: 'Registra uma nova ocorrência' })
  create(@Body() createOcorrenciaDto: CreateOcorrenciaDto) {
    return this.ocorrenciasService.create(createOcorrenciaDto);
  }

  // NOVA ROTA ADICIONADA:
  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualiza o status de uma ocorrência' })
  @ApiParam({ name: 'id', description: 'ID (UUID) da ocorrência' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Bad Request - Faltando justificativa para ocorrência resolvida.' })
  updateStatus(
    @Param('id') id: string, 
    @Body() updateStatusDto: UpdateStatusDto
  ) {
    return this.ocorrenciasService.updateStatus(id, updateStatusDto);
  }
}