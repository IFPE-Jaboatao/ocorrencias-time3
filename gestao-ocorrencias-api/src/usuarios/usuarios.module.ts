// src/usuarios/usuarios.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuario } from './entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])], // Permite injetar o Repository no Service
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService], // Exportamos para poder usar em outros módulos (como o de Ocorrências)
})
export class UsuariosModule {}