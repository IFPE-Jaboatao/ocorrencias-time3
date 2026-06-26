import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PerfilUsuario } from '../../dominio/enums';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'João da Silva' })
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  nome!: string;

  @ApiProperty({ example: '20231001' })
  @IsString()
  @IsNotEmpty({ message: 'A matrícula é obrigatória' })
  matricula!: string;

  @ApiProperty({ example: 'joao@faculdade.edu.br' })
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @ApiProperty({ example: 'senha123' })
  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  senha!: string;

  @ApiProperty({ enum: PerfilUsuario, example: PerfilUsuario.ALUNO })
  @IsEnum(PerfilUsuario, { message: 'Perfil inválido' })
  perfil!: PerfilUsuario;

  @ApiProperty({ 
    example: '20231001', 
    required: false, 
    description: 'Obrigatório apenas para o perfil RESPONSAVEL. Informar a matrícula escolar do aluno.' 
  })
  @IsString()
  @IsOptional()
  matriculaVinculada?: string;
}