import { Controller, Post, Body, Patch, Param, UseGuards } from '@nestjs/common'; // <-- Importe UseGuards
import { RolesGuard } from '../dominio/auth/roles.guard'; // <-- Importe o Guard
import { Perfis } from '../dominio/auth/perfis.decorator'; // <-- Importe o Decorator
import { PerfilUsuario } from '../dominio/enums'; // <-- Importe o Enum
import { OcorrenciasService } from './ocorrencias.service';
import { CreateOcorrenciaDto } from './dto/create-ocorrencia.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ApiOperation, ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Ocorrências')
@Controller('ocorrencias')
@UseGuards(RolesGuard) // <-- Aplica o Guardião em todas as rotas deste Controller
export class OcorrenciasController {
  constructor(private readonly ocorrenciasService: OcorrenciasService) {}

@Post()
  // Pela regra de negócio, apenas Professor, Coordenador e Admin podem registrar!
  @Perfis(PerfilUsuario.PROFESSOR, PerfilUsuario.COORDENADOR, PerfilUsuario.ADMIN)
  @ApiOperation({ summary: 'Registra uma nova ocorrência (Apenas Prof/Coord/Admin)' })
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