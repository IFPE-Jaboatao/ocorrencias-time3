// src/auditoria/auditoria.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { RolesGuard } from '../dominio/auth/roles.guard';
import { Perfis } from '../dominio/auth/perfis.decorator';
import { PerfilUsuario } from '../dominio/enums';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auditoria')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @Perfis(PerfilUsuario.ADMIN, PerfilUsuario.COORDENADOR)
  @ApiOperation({ summary: 'Lista todos os logs de auditoria do sistema' })
  findAll() {
    return this.auditoriaService.listarLogs();
  }
}