import { Controller, Post, Body, Patch, Param, UseGuards, Get, Req } from '@nestjs/common'; // <-- Importe UseGuards
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

@Get()
  @ApiOperation({ summary: 'Lista ocorrências (Com filtro inteligente de perfil)' })
  @ApiResponse({ status: 200, description: 'Lista retornada com sucesso.' })
  // Permitimos que qualquer usuário logado acesse a rota, pois o filtro ocorre lá dentro do Service
  @Perfis(PerfilUsuario.ALUNO, PerfilUsuario.PROFESSOR, PerfilUsuario.COORDENADOR, PerfilUsuario.ADMIN, PerfilUsuario.EQUIPE_PEDAGOGICA)
  findAll(@Req() request: any) {
    const usuarioLogado = request.user; // Pega os dados decodificados do Token JWT
    return this.ocorrenciasService.findAll(usuarioLogado);
  }
// NOVA ROTA DO DASHBOARD (Coloque ANTES do @Patch(':id/status'))
  @Get('dashboard')
  @ApiOperation({ summary: 'Retorna estatísticas gerenciais para o Dashboard' })
  @ApiResponse({ status: 200, description: 'Indicadores retornados com sucesso.' })
  // Regra de Negócio: Apenas o escalão superior pode ver o balanço geral
  @Perfis(PerfilUsuario.COORDENADOR, PerfilUsuario.ADMIN)
  getDashboard() {
    return this.ocorrenciasService.getDashboardEstatisticas();
  }

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
    @Body() updateStatusDto: UpdateStatusDto,
    @Req() request: any // <-- Adicione isso
  ) {
    return this.ocorrenciasService.updateStatus(id, updateStatusDto, request.user); // <-- Passe o request.user
  }
}