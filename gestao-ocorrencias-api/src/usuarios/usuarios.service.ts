import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import * as bcrypt from 'bcrypt'; // <-- 1. Importação do bcrypt adicionada aqui

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

    // <-- 2. A mágica da criptografia acontece aqui
    const saltRounds = 10;
    const senhaCriptografada = await bcrypt.hash(createUsuarioDto.senha, saltRounds);

    // 3. Criamos o usuário substituindo a senha original pela senha protegida
    const novoUsuario = this.usuarioRepository.create({
      ...createUsuarioDto,
      senha: senhaCriptografada, 
    });
    
    return await this.usuarioRepository.save(novoUsuario);
  }

  async atualizarFoto(usuarioId: string, nomeFicheiro: string) {
    const usuario = await this.usuarioRepository.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');

    usuario.fotoPerfil = nomeFicheiro;
    return await this.usuarioRepository.save(usuario);
  }

  async findAll(): Promise<Usuario[]> {
    return await this.usuarioRepository.find();
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return await this.usuarioRepository.findOne({ where: { email } });
  }
}