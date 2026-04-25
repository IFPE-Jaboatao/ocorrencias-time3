// src/ocorrencias/dto/create-ocorrencia.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SeveridadeOcorrencia } from '../../dominio/enums';

export class CreateOcorrenciaDto {
  @ApiProperty({ description: 'ID do aluno que sofreu a ocorrência' })
  @IsUUID('all', { message: 'ID do aluno inválido' })
  @IsNotEmpty()
  alunoId!: string;

  @ApiProperty({ description: 'ID do professor/admin que está registrando' })
  @IsUUID('all', { message: 'ID do autor inválido' })
  @IsNotEmpty()
  autorId!: string;

  @ApiProperty({ example: 'Indisciplina' })
  @IsString()
  @IsNotEmpty()
  categoria!: string;

  @ApiProperty({ enum: SeveridadeOcorrencia, example: SeveridadeOcorrencia.MEDIA })
  @IsEnum(SeveridadeOcorrencia)
  severidade!: SeveridadeOcorrencia;

  @ApiProperty({ example: 'Aluno utilizou o celular durante a prova.' })
  @IsString()
  @IsNotEmpty()
  descricao!: string;

  @ApiProperty({ required: false, example: 'Avaliação de Matemática' })
  @IsString()
  @IsOptional()
  contextoAcademico?: string;
}