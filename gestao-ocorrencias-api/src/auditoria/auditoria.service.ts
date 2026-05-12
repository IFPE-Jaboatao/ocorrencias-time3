// src/auditoria/auditoria.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auditoria } from './entities/auditoria.entity';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(Auditoria)
    private auditoriaRepository: Repository<Auditoria>,
  ) {}

  async registrarLog(usuarioId: string, acao: string, detalhes: any) {
    const log = this.auditoriaRepository.create({
      usuarioId,
      acao,
      detalhes: JSON.stringify(detalhes), // Transforma o objeto em texto para salvar no banco
    });
    
    // Não precisamos do "await" aqui porque não queremos atrasar a resposta da API
    // O log é salvo em segundo plano (assíncrono)
    this.auditoriaRepository.save(log); 
  }

  async listarLogs() {
    return await this.auditoriaRepository.find({
      order: { dataHora: 'DESC' } // Traz os mais recentes primeiro
    });
  }
}