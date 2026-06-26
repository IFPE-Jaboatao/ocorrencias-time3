import { useEffect, useState, useCallback } from 'react';
import { Button, Card, Spinner, Alert, Badge, Table, Modal, Label, TextInput, Textarea, Select } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Ocorrencia {
  id: string;
  titulo: string;
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
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  
  const [usuarioNome, setUsuarioNome] = useState('');
  const [usuarioPerfil, setUsuarioPerfil] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novaDescricao, setNovaDescricao] = useState('');
  const [novaSeveridade, setNovaSeveridade] = useState('BAIXA');
  const [salvando, setSalvando] = useState(false);

  const navigate = useNavigate();

  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);
      setErro('');
      
      const [dashboardRes, ocorrenciasRes] = await Promise.all([
        api.get('/ocorrencias/dashboard'),
        api.get('/ocorrencias')
      ]);
      
      setEstatisticas(dashboardRes.data);
      setOcorrencias(ocorrenciasRes.data || []);
    } catch (err: any) {
      console.error('Erro na requisição:', err);
      setErro('Não foi possível carregar todos os dados do painel.');
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
        titulo: novoTitulo,
        descricao: novaDescricao,
        severidade: novaSeveridade,
      });

      setNovoTitulo('');
      setNovaDescricao('');
      setNovaSeveridade('BAIXA');
      setModalAberto(false);

      await carregarDados();
      
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao criar a ocorrência');
    } finally {
      setSalvando(false);
    }
  };

  const obtenerCorStatus = (status: string) => {
    switch (status) {
      case 'ABERTO': return 'info';
      case 'EM_ANDAMENTO': return 'warning';
      case 'FINALIZADA': return 'success';
      default: return 'gray';
    }
  };

  const obtenerCorSeveridade = (severidade: string) => {
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
        <Spinner size="xl" aria-label="Carregando dados do sistema..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-lg shadow-sm gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Painel de Ocorrências</h1>
            <p className="text-sm text-gray-500 mt-1">
              Bem-vindo, <span className="font-semibold text-gray-700">{usuarioNome}</span> 
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
            <span>Seu perfil permite visualizar apenas ocorrências que foram <strong>Concluídas/Finalizadas</strong> pela coordenação.</span>
          </Alert>
        )}

        {/* Área de Indicadores */}
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
                  {ehCoordenador && <span className="text-xs text-red-600 font-normal">(Pode alterar status)</span>}
                </h5>
                <div className="flex flex-col gap-1 mt-2">
                  {/* PROTEÇÃO ADICIONADA AQUI COM ?. e || [] */}
                  {estatisticas?.indicadores?.porStatus?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm text-gray-600">
                      <span className="font-medium">{item.status}:</span>
                      <span className="font-bold text-gray-900">{item.quantidade}</span>
                    </div>
                  )) || <p className="text-gray-500 text-sm">Nenhum status registrado.</p>}
                </div>
              </Card>

              <Card>
                <h5 className="text-xl font-bold text-gray-900">Severidade</h5>
                <div className="flex flex-col gap-1 mt-2">
                  {/* PROTEÇÃO ADICIONADA AQUI COM ?. e || [] */}
                  {estatisticas?.indicadores?.porSeveridade?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm text-gray-600">
                      <span className="font-medium">{item.severidade}:</span>
                      <span className="font-bold text-gray-900">{item.quantidade}</span>
                    </div>
                  )) || <p className="text-gray-500 text-sm">Nenhuma severidade registrada.</p>}
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Tabela de Ocorrências */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-700">Registros Gerais</h3>
          </div>
          
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Título</Table.HeadCell>
                <Table.HeadCell>Criado por</Table.HeadCell>
                <Table.HeadCell>Data</Table.HeadCell>
                <Table.HeadCell>Severidade</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Ações</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {ocorrencias.length === 0 ? (
                  <Table.Row className="bg-white">
                    <Table.Cell colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhuma ocorrência encontrada no sistema.
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  ocorrencias.map((ocorrencia) => (
                    <Table.Row key={ocorrencia.id} className="bg-white">
                      <Table.Cell className="whitespace-nowrap font-semibold text-gray-900">
                        {ocorrencia.titulo}
                      </Table.Cell>
                      <Table.Cell>{ocorrencia.usuario?.nome || 'Sistema'}</Table.Cell>
                      <Table.Cell>
                        {ocorrencia.dataCriacao ? new Date(ocorrencia.dataCriacao).toLocaleDateString('pt-BR') : '---'}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={obterCorSeveridade(ocorrencia.severidade)} className="w-fit">
                          {ocorrencia.severidade}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={obterCorStatus(ocorrencia.status)} className="w-fit">
                          {ocorrencia.status}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <button 
                          onClick={() => alert(`Detalhes da ocorrência: ${ocorrencia.id}`)}
                          className="font-medium text-blue-600 hover:underline text-sm"
                        >
                          Visualizar
                        </button>
                        {ehCoordenador && (
                          <button 
                            onClick={() => alert(`Editar status da ocorrência: ${ocorrencia.id}`)}
                            className="font-medium text-red-600 hover:underline text-sm ml-4"
                          >
                            Gerenciar
                          </button>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
          </div>
        </div>
      </div>

      {/* Modal de Criação */}
      <Modal show={modalAberto} size="md" onClose={() => setModalAberto(false)} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-900">Registrar Ocorrência</h3>
            
            <form onSubmit={handleCriarOcorrencia} className="flex flex-col gap-4">
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="titulo" value="Título" />
                </div>
                <TextInput
                  id="titulo"
                  placeholder="Resumo do ocorrido"
                  required
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                />
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="descricao" value="Descrição Detalhada" />
                </div>
                <Textarea
                  id="descricao"
                  placeholder="Descreva o que aconteceu..."
                  required
                  rows={4}
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                />
              </div>

              <div>
                <div className="mb-2 block">
                  <Label htmlFor="severidade" value="Severidade" />
                </div>
                <Select
                  id="severidade"
                  required
                  value={novaSeveridade}
                  onChange={(e) => setNovaSeveridade(e.target.value)}
                >
                  <option value="BAIXA">Baixa</option>
                  <option value="MEDIA">Média</option>
                  <option value="ALTA">Alta</option>
                </Select>
              </div>

              <div className="w-full mt-2">
                <Button type="submit" color="blue" isProcessing={salvando} className="w-full">
                  Salvar Ocorrência
                </Button>
              </div>
            </form>
          </div>
        </Modal.Body>
      </Modal>

    </div>
  );
}