// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService,
  ) {}

  async loginSimulado(email: string) {
    // 1. Busca o usuário pelo email
    const usuario = await this.usuariosService.findByEmail(email);
    
    if (!usuario) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    // 2. Cria o "Payload" (os dados que vão dentro do token)
    const payload = { sub: usuario.id, email: usuario.email, perfil: usuario.perfil };

    // 3. Retorna o token gerado
    return {
      access_token: await this.jwtService.signAsync(payload),
      usuario: { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil }
    };
  }
}