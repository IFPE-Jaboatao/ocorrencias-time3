// src/auditoria/entities/auditoria.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('logs_auditoria')
export class Auditoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  usuarioId: string; // Quem fez a ação

  @Column()
  acao: string; // Ex: 'CRIACAO_OCORRENCIA', 'ATUALIZACAO_STATUS'

  @Column('text')
  detalhes: string; // Vamos salvar os detalhes em formato texto (JSON stringificado)

  @CreateDateColumn()
  dataHora: Date; // Quando aconteceu
}