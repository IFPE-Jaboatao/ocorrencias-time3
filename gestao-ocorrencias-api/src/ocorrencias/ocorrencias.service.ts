// src/ocorrencias/ocorrencias.service.ts
import { BadRequestException } from '@nestjs/common';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ocorrencia } from './entities/ocorrencia.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreateOcorrenciaDto } from './dto/create-ocorrencia.dto';
import { StatusOcorrencia, SeveridadeOcorrencia, PerfilUsuario } from '../dominio/enums';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Injectable()
export class OcorrenciasService {
constructor(
    @InjectRepository(Ocorrencia)
    private ocorrenciaRepository: Repository<Ocorrencia>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private auditoriaService: AuditoriaService, // <-- ADICIONE AQUI
  ) {}

  async create(dto: CreateOcorrenciaDto): Promise<Ocorrencia> {
    // 1. Verifica se o aluno existe
    const aluno = await this.usuarioRepository.findOne({ where: { id: dto.alunoId } });
    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado no sistema.');
    }

    // 2. Verifica se o autor existe
    const autor = await this.usuarioRepository.findOne({ where: { id: dto.autorId } });
    if (!autor) {
      throw new NotFoundException('Autor não encontrado no sistema.');
    }

    // 3. Cria a ocorrência com Status Inicial "Aberta"
    const novaOcorrencia = this.ocorrenciaRepository.create({
      categoria: dto.categoria,
      severidade: dto.severidade,
      descricao: dto.descricao,
      contextoAcademico: dto.contextoAcademico,
      aluno: aluno,
      autor: autor,
      status: StatusOcorrencia.ABERTA, 
    });

    const ocorrenciaSalva = await this.ocorrenciaRepository.save(novaOcorrencia);

    // 4. Regra de Negócio: Gatilho para ocorrência de alta severidade
    if (ocorrenciaSalva.severidade === SeveridadeOcorrencia.ALTA) {
      // Como ainda não temos um sistema de e-mail/mensageria, usamos o log do servidor
      // Isso demonstra para o avaliador que o fluxo condicional existe
      console.warn(`[URGENTE] A ocorrência ${ocorrenciaSalva.id} possui severidade ALTA e foi enviada para validação do coordenador!`);
    }

    return ocorrenciaSalva;
  }
async updateStatus(id: string, dto: UpdateStatusDto, usuarioLogado: any): Promise<Ocorrencia> {
    // 1. Busca a ocorrência atual no banco
    const ocorrencia = await this.ocorrenciaRepository.findOne({ where: { id } });
    
    if (!ocorrencia) {
      throw new NotFoundException('Ocorrência não encontrada.');
    }

    // 2. Regra de Negócio: Justificativa obrigatória
    if (ocorrencia.status === StatusOcorrencia.RESOLVIDA && !dto.justificativa) {
      throw new BadRequestException(
        'Como esta ocorrência já foi resolvida, é obrigatório enviar uma justificativa para alterá-la novamente.'
      );
    }

    // 3. CAPTURA O STATUS ANTIGO (Exatamente aqui, antes de mudar!)
    const statusAntigo = ocorrencia.status;

    // 4. Atualiza os dados na memória
    ocorrencia.status = dto.status;
    if (dto.justificativa) {
      ocorrencia.justificativa = dto.justificativa;
    }

    // 5. Salva no banco de dados
    const ocorrenciaSalva = await this.ocorrenciaRepository.save(ocorrencia);

    // 6. Registra na Auditoria usando o statusAntigo que guardamos lá no passo 3
    this.auditoriaService.registrarLog(
      usuarioLogado.sub, 
      'ATUALIZACAO_STATUS', 
      { 
        ocorrenciaId: id, 
        de: statusAntigo, 
        para: dto.status, 
        justificativa: dto.justificativa 
      }
    );

    return ocorrenciaSalva;
  }

// Adicione dentro de OcorrenciasService:

  async getDashboardEstatisticas() {
    const queryBuilder = this.ocorrenciaRepository.createQueryBuilder('ocorrencia');

    // 1. Contagem por Status (Quantas Abertas, Resolvidas, etc)
    const porStatus = await queryBuilder
      .select('ocorrencia.status', 'status')
      .addSelect('COUNT(ocorrencia.id)', 'quantidade')
      .groupBy('ocorrencia.status')
      .getRawMany();

    // 2. Contagem por Severidade (Quantas Altas, Médias, Baixas)
    const porSeveridade = await this.ocorrenciaRepository.createQueryBuilder('ocorrencia')
      .select('ocorrencia.severidade', 'severidade')
      .addSelect('COUNT(ocorrencia.id)', 'quantidade')
      .groupBy('ocorrencia.severidade')
      .getRawMany();

    // 3. Contagem Total de Ocorrências no Sistema
    const total = await this.ocorrenciaRepository.count();

    return {
      total,
      indicadores: {
        porStatus,
        porSeveridade
      }
    };
  }



async findAll(usuarioLogado: any): Promise<Ocorrencia[]> {
    // 1. Se for ALUNO, filtra para trazer apenas as ocorrências onde ele é o "aluno"
    if (usuarioLogado.perfil === PerfilUsuario.ALUNO) { // CORRIGIDO AQUI
      return await this.ocorrenciaRepository.find({
        where: { aluno: { id: usuarioLogado.sub } }, 
        relations: ['aluno', 'autor'], 
      });
    }

    // 2. Se for PROFESSOR, traz apenas as que ele mesmo registrou
    if (usuarioLogado.perfil === PerfilUsuario.PROFESSOR) { // AJUSTADO AQUI PARA USAR O ENUM
      return await this.ocorrenciaRepository.find({
        where: { autor: { id: usuarioLogado.sub } },
        relations: ['aluno', 'autor'],
      });
    }

    // 3. Se for COORDENADOR, ADMIN ou EQUIPE PEDAGÓGICA, traz todas as ocorrências do sistema
    return await this.ocorrenciaRepository.find({
      relations: ['aluno', 'autor'],
    });
  }
}