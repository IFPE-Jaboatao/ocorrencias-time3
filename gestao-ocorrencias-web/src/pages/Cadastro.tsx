import { useState } from 'react';
import { Button, Card, TextInput, Label, Select, Alert } from 'flowbite-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  // 1. Criamos o estado para a matrícula
  const [matricula, setMatricula] = useState(''); 
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [perfil, setPerfil] = useState('ALUNO');
  
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagemErro('');
    setMensagemSucesso('');
    setCarregando(true);

    try {
      await api.post('/usuarios', {
        nome,
        matricula, // 2. Adicionamos a matrícula ao envio para o backend
        email,
        senha,
        perfil,
      });

      setMensagemSucesso('Registo efetuado com sucesso! A redirecionar para o login...');
      
      setNome('');
      setMatricula('');
      setEmail('');
      setSenha('');
      
      setTimeout(() => {
        navigate('/');
      }, 2500);

    } catch (error: any) {
      const erroServidor = error.response?.data?.message || 'Erro ao ligar ao servidor.';
      setMensagemErro(Array.isArray(erroServidor) ? erroServidor[0] : erroServidor);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Criar Nova Conta
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Preencha os dados abaixo para se registar no portal
        </p>
      </div>

      <div className="w-full max-w-md">
        <Card>
          <form className="flex flex-col gap-4" onSubmit={handleCadastro}>
            
            {mensagemSucesso && <Alert color="success">{mensagemSucesso}</Alert>}
            {mensagemErro && <Alert color="failure">{mensagemErro}</Alert>}
            
            <div>
              <div className="mb-2 block">
                <Label htmlFor="nome" value="Nome Completo" />
              </div>
              <TextInput
                id="nome"
                type="text"
                placeholder="Ex: Pedro Henrique"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={carregando}
              />
            </div>

            {/* 3. Adicionamos o campo visual da Matrícula */}
            <div>
              <div className="mb-2 block">
                <Label htmlFor="matricula" value="Matrícula" />
              </div>
              <TextInput
                id="matricula"
                type="text"
                placeholder="Ex: 2026012345"
                required
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                disabled={carregando}
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="email" value="E-mail Institucional" />
              </div>
              <TextInput
                id="email"
                type="email"
                placeholder="nome@instituicao.edu.br"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={carregando}
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="senha" value="Senha" />
              </div>
              <TextInput
                id="senha"
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                disabled={carregando}
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="perfil" value="Selecione o seu Perfil" />
              </div>
              <Select 
                id="perfil" 
                required 
                value={perfil} 
                onChange={(e) => setPerfil(e.target.value)}
                disabled={carregando}
              >
                <option value="ALUNO">Aluno</option>
                <option value="PROFESSOR">Professor</option>
                <option value="COORDENADOR">Coordenador</option>
                <option value="RESPONSAVEL">Responsável</option>
              </Select>
            </div>

            <Button type="submit" color="blue" className="mt-2" disabled={carregando}>
              {carregando ? 'A processar...' : 'Finalizar Registo'}
            </Button>

            <div className="mt-4 text-center text-sm text-gray-600">
              Já possui uma conta? <Link to="/" className="text-blue-600 hover:underline font-semibold">Faça Login aqui</Link>
            </div>
            
          </form>
        </Card>
      </div>
      
    </div>
  );
}