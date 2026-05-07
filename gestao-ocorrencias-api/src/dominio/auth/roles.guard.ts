// src/dominio/auth/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PERFIS_KEY } from './perfis.decorator';
import { PerfilUsuario } from '../enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Descobre quais perfis têm permissão para acessar a rota
    const perfisNecessarios = this.reflector.getAllAndOverride<PerfilUsuario[]>(PERFIS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!perfisNecessarios) return true; // Se a rota não tem a anotação @Perfis, é pública.

    const request = context.switchToHttp().getRequest();
    const token = this.extrairTokenDaRequisicao(request);

    if (!token) throw new UnauthorizedException('Token de autenticação não fornecido.');

    try {
      // Abre o token e coloca os dados do usuário dentro de "request.user"
      const payload = await this.jwtService.verifyAsync(token, { secret: 'CHAVE_SUPER_SECRETA_TCC_123' });
      request.user = payload;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado.');
    }

    // RBAC: Verifica se o perfil do usuário logado está na lista de perfis permitidos
    const temPermissao = perfisNecessarios.includes(request.user.perfil);
    if (!temPermissao) {
      throw new ForbiddenException('Seu perfil não tem permissão para acessar este recurso.');
    }

    return true;
  }

  private extrairTokenDaRequisicao(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}