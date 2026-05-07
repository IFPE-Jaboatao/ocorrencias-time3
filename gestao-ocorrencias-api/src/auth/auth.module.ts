// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [
    UsuariosModule, // Importamos para o AuthService poder buscar o usuário
    JwtModule.register({
      global: true, // Permite usar o JwtService em qualquer lugar do app
      secret: 'CHAVE_SUPER_SECRETA_TCC_123', // Em produção, usar variáveis de ambiente!
      signOptions: { expiresIn: '8h' }, // Token expira em 8 horas
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}