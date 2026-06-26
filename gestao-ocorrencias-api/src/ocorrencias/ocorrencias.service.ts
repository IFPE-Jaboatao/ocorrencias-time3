import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ocorrencia } from './entities/ocorrencia.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreateOcorrenciaDto } from './dto/create-ocorrencia.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { StatusOcorrencia, SeveridadeOcorrencia, PerfilUsuario } from '../dominio/enums';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { Evidencia } from './entities/evidencia.entity';

@Injectable()
export class OcorrenciasService {
  constructor(
    @InjectRepository(Ocorrencia)
    private ocorrenciaRepository: Repository<Ocorrencia>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Evidencia)
    private evidenciaRepository: Repository<Evidencia>,
    private auditoriaService: AuditoriaService,
  ) {}

  async create(dto: CreateOcorrenciaDto): Promise<Ocorrencia> {
    const aluno = await this.usuarioRepository.findOne({ where: { id: dto.alunoId } });
    if (!aluno) throw new NotFoundException('Aluno não encontrado no sistema.');

    const autor = await this.usuarioRepository.findOne({ where: { id: dto.autorId } });
    if (!autor) throw new NotFoundException('Autor não encontrado no sistema.');

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

    if (ocorrenciaSalva.severidade === SeveridadeOcorrencia.ALTA) {
      console.warn(`[URGENTE] A ocorrência ${ocorrenciaSalva.id} possui severidade ALTA e foi enviada para validação do coordenador!`);
    }

    return ocorrenciaSalva;
  }

  async updateStatus(id: string, dto: UpdateStatusDto, usuarioLogado: any): Promise<Ocorrencia> {
    const ocorrencia = await this.ocorrenciaRepository.findOne({ where: { id } });
    if (!ocorrencia) throw new NotFoundException('Ocorrência não encontrada.');

    if (ocorrencia.status === StatusOcorrencia.RESOLVIDA && !dto.justificativa) {
      throw new BadRequestException('Como esta ocorrência já foi resolvida, é obrigatório enviar uma justificativa para alterá-la novamente.');
    }

    const statusAntigo = ocorrencia.status;
    ocorrencia.status = dto.status;
    if (dto.justificativa) ocorrencia.justificativa = dto.justificativa;

    const ocorrenciaSalva = await this.ocorrenciaRepository.save(ocorrencia);

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

  async getDashboardEstatisticas() {
    const queryBuilder = this.ocorrenciaRepository.createQueryBuilder('ocorrencia');

    const porStatus = await queryBuilder
      .select('ocorrencia.status', 'status')
      .addSelect('COUNT(ocorrencia.id)', 'quantidade')
      .groupBy('ocorrencia.status')
      .getRawMany();

    const porSeveridade = await this.ocorrenciaRepository.createQueryBuilder('ocorrencia')
      .select('ocorrencia.severidade', 'severidade')
      .addSelect('COUNT(ocorrencia.id)', 'quantidade')
      .groupBy('ocorrencia.severidade')
      .getRawMany();

    const total = await this.ocorrenciaRepository.count();

    return { total, indicadores: { porStatus, porSeveridade } };
  }

  async findAll(usuarioLogado: any): Promise<Ocorrencia[]> {
    if (usuarioLogado.perfil === PerfilUsuario.ALUNO) { 
      return await this.ocorrenciaRepository.find({
        where: { aluno: { id: usuarioLogado.sub } }, 
        relations: ['aluno', 'autor'], 
      });
    }

    if (usuarioLogado.perfil === PerfilUsuario.PROFESSOR) { 
      return await this.ocorrenciaRepository.find({
        where: { autor: { id: usuarioLogado.sub } },
        relations: ['aluno', 'autor'],
      });
    }

    if (usuarioLogado.perfil === PerfilUsuario.RESPONSAVEL) {
      const responsavelDb = await this.usuarioRepository.findOne({ where: { id: usuarioLogado.sub } });
      
      if (!responsavelDb || !responsavelDb.matriculaVinculada) {
        return [];
      }

      return await this.ocorrenciaRepository.find({
        where: { aluno: { matricula: responsavelDb.matriculaVinculada } },
        relations: ['aluno', 'autor'],
      });
    }

    return await this.ocorrenciaRepository.find({
      relations: ['aluno', 'autor'],
    });
  }

  async anexarEvidencia(ocorrenciaId: string, arquivo: Express.Multer.File): Promise<Evidencia> {
    const ocorrencia = await this.ocorrenciaRepository.findOne({ where: { id: ocorrenciaId } });
    if (!ocorrencia) throw new NotFoundException('Ocorrência não encontrada.');

    const novaEvidencia = this.evidenciaRepository.create({
      nomeOriginal: arquivo.originalname,
      caminhoArquivo: arquivo.path,
      tipoMime: arquivo.mimetype,
      ocorrencia: ocorrencia,
    });

    return await this.evidenciaRepository.save(novaEvidencia);
  }
}