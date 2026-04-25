import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ativa a validação global (Garante que os dados enviados estejam corretos)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remove campos que não estão no DTO
    forbidNonWhitelisted: true, // Retorna erro se enviarem campos extras
    transform: true, // Transforma os dados para os tipos corretos
  }));

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Gestão de Ocorrências Acadêmicas')
    .setDescription('API REST para gestão de ocorrências, usuários e relatórios.')
    .setVersion('1.0')
    .addBearerAuth() // Prepara para a parte de Autenticação/Autorização
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // O servidor vai rodar na porta 3000
  await app.listen(3000);
  console.log(`Aplicação rodando em: http://localhost:3000`);
  console.log(`Documentação Swagger em: http://localhost:3000/api/docs`);
}
bootstrap();