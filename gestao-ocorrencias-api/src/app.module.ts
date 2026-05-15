import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsuariosModule } from './usuarios/usuarios.module';
import { OcorrenciasModule } from './ocorrencias/ocorrencias.module';
import { AuthModule } from './auth/auth.module';
import { AuditoriaModule } from './auditoria/auditoria.module';

@Module({
  imports: [
    ConfigModule.forRoot(), 
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root', // Coloque o seu usuário do MySQL aqui
      password: 'Lanpadatv@12', // Coloque a sua senha do MySQL aqui
      database: 'gestao_ocorrencias',
      autoLoadEntities: true, 
      
      synchronize: true, 
    }),
    UsuariosModule,
    OcorrenciasModule,
    AuthModule,
    AuditoriaModule,
  ],
})
export class AppModule {}