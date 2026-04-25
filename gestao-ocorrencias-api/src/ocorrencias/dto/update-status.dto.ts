// src/ocorrencias/dto/update-status.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatusOcorrencia } from '../../dominio/enums';

export class UpdateStatusDto {
  @ApiProperty({ enum: StatusOcorrencia, example: StatusOcorrencia.EM_ACOMPANHAMENTO })
  @IsEnum(StatusOcorrencia, { message: 'Status inválido' })
  @IsNotEmpty({ message: 'O status é obrigatório' })
  status!: StatusOcorrencia;

  @ApiProperty({ required: false, description: 'Obrigatório caso a ocorrência atual já esteja Resolvida' })
  @IsString()
  @IsOptional()
  justificativa?: string;
}