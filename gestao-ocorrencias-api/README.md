# Sistema de Gestão de Ocorrências Acadêmicas - API REST

Este repositório contém o backend (API REST) do Sistema de Gestão de Ocorrências Acadêmicas. O sistema foi desenvolvido para permitir que a instituição registre, monitore e audite infrações e eventos pedagógicos de forma segura, implementando regras de negócio reais, controle de acesso e rastreabilidade.

## 🛠️ Tecnologias Utilizadas

* **Framework:** [NestJS](https://nestjs.com/) (Node.js)
* **Linguagem:** TypeScript
* **Banco de Dados:** MySQL
* **ORM:** TypeORM
* **Autenticação:** JWT (JSON Web Token) + Bcrypt
* **Documentação:** Swagger / OpenAPI
* **Upload de Arquivos:** Multer

## ✨ Funcionalidades Principais e Regras de Negócio

1. **Gestão de Identidade e Acesso (IAM)**
   * Autenticação segura com senhas criptografadas.
   * Controle de acesso baseado em perfis (RBAC): *Aluno, Professor, Coordenador, Equipe Pedagógica e Admin*.
   * Restrição rigorosa de rotas (ex: alunos não podem registrar ocorrências, apenas visualizá-las).

2. **Core de Ocorrências**
   * CRUD completo para gerenciamento de ocorrências.
   * Isolamento de dados: usuários com perfil de aluno visualizam apenas ocorrências vinculadas ao próprio ID.
   * Fluxo de status controlado (ABERTA, EM ANÁLISE, RESOLVIDA) e níveis de severidade.

3. **Auditoria e Rastreabilidade**
   * Registro automático de logs a cada alteração de status de uma ocorrência, armazenando o autor da mudança, o status anterior e o novo status.

4. **Gestão de Mídias**
   * Upload de foto de perfil de usuários.
   * Anexo de evidências (imagens ou PDFs) para fundamentar as ocorrências, com validação rigorosa de tamanho e formato.

## 🚀 Como Executar o Projeto

### Pré-requisitos
* Node.js instalado (versão 18 ou superior).
* MySQL rodando localmente ou em container.

