import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Usuario } from './usuarios/entities/usuario.entity';
import { Ocorrencia } from './ocorrencias/entities/ocorrencia.entity';
import { UsuariosModule } from './usuarios/usuarios.module';
import { OcorrenciasModule } from './ocorrencias/ocorrencias.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Carrega variáveis de ambiente (útil para não deixar senhas hardcoded no futuro)
    ConfigModule.forRoot(), 
    
    // Configuração da conexão com o MySQL
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root', // Coloque o seu usuário do MySQL aqui
      password: 'Lanpadatv@12', // Coloque a sua senha do MySQL aqui
      database: 'gestao_ocorrencias',
      entities: [Usuario, Ocorrencia],
      synchronize: true, // Cria as tabelas automaticamente (use apenas em ambiente de desenvolvimento)
    }), UsuariosModule, OcorrenciasModule, AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}