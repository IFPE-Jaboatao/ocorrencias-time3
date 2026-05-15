import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { PerfilUsuario } from '../../dominio/enums';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  nome!: string;

  @Column({ unique: true })
  matricula!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ type: 'enum', enum: PerfilUsuario })
  perfil!: PerfilUsuario;

  @Column({ nullable: true })
  fotoPerfil!: string; // Guardará o nome do ficheiro (ex: profile-123.jpg)

  @CreateDateColumn()
  dataCriacao!: Date;
}