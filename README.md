# Sistema de Gestão de Ocorrências Acadêmicas - API REST

Este é o backend do Sistema de Gestão de Ocorrências Acadêmicas, desenvolvido como parte da Avaliação 1 da disciplina de Desenvolvimento Web. O sistema oferece uma API RESTful completa para gerenciar infrações, ocorrências e indicadores pedagógicos.

## 🚀 Tecnologias Utilizadas

* **Node.js** com **NestJS** (Arquitetura modular e injeção de dependências)
* **TypeScript** (Tipagem estática e segurança)
* **MySQL** (Banco de Dados Relacional)
* **TypeORM** (Mapeamento Objeto-Relacional e QueryBuilder)
* **JWT (JSON Web Token)** (Autenticação e Autorização)
* **Swagger** (Documentação interativa da API)

## ⚙️ Regras de Negócio Implementadas

Conforme as jornadas de usuário, as seguintes regras foram estritamente aplicadas no core da aplicação:
1. **Controle de Acesso (RBAC):** Rotas protegidas por `RolesGuard`. Apenas professores, coordenadores e admins podem registrar ocorrências.
2. **Escalonamento Automático:** Ocorrências registradas com severidade "ALTA" disparam alertas automáticos para validação da coordenação.
3. **Auditoria de Status:** É expressamente proibido alterar uma ocorrência "RESOLVIDA" sem o envio de uma justificativa formal.
4. **Isolamento de Visibilidade:** Alunos só podem visualizar ocorrências em que estão diretamente envolvidos.
5. **Rastreabilidade (Log de Auditoria):** O sistema grava de forma assíncrona todas as atualizações de status para fins de conformidade.
6. **Dashboard Gerencial:** Agregação de dados otimizada via banco de dados (QueryBuilder) para contagem de severidade e status.

## 🛠️ Como Executar o Projeto Localmente

### 1. Pré-requisitos
* Node.js instalado (v18+)
* Servidor MySQL rodando localmente (porta 3306)

### 2. Configuração do Banco de Dados
Crie um banco de dados no seu MySQL chamado:
\`\`\`sql
CREATE DATABASE gestao_ocorrencias;
\`\`\`
*(Atenção: verifique se o usuário e senha do MySQL no arquivo `src/app.module.ts` correspondem à sua máquina local).*

### 3. Instalação e Execução
No terminal da raiz do projeto, execute:
\`\`\`bash
# Instalar dependências
npm install

# Rodar o servidor em modo de desenvolvimento
npm run start:dev
\`\`\`

## 📚 Documentação da API (Swagger)
Com o servidor rodando, acesse a documentação interativa pelo navegador:
👉 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**