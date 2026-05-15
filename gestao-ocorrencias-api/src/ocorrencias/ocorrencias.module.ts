import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OcorrenciasService } from './ocorrencias.service';
import { OcorrenciasController } from './ocorrencias.controller';
import { Ocorrencia } from './entities/ocorrencia.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { Evidencia } from './entities/evidencia.entity'; // <-- NOVA IMPORTAÇÃO

@Module({
  imports: [
    TypeOrmModule.forFeature([Ocorrencia, Usuario, Evidencia]), // <-- EVIDÊNCIA ADICIONADA AQUI
    AuditoriaModule,
  ],
  controllers: [OcorrenciasController],
  providers: [OcorrenciasService],
})
export class OcorrenciasModule {}