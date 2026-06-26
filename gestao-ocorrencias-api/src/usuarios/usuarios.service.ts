import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { PerfilUsuario } from '../dominio/enums';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    // 1. Verifica se já existe um usuário com este email ou matrícula
    const usuarioExistente = await this.usuarioRepository.findOne({
      where: [
        { email: createUsuarioDto.email },
        { matricula: createUsuarioDto.matricula }
      ]
    });

    if (usuarioExistente) {
      throw new ConflictException('Já existe um usuário com este email ou matrícula cadastrado.');
    }

    // 2. Regra de Negócio: Validação para o perfil RESPONSAVEL
    if (createUsuarioDto.perfil === PerfilUsuario.RESPONSAVEL) {
      if (!createUsuarioDto.matriculaVinculada) {
        throw new BadRequestException('A matrícula do aluno vinculado é obrigatória para o cadastro de responsáveis.');
      }

      // Verifica se o aluno com essa matrícula realmente existe no banco e se é de fato um ALUNO
      const alunoVinculado = await this.usuarioRepository.findOne({
        where: { 
          matricula: createUsuarioDto.matriculaVinculada, 
          perfil: PerfilUsuario.ALUNO 
        }
      });

      if (!alunoVinculado) {
        throw new NotFoundException('O aluno com a matrícula informada não foi encontrado no sistema.');
      }
    }

    // 3. Criptografia da senha
    const saltRounds = 10;
    const senhaCriptografada = await bcrypt.hash(createUsuarioDto.senha, saltRounds);

    // 4. Cria e salva o usuário
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