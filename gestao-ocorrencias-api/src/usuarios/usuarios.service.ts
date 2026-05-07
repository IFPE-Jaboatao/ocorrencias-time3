// src/usuarios/usuarios.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    // Regra de Negócio: Verifica se já existe um usuário com este email ou matrícula
    const usuarioExistente = await this.usuarioRepository.findOne({
      where: [
        { email: createUsuarioDto.email },
        { matricula: createUsuarioDto.matricula }
      ]
    });

    if (usuarioExistente) {
      throw new ConflictException('Já existe um usuário com este email ou matrícula cadastrado.');
    }

    const novoUsuario = this.usuarioRepository.create(createUsuarioDto);
    return await this.usuarioRepository.save(novoUsuario);
  }

  async findAll(): Promise<Usuario[]> {
    return await this.usuarioRepository.find();
  }
  // Adicione dentro de UsuariosService:
  async findByEmail(email: string): Promise<Usuario | null> {
    return await this.usuarioRepository.findOne({ where: { email } });
  }
}