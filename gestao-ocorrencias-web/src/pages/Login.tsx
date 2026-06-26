import { useState } from 'react';
import { Button, Card, TextInput, Label, Alert } from 'flowbite-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  // Estados para gerenciar carregamento e erros
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (email === '' || senha === '') {
      setErro('Por favor, preencha todos os campos.');
      return;
    }

    setCarregando(true);

    try {
      // Faz a requisição POST para a rota de login do seu backend
      const response = await api.post('/auth/login', {
        email,
        senha,
      });

      // Salva o token de autenticação no navegador
      if (response.data && response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
      }

      // Redireciona o usuário para o Dashboard
      navigate('/dashboard');

    } catch (error: any) {
      // Captura o erro do backend (ex: "Credenciais inválidas")
      const erroServidor = error.response?.data?.message || 'E-mail ou senha incorretos.';
      setErro(Array.isArray(erroServidor) ? erroServidor[0] : erroServidor);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="mx-auto h-16 w-16 bg-blue-700 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">
          Portal Acadêmico
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Sistema de Gestão de Ocorrências
        </p>
      </div>

      <div className="w-full max-w-md">
        <Card>
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            
            {/* Alerta visual caso dê erro no login */}
            {erro && (
              <Alert color="failure" onDismiss={() => setErro('')}>
                <span>{erro}</span>
              </Alert>
            )}

            <div>
              <div className="mb-2 block">
                <Label htmlFor="email" value="Seu e-mail institucional" />
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
              <div className="mb-2 block flex justify-between">
                <Label htmlFor="senha" value="Sua senha" />
                <a href="#" className="text-sm text-blue-600 hover:underline">Esqueceu a senha?</a>
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

            <Button type="submit" color="blue" className="mt-2" disabled={carregando}>
              {carregando ? 'Autenticando...' : 'Entrar no Sistema'}
            </Button>

            <div className="mt-4 text-center text-sm text-gray-600">
              Não tem uma conta? <Link to="/cadastro" className="text-blue-600 hover:underline font-semibold">Cadastre-se aqui</Link>
            </div>
            
          </form>
        </Card>
      </div>
      
    </div>
  );
}