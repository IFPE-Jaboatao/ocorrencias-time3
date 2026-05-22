import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ 
    example: 'professor@ifpe.edu.br',
    description: 'Email do utilizador registado'
  })
  @IsEmail({}, { message: 'O email deve ser válido' })
  email: string;

  @ApiProperty({ 
    example: 'senha123',
    description: 'Palavra-passe de acesso'
  })
  @IsNotEmpty({ message: 'A palavra-passe é obrigatória' })
  @MinLength(6, { message: 'A palavra-passe deve ter no mínimo 6 caracteres' })
  senha: string;
}