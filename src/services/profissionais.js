import { getSupabaseClient } from './supabase';

const PROFISSOES = {
  arquiteto: 'Arquiteto(a)', 'arquiteto-urbanista': 'Arquiteto(a) e Urbanista',
  urbanista: 'Urbanista', 'engenheiro-civil': 'Engenheiro(a) Civil',
  'engenheiro-eletrico': 'Engenheiro(a) Eletricista', 'engenheiro-mecanico': 'Engenheiro(a) Mecânico(a)',
  'engenheiro-sanitarista': 'Engenheiro(a) Sanitarista', 'engenheiro-ambiental': 'Engenheiro(a) Ambiental',
  'designer-de-interiores': 'Designer de Interiores', 'desenhista-projetista': 'Desenhista Projetista',
  'desenhista-cadista': 'Desenhista CAD', 'projetista-arquitetonico': 'Projetista Arquitetônico',
  'projetista-de-edificacoes': 'Projetista de Edificações', 'tecnico-em-edificacoes': 'Técnico(a) em Edificações',
  'modelador-3d': 'Modelador(a) 3D', 'artista-3d': 'Artista 3D', 'renderizador-3d': 'Renderizador(a) 3D',
  'especialista-bim': 'Especialista BIM', 'coordenador-bim': 'Coordenador(a) BIM',
  'projetista-eletrico': 'Projetista Elétrico', 'projetista-hidraulico': 'Projetista Hidráulico',
  'projetista-estrutural': 'Projetista Estrutural', 'projetista-sanitario': 'Projetista Sanitário',
  'projetista-de-incendio': 'Projetista de Prevenção contra Incêndio',
  'projetista-de-climatizacao': 'Projetista de Climatização', 'calculista-estrutural': 'Calculista Estrutural',
  'tecnico-em-construcao': 'Técnico(a) em Construção Civil', 'tecnico-em-estruturas': 'Técnico(a) em Estruturas',
  topografo: 'Topógrafo(a)', 'tecnico-em-topografia': 'Técnico(a) em Topografia',
  agrimensor: 'Agrimensor(a)', paisagista: 'Paisagista',
  'projetista-de-paisagismo': 'Projetista de Paisagismo', 'planejador-de-obras': 'Planejador(a) de Obras',
  'gestor-de-projetos': 'Gestor(a) de Projetos', 'compatibilizador-de-projetos': 'Compatibilizador(a) de Projetos',
  'consultor-em-arquitetura': 'Consultor(a) em Arquitetura',
  'consultor-em-projetos': 'Consultor(a) em Projetos', outro: 'Outro profissional da área',
};
const STATUS = {
  pending_document: 'Documento pendente', pending_review: 'Em análise',
  verified: 'Verificado', rejected: 'Documento recusado', not_applicable: 'Cadastro ativo',
};
function formatarProfissional(registro) {
  return {
    id: String(registro.id), nome: registro.full_name || 'Profissional',
    profissao: registro.profession || '',
    profissaoNome: PROFISSOES[registro.profession] || registro.profession || 'Profissional',
    cidade: registro.city || '', estado: registro.state || '',
    registro: registro.professional_registration || '',
    statusVerificacao: registro.verification_status || 'pending_document',
    statusLabel: STATUS[registro.verification_status] || 'Em análise',
    criadoEm: registro.created_at || null, foto: null,
  };
}
export async function listarProfissionais() {
  const { data, error } = await getSupabaseClient().rpc('list_public_professionals');
  if (error) throw error;
  return (data || []).map(formatarProfissional);
}
export async function buscarProfissional(id) {
  if (!id) return null;
  const { data, error } = await getSupabaseClient().rpc('get_public_professional', { p_professional_id: id });
  if (error) throw error;
  const registro = Array.isArray(data) ? data[0] : data;
  return registro ? formatarProfissional(registro) : null;
}
