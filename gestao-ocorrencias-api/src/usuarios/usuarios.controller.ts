import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { RolesGuard } from '../dominio/auth/roles.guard';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Usuários') // Organiza no Swagger
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 409, description: 'Conflito: Email ou matrícula já existem.' })
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Post('perfil/foto')
  @ApiOperation({ summary: 'Faz o upload da foto de perfil do usuário logado' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        foto: { // Aqui o nome é "foto"
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBearerAuth()
  uploadFoto(@UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 2000000 }), // Limite de 2MB para fotos de perfil
        new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
      ],
    }),
  ) foto: Express.Multer.File, @Req() req: any) {
    // Usamos o ID que vem do Token JWT
    return this.usuariosService.atualizarFoto(req.user.sub, foto.filename);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os usuários' })
  findAll() {
    return this.usuariosService.findAll();
  }
}