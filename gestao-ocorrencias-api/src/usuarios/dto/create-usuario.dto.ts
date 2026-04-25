// src/usuarios/dto/create-usuario.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PerfilUsuario } from '../../dominio/enums';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome: string;

  @ApiProperty({ example: '20231001' })
  @IsString()
  @IsNotEmpty({ message: 'A matrícula é obrigatória' })
  matricula: string;

  @ApiProperty({ example: 'joao@faculdade.edu.br' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ enum: PerfilUsuario, example: PerfilUsuario.ALUNO })
  @IsEnum(PerfilUsuario, { message: 'Perfil inválido' })
  perfil: PerfilUsuario;
}