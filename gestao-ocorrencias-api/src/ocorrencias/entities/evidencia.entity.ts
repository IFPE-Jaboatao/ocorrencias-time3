import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Ocorrencia } from './ocorrencia.entity';

@Entity('evidencias')
export class Evidencia {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nomeOriginal!: string;

  @Column()
  caminhoArquivo!: string;

  @Column()
  tipoMime!: string;

  @ManyToOne(() => Ocorrencia, (ocorrencia) => ocorrencia.evidencias, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ocorrencia_id' })
  ocorrencia!: Ocorrencia;

  @CreateDateColumn()
  dataUpload!: Date;
}
