import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Faz o login simulado e retorna o Token JWT' })
  @ApiBody({ type: LoginDto }) 
  login(@Body() loginDto: LoginDto) {
    // Aqui chamamos o 'loginSimulado' e passamos apenas o email, 
    // tal como o seu AuthService está a pedir!
    return this.authService.loginSimulado(loginDto.email);
  }
}