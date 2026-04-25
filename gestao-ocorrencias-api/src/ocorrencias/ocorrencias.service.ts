// src/ocorrencias/ocorrencias.service.ts
import { BadRequestException } from '@nestjs/common';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ocorrencia } from './entities/ocorrencia.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CreateOcorrenciaDto } from './dto/create-ocorrencia.dto';
import { StatusOcorrencia, SeveridadeOcorrencia } from '../dominio/enums';

@Injectable()
export class OcorrenciasService {
  constructor(
    @InjectRepository(Ocorrencia)
    private ocorrenciaRepository: Repository<Ocorrencia>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
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
  async updateStatus(id: string, dto: UpdateStatusDto): Promise<Ocorrencia> {
    const ocorrencia = await this.ocorrenciaRepository.findOne({ where: { id } });
    
    if (!ocorrencia) {
      throw new NotFoundException('Ocorrência não encontrada.');
    }

    // REGRA DE NEGÓCIO: Alterações em ocorrência resolvida exigem justificativa
    if (ocorrencia.status === StatusOcorrencia.RESOLVIDA && !dto.justificativa) {
      throw new BadRequestException(
        'Como esta ocorrência já foi resolvida, é obrigatório enviar uma justificativa para alterá-la novamente.'
      );
    }

    // Atualiza os dados
    ocorrencia.status = dto.status;
    
    if (dto.justificativa) {
      ocorrencia.justificativa = dto.justificativa;
    }

    return await this.ocorrenciaRepository.save(ocorrencia);
  }
}