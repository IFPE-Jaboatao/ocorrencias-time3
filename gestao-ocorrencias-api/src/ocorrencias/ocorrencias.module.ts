import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OcorrenciasService } from './ocorrencias.service';
import { OcorrenciasController } from './ocorrencias.controller';
import { Ocorrencia } from './entities/ocorrencia.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ocorrencia, Usuario]),
    AuditoriaModule, // A vírgula aqui separa os módulos importados
  ], // <-- A vírgula aqui (que provavelmente estava faltando) separa o array de imports dos controllers
  controllers: [OcorrenciasController],
  providers: [OcorrenciasService],
})
export class OcorrenciasModule {}