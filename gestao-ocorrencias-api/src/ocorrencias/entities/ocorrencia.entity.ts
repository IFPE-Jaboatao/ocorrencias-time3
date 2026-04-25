import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { SeveridadeOcorrencia, StatusOcorrencia } from '../../dominio/enums';

@Entity('ocorrencias')
export class Ocorrencia {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  categoria!: string;

  @Column({ type: 'enum', enum: SeveridadeOcorrencia })
  severidade!: SeveridadeOcorrencia;

  @Column('text')
  descricao!: string;

  @Column({ nullable: true })
  contextoAcademico!: string;

  @Column({ type: 'enum', enum: StatusOcorrencia, default: StatusOcorrencia.ABERTA })
  status!: StatusOcorrencia;

  @Column({ type: 'text', nullable: true })
  justificativa!: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'aluno_id' })
  aluno!: Usuario;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'autor_id' })
  autor!: Usuario;

  @CreateDateColumn()
  dataRegistro!: Date;

  @UpdateDateColumn()
  dataAtualizacao!: Date;
}