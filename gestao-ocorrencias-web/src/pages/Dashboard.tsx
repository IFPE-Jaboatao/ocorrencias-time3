import { useEffect, useState, useCallback } from 'react';
import { Button, Card, Spinner, Alert, Badge } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Novas Interfaces
interface UsuarioAluno {
  id: string;
  nome: string;
  matricula: string;
  perfil: string;
}

interface Ocorrencia {
  id: string;
  categoria?: string;
  titulo?: string;
  descricao: string;
  status: string;
  severidade: string;
  dataCriacao: string;
  usuario?: {
    nome: string;
  };
}

interface Estatisticas {
  total: number;
  indicadores: {
    porStatus: Array<{ status: string; quantidade: string }>;
    porSeveridade: Array<{ severidade: string; quantidade: string }>;
  };
}

export default function Dashboard() {
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [alunosCadastrados, setAlunosCadastrados] = useState<UsuarioAluno[]>([]); // Novo estado para os alunos
  
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [usuarioNome, setUsuarioNome] = useState('');
  const [usuarioPerfil, setUsuarioPerfil] = useState('');
  const [autorId, setAutorId] = useState('');

  // Estados do Modal
  const [modalAberto, setModalAberto] = useState(false);
  const [categoria, setCategoria] = useState('');
  const [descricao, setDescricao] = useState('');
  const [severidade, setSeveridade] = useState('BAIXA');
  const [alunoId, setAlunoId] = useState(''); 
  const [contextoAcademico, setContextoAcademico] = useState('');
  const [salvando, setSalvando] = useState(false);

  const navigate = useNavigate();

  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);
      setErro('');

      // 1. Busca Estatísticas
      try {
        const dashboardRes = await api.get('/ocorrencias/dashboard');
        setEstatisticas(dashboardRes.data);
      } catch (err: any) {
        console.warn('Dashboard restrito ou erro:', err.message);
      }

      // 2. Busca Ocorrências
      try {
        const ocorrenciasRes = await api.get('/ocorrencias');
        setOcorrencias(ocorrenciasRes.data || []);
      } catch (err: any) {
        if (err.response?.status === 403) {
          setErro('O seu perfil não tem permissão para aceder à lista de ocorrências.');
        } else {
          throw err;
        }
      }

      // 3. Busca Usuários (Para preencher o Select do Modal)
      try {
        const usuariosRes = await api.get('/usuarios');
        if (Array.isArray(usuariosRes.data)) {
          // Filtra para garantir que só apareçam usuários com o perfil ALUNO na lista
          const apenasAlunos = usuariosRes.data.filter((u: UsuarioAluno) => u.perfil === 'ALUNO');
          setAlunosCadastrados(apenasAlunos);
        }
      } catch (err: any) {
        console.warn('Erro ao buscar lista de alunos:', err.message);
      }

    } catch (err: any) {
      setErro('Não foi possível ligar ao servidor.');
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
    } finally {
      setCarregando(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payloadDecodificado = JSON.parse(window.atob(base64));

      setUsuarioNome(payloadDecodificado.nome || 'Usuário');
      setUsuarioPerfil(payloadDecodificado.perfil || 'ALUNO');
      setAutorId(payloadDecodificado.sub || payloadDecodificado.id || '');
    } catch (err) {
      localStorage.removeItem('token');
      navigate('/');
      return;
    }

    carregarDados();
  }, [carregarDados, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleCriarOcorrencia = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);

    try {
      await api.post('/ocorrencias', {
        alunoId: alunoId,
        autorId: autorId, 
        categoria: categoria,
        severidade: severidade,
        descricao: descricao,
        contextoAcademico: contextoAcademico ? contextoAcademico : undefined,
      });

      setCategoria('');
      setDescricao('');
      setSeveridade('BAIXA');
      setAlunoId('');
      setContextoAcademico('');
      setModalAberto(false);

      await carregarDados();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro de validação no servidor.');
      console.error(err.response?.data);
    } finally {
      setSalvando(false);
    }
  };

  const obterCorStatus = (status: string) => {
    switch (status) {
      case 'ABERTO': return 'info';
      case 'EM_ANDAMENTO': return 'warning';
      case 'FINALIZADA': return 'success';
      default: return 'gray';
    }
  };

  const obterCorSeveridade = (severidade: string) => {
    switch (severidade) {
      case 'BAIXA': return 'success';
      case 'MEDIA': return 'warning';
      case 'ALTA': return 'failure';
      default: return 'gray';
    }
  };

  const podeCriarOcorrencia = usuarioPerfil === 'PROFESSOR' || usuarioPerfil === 'COORDENADOR';
  const ehCoordenador = usuarioPerfil === 'COORDENADOR';
  const ehAlunoOuResponsavel = usuarioPerfil === 'ALUNO' || usuarioPerfil === 'RESPONSAVEL';

  if (carregando && ocorrencias.length === 0 && !erro) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <Spinner size="xl" aria-label="A carregar dados do sistema..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 relative">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">

        {/* CABEÇALHO */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-lg shadow-sm gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Painel de Ocorrências</h1>
            <p className="text-sm text-gray-500 mt-1">
              Bem-vindo(a), <span className="font-semibold text-gray-700">{usuarioNome}</span>
              <Badge color={ehCoordenador ? 'failure' : podeCriarOcorrencia ? 'warning' : 'info'} className="inline-block ml-2">
                {usuarioPerfil}
              </Badge>
            </p>
          </div>

          <div className="flex gap-3 w-full sm:w-auto justify-end">
            {podeCriarOcorrencia && (
              <Button color="blue" onClick={() => setModalAberto(true)}>
                + Nova Ocorrência
              </Button>
            )}
            <Button color="light" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>

        {erro && <Alert color="failure">{erro}</Alert>}

        {ehAlunoOuResponsavel && (
          <Alert color="info">
            <span>O seu perfil permite visualizar apenas ocorrências que foram <strong>Concluídas/Finalizadas</strong> pela coordenação.</span>
          </Alert>
        )}

        {/* ESTATÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <h5 className="text-xl font-bold text-gray-900">
              {ehAlunoOuResponsavel ? 'Ocorrências Concluídas' : 'Total de Ocorrências'}
            </h5>
            <p className="text-3xl text-blue-600 font-extrabold">{estatisticas?.total || 0}</p>
          </Card>

          {!ehAlunoOuResponsavel && (
            <>
              <Card>
                <h5 className="text-xl font-bold text-gray-900 flex justify-between items-center">
                  Status Gerais
                </h5>
                <div className="flex flex-col gap-1 mt-2">
                  {estatisticas?.indicadores?.porStatus?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm text-gray-600">
                      <span className="font-medium">{item.status}:</span>
                      <span className="font-bold text-gray-900">{item.quantidade}</span>
                    </div>
                  )) || <p className="text-gray-500 text-sm">Nenhum status registado.</p>}
                </div>
              </Card>

              <Card>
                <h5 className="text-xl font-bold text-gray-900">Severidade</h5>
                <div className="flex flex-col gap-1 mt-2">
                  {estatisticas?.indicadores?.porSeveridade?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm text-gray-600">
                      <span className="font-medium">{item.severidade}:</span>
                      <span className="font-bold text-gray-900">{item.quantidade}</span>
                    </div>
                  )) || <p className="text-gray-500 text-sm">Nenhuma severidade registada.</p>}
                </div>
              </Card>
            </>
          )}
        </div>

        {/* TABELA DE DADOS */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-700">Registos Gerais</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b">
                <tr>
                  <th className="px-6 py-3">Categoria/Título</th>
                  <th className="px-6 py-3">Criado por</th>
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3">Grau</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {ocorrencias.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Nenhuma ocorrência encontrada no sistema.
                    </td>
                  </tr>
                ) : (
                  ocorrencias.map((ocorrencia) => (
                    <tr key={ocorrencia.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                        {ocorrencia.categoria || ocorrencia.titulo || 'Sem categoria'}
                      </td>
                      <td className="px-6 py-4">{ocorrencia.usuario?.nome || 'Sistema'}</td>
                      <td className="px-6 py-4">
                        {ocorrencia.dataCriacao ? new Date(ocorrencia.dataCriacao).toLocaleDateString('pt-BR') : '---'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge color={obterCorSeveridade(ocorrencia.severidade)} className="w-fit">
                          {ocorrencia.severidade}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge color={obterCorStatus(ocorrencia.status)} className="w-fit">
                          {ocorrencia.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => alert(`Detalhes da ocorrência: ${ocorrencia.id}`)}
                          className="font-medium text-blue-600 hover:underline text-sm"
                        >
                          Visualizar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL COM SELECT DINÂMICO DE ALUNOS */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="flex justify-between items-start p-5 border-b rounded-t">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Abertura de Ocorrência Acadêmica</h3>
              </div>
              <button onClick={() => setModalAberto(false)} className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
                X
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              <form onSubmit={handleCriarOcorrencia} className="flex flex-col gap-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="categoria" className="block mb-2 text-sm font-medium text-gray-900">Categoria</label>
                    <input type="text" id="categoria" placeholder="Ex: Indisciplina, Atraso..." required
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      value={categoria} onChange={(e) => setCategoria(e.target.value)} />
                  </div>
                  
                  <div>
                    <label htmlFor="severidade" className="block mb-2 text-sm font-medium text-gray-900">Grau de Severidade</label>
                    <select id="severidade" required
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                      value={severidade} onChange={(e) => setSeveridade(e.target.value)}>
                      <option value="BAIXA">Baixa</option>
                      <option value="MEDIA">Média</option>
                      <option value="ALTA">Alta</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="contextoAcademico" className="block mb-2 text-sm font-medium text-gray-900">Contexto Acadêmico (Opcional)</label>
                  <input type="text" id="contextoAcademico" placeholder="Ex: Avaliação de Matemática, Aula de Física..."
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value={contextoAcademico} onChange={(e) => setContextoAcademico(e.target.value)} />
                </div>

                {/* NOVO CAMPO: Select puxando do Backend */}
                <div>
                  <label htmlFor="alunoId" className="block mb-2 text-sm font-medium text-gray-900">Aluno Envolvido</label>
                  <select 
                    id="alunoId" 
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    value={alunoId} 
                    onChange={(e) => setAlunoId(e.target.value)}
                  >
                    <option value="" disabled>Selecione um aluno da lista...</option>
                    {alunosCadastrados.map(aluno => (
                      <option key={aluno.id} value={aluno.id}>
                        {aluno.nome} (Matrícula: {aluno.matricula || 'Sem matrícula'})
                      </option>
                    ))}
                  </select>
                  {alunosCadastrados.length === 0 && (
                    <p className="mt-1 text-xs text-red-500">Nenhum aluno foi encontrado no banco de dados.</p>
                  )}
                </div>

                <div>
                  <label htmlFor="descricao" className="block mb-2 text-sm font-medium text-gray-900">Descrição Detalhada do Fato</label>
                  <textarea id="descricao" placeholder="Relate o que aconteceu de forma objetiva..." required rows={3}
                    className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    value={descricao} onChange={(e) => setDescricao(e.target.value)} />
                </div>

                <div className="w-full mt-4 border-t pt-4 flex justify-end gap-3">
                  <Button color="gray" onClick={() => setModalAberto(false)} disabled={salvando}>
                    Cancelar
                  </Button>
                  <Button type="submit" color="blue" isProcessing={salvando}>
                    Registrar Ocorrência
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}