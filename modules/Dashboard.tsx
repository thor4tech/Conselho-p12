
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, Button, Spinner } from '../components';
import { UserProfile, StrategicAssessment, PhaseAssessment, BehavioralAssessment } from '../types';
import { fetchCollection, saveDocument, formatCurrency, formatDate, deleteDocument, db, getCollectionPath } from '../services';
import { AlertTriangle, CheckCircle, BrainCircuit, Save, History, Trash2, Eye, Loader2, ChevronDown, ChevronUp, UserCheck, Heart, Zap, Lightbulb } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";

// --- DASHBOARD (HOME) ---

export const Dashboard = ({ user }: { user: UserProfile }) => {
  const [metrics, setMetrics] = useState({
    phase: 'Carregando...',
    revenue: 0,
    teamScore: 0,
    nextTask: 'Sem tarefas pendentes'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Fase da Empresa (Última análise de fases)
        const phasesDocs = await fetchCollection(user.uid, 'diagnose_phases', 'createdAt');
        const lastPhase = phasesDocs.length > 0 ? (phasesDocs[0] as any).phaseName : 'Iniciar Diagnóstico';

        // 2. Faturamento (Mês atual)
        const now = new Date();
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const revDocs = await fetchCollection(user.uid, 'finance_plan');
        const currentRev = revDocs.find((d:any) => d.month === monthKey);
        const revenue = currentRev ? currentRev.revenue : 0;

        // 3. Saúde do Time (Média Avaliações)
        const evalDocs = await fetchCollection(user.uid, 'people_evaluations');
        const avgScore = evalDocs.length > 0 
          ? evalDocs.reduce((acc: number, curr: any) => acc + curr.performanceScore, 0) / evalDocs.length 
          : 0;

        // 4. Próxima Tarefa
        const projects = await fetchCollection(user.uid, 'projects_default_tasks'); // Usando coleção simplificada do Kanban
        let nextTask = "Nenhuma";
        const todoTasks = projects.filter((t:any) => t.status === 'todo');
        if (todoTasks.length > 0) nextTask = (todoTasks[0] as any).title;

        setMetrics({ phase: lastPhase, revenue, teamScore: avgScore, nextTask });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user.uid]);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Painel Geral</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-amber-500">
          <div className="text-slate-400 text-sm mb-1">Fase da Empresa</div>
          <div className="text-xl font-bold text-slate-100">{metrics.phase}</div>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <div className="text-slate-400 text-sm mb-1">Faturamento Atual</div>
          <div className="text-xl font-bold text-slate-100">{formatCurrency(metrics.revenue)}</div>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <div className="text-slate-400 text-sm mb-1">Saúde do Time</div>
          <div className="text-xl font-bold text-slate-100">{metrics.teamScore.toFixed(1)} / 10</div>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <div className="text-slate-400 text-sm mb-1">Próxima Prioridade</div>
          <div className="text-xl font-bold text-slate-100 truncate">{metrics.nextTask}</div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-medium text-slate-100 mb-4">Atividade Recente</h3>
        <div className="text-slate-400 text-sm">
           Sistema inicializado com sucesso. Bem-vindo ao Conselho P12.
        </div>
      </Card>
    </div>
  );
};

// --- DATA - STRATEGIC QUESTIONS (A-Z) ---
const strategicQuestions = [
  { id: 'A', text: 'Todas as questões bancárias da empresa dependem de mim.', type: 'Operacional' },
  { id: 'B', text: 'Realizo ao menos uma reunião de alinhamento semanal com cada setor da empresa.', type: 'Tático' },
  { id: 'C', text: 'Recebo o relatório financeiro pronto e faço análise mensal da empresa.', type: 'Estratégico' },
  { id: 'D', text: 'Faço uma reunião mensal e apresento os números para a equipe.', type: 'Estratégico' },
  { id: 'E', text: 'Passo um ou mais dias da semana desenvolvendo produto ou serviço.', type: 'Tático' },
  { id: 'F', text: 'Auxilio a equipe operacional sempre que a demanda aumenta ou acontece algum tipo de imprevisto.', type: 'Operacional' },
  { id: 'G', text: 'Participo ativamente na estratégia de vendas.', type: 'Estratégico' },
  { id: 'H', text: 'Recebo ligações e contatos diretos dos clientes sobre chamados e problemas.', type: 'Tático' },
  { id: 'I', text: 'Analiso os indicadores de performance e aprovo as ações de melhoria.', type: 'Estratégico' },
  { id: 'J', text: 'Visito clientes, analiso os processos e trago as melhorias para serem implementadas.', type: 'Tático' },
  { id: 'K', text: 'Tenho definidos os indicadores da empresa e faço reuniões de feedback sobre o desempenho', type: 'Estratégico' },
  { id: 'L', text: 'Sou responsável por resolver problemas técnicos como internet, telefone, ferramentas de terceiros e equipamentos defeituosos na empresa.', type: 'Operacional' },
  { id: 'M', text: 'Pesquiso novas tecnologias e ferramentas para melhorar o produto/serviço', type: 'Tático' },
  { id: 'N', text: 'Sou responsável pelo desenvolvimento de áreas específicas do produto / serviço que apenas eu tenho competência para alterar ou melhorar.', type: 'Operacional' },
  { id: 'O', text: 'Defino as estratégias comerciais, analiso o desempenho e promovo as melhorias.', type: 'Estratégico' },
  { id: 'P', text: 'Sou responsável por promover e acompanhar a manutenção nas estruturas físicas da empresa como equipamentos, pinturas, obras e etc.', type: 'Operacional' },
  { id: 'Q', text: 'Tenho em minha sala câmeras de segurança para monitorar o trabalho de todos os setores da empresa e resolvo os problemas quando aparecem.', type: 'Operacional' },
  { id: 'R', text: 'Tenho na minha sala um painel/tv/monitor/dashboard com os dados relevantes para a minha tomada de decisão diária na empresa.', type: 'Estratégico' },
  { id: 'S', text: 'Faço reuniões periódicas apenas com os líderes de cada setor da empresa, para monitorar o desempenho no setor não envolvendo os subordinados desses líderes.', type: 'Tático' },
  { id: 'T', text: 'Realizo todas as reuniões da empresa envolvem os colaboradores e os resultados são verificados individualmente.', type: 'Tático' },
  { id: 'U', text: 'Passo parte do meu tempo realizando correções de problemas relatados pelos clientes.', type: 'Operacional' },
  { id: 'V', text: 'Para cada cliente eu realizo uma negociação diferente e depende de mim a aprovação ou montagem do plano comercial individual.', type: 'Tático' },
  { id: 'X', text: 'Sou responsável por garantir o funcionamento das necessidades básicas da empresa, compras, materiais limpeza, materiais de cozinha e etc.', type: 'Operacional' },
  { id: 'Z', text: 'Participo ativamente das melhorias dos canais de aquisição da empresa buscando novas tendências e analisando o comportamento do mercado nos períodos anteriores', type: 'Estratégico' },
];

// --- DATA - COMPANY PHASES QUESTIONS (1-30) ---
const phaseQuestions = [
  "Possui o sonho definido e claro",
  "Possui a super visão escrita de forma clara com até 143 caracteres",
  "Possui uma visão para o ano, escrita, mensurável e divulgada em todos os níveis da empresa",
  "Possui proposta de valor escrita e define claramente qual é o diferencial competitivo",
  "Possui princípios e valores definidos e são divulgados em todos os níveis da organização",
  "A missão da empresa está definida e divulgada em toda a empresa",
  "A cultura da empresa está escrita e divulgada",
  "As metas anuais estão claras, divulgadas em todos os níveis da empresa",
  "Os preços dos produtos/serviços estão calculados e os respectivos lucros estão planejados",
  "O conceito de produto estrela está implantado",
  "Existe uma estratégia de marketing para pelo menos 3 canais de venda",
  "Existem indicadores de performance para cada canal de venda para analisar os funis",
  "Existe uma reunião formal de análise dos indicadores de venda e aplica-se PDCA",
  "Existe estratégia de venda para cada funil com os scripts definidos",
  "As principais objeções de venda são levantadas e existe script de quebra",
  "Está definido e implantado um processo eficiente de seleção e contratação",
  "Possui um processo formal de avaliação de desempenho e desenvolvimento pessoal",
  "Utiliza uma ferramenta de indicadores de performance nos 4 pilares da empresa",
  "Realiza planejamento financeiro de 12 meses, onde determina faturamento, despesas e lucro",
  "Realiza mensalmente reuniões de gestão onde as decisões estratégicas são debatidas",
  "Tem uma ferramenta para análise e planejamento do fluxo de caixa",
  "Possui e utiliza ferramentas de melhoria contínua (PDCA, SWOT, Gestão de Tempo)",
  "Existe um canal oficial de desenvolvimento espiritual dos funcionários",
  "Possui processos produtivos determinados por procedimentos e instruções de trabalho",
  "Possui organograma atual e futuro, com descrição de função de cada cargo",
  "Existe um processo de auditorias externas de qualidade",
  "Existe um processo de auditorias externas da área financeira e fiscal",
  "Existe um conselho administrativo implantado na empresa",
  "Faz ações sociais e contribui para a sociedade",
  "Percebe que o Reino está sendo implantado através da sua empresa"
];

// --- DATA - BEHAVIORAL PROFILE QUESTIONS ---
const profileNames: Record<number, string> = {
  1: "Perfeccionista",
  2: "Prestativo",
  3: "Realizador",
  4: "Exclusivo",
  5: "Observador",
  6: "Cauteloso",
  7: "Entusiasta",
  8: "Confrontador",
  9: "Pacificador"
};

const behavioralQuestions = [
  { id: 1, text: "Qual é a sua maior motivação interna?", options: [ { t: "Fazer as coisas da maneira correta e perfeita.", p: 1 }, { t: "Ser notado e reconhecido por ajudar as pessoas.", p: 2 }, { t: "Alcançar metas, ter sucesso e ser admirado.", p: 3 } ] },
  { id: 2, text: "O que mais te incomoda ou estressa no dia a dia?", options: [ { t: "A rotina e a sensação de não ser compreendido ou ouvido.", p: 4 }, { t: "A invasão do meu espaço e o excesso de demandas emocionais.", p: 5 }, { t: "Ameaças à segurança e a falta de controle sobre as situações.", p: 6 } ] },
  { id: 3, text: "Como você reage diante de um novo projeto?", options: [ { t: "Com muito entusiasmo, otimismo e buscando novidades.", p: 7 }, { t: "Assumindo o comando, com muita energia e pronto para o confronto se necessário.", p: 8 }, { t: "Buscando harmonizar a equipe e encontrar o caminho mais simples e pacífico.", p: 9 } ] },
  { id: 4, text: "Qual é o seu \"vício\" emocional ou tendência negativa quando sob pressão?", options: [ { t: "Raiva/Indignação quando as coisas saem errado.", p: 1 }, { t: "Orgulho (dificuldade em pedir ajuda, mas querer ajudar todos).", p: 2 }, { t: "Vaidade (preocupação excessiva com a imagem de sucesso).", p: 3 } ] },
  { id: 5, text: "Como você se vê em relação aos sentimentos?", options: [ { t: "Sou intenso, profundo e muitas vezes sinto que falta algo em mim (Inveja/Insatisfação).", p: 4 }, { t: "Prefiro reter meus sentimentos e economizar energia (Avareza).", p: 5 }, { t: "Sinto medo ou ansiedade em relação ao futuro e riscos (Medo).", p: 6 } ] },
  { id: 6, text: "Qual frase melhor define sua busca pessoal?", options: [ { t: "Buscar o prazer e evitar a dor ou tédio (Gula por novidades).", p: 7 }, { t: "Exercer domínio, força e não demonstrar fraqueza (Luxúria/Excesso).", p: 8 }, { t: "Manter a paz e evitar conflitos a todo custo (Preguiça de confrontar).", p: 9 } ] },
  { id: 7, text: "No ambiente de trabalho, como você lidera ou prefere ser liderado?", options: [ { t: "Foco nos detalhes, na meritocracia e no dever acima do prazer.", p: 1 }, { t: "Foco nas pessoas, criando um ambiente acolhedor e de ajuda mútua.", p: 2 }, { t: "Foco total em metas, resultados rápidos e eficiência.", p: 3 } ] },
  { id: 8, text: "Qual é a sua maior \"ferida\" ou medo inconsciente?", options: [ { t: "Sentir-se comum ou sem identidade única.", p: 4 }, { t: "Sentir-se invadido ou sem conhecimento suficiente.", p: 5 }, { t: "Sentir-se desprotegido ou sem apoio/segurança.", p: 6 } ] },
  { id: 9, text: "Como você lida com a dor ou problemas difíceis?", options: [ { t: "Fujo da dor buscando distrações, planos futuros e otimismo.", p: 7 }, { t: "Nego a dor e a fraqueza, enfrentando o problema de frente com força.", p: 8 }, { t: "Anestesio a mente, procrastino ou finjo que o problema não é tão grave.", p: 9 } ] },
  { id: 10, text: "O que você espera das pessoas ao seu redor?", options: [ { t: "Que sigam as regras e façam as coisas com perfeição.", p: 1 }, { t: "Que reconheçam meu esforço e gostem de mim.", p: 2 }, { t: "Que reconheçam minha competência e meu sucesso.", p: 3 } ] },
  { id: 11, text: "Qual é o seu estilo de comunicação predominante?", options: [ { t: "Dramático, autêntico e focado no que está faltando.", p: 4 }, { t: "Lógico, analítico, contido e focado em informações.", p: 5 }, { t: "Cético, questionador e focado em identificar riscos.", p: 6 } ] },
  { id: 12, text: "Diante de uma decisão difícil, você:", options: [ { t: "Decide rápido, com base no que vai trazer prazer ou satisfação imediata.", p: 7 }, { t: "Decide rápido, com base no instinto e na vontade de controlar a situação.", p: 8 }, { t: "Demora para decidir, buscando consenso e evitando desagradar alguém.", p: 9 } ] },
  { id: 13, text: "Qual o seu \"Radar\" natural (aquilo que você percebe primeiro)?", options: [ { t: "O erro e o que precisa ser corrigido.", p: 1 }, { t: "As necessidades das outras pessoas.", p: 2 }, { t: "As oportunidades de sucesso e reconhecimento.", p: 3 } ] },
  { id: 14, text: "Qual dom você acredita possuir mais forte?", options: [ { t: "Criatividade, sensibilidade e profundidade.", p: 4 }, { t: "Capacidade analítica, conhecimento técnico e estratégia.", p: 5 }, { t: "Planejamento, lealdade e antecipação de riscos.", p: 6 } ] },
  { id: 15, text: "Qual é a sua atitude em relação a conflitos?", options: [ { t: "Reenquadro a situação para ver o lado positivo e evitar negatividade.", p: 7 }, { t: "Gosto do confronto direto, acho saudável colocar tudo \"na mesa\".", p: 8 }, { t: "Atuo como mediador, ouço os dois lados e busco a paz.", p: 9 } ] }
];

// --- REUSABLE HISTORY COMPONENT ---

const AssessmentHistory = ({ 
  history, 
  onDelete, 
  type 
}: { 
  history: any[], 
  onDelete: (id: string) => void, 
  type: 'strategic' | 'phase' | 'behavioral' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Card className="transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center font-bold text-slate-100 hover:text-amber-500 transition-colors"
      >
        <div className="flex items-center gap-2">
          <History size={20} className="text-amber-500"/>
          <span>Histórico de Análises ({history.length})</span>
        </div>
        <div className="bg-slate-700 p-1 rounded-full">
           {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar border-t border-slate-700 pt-4">
          {history.length === 0 && <div className="text-slate-500 text-center py-4 italic">Nenhum registro encontrado.</div>}
          
          {history.map((h) => (
            <div key={h.id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-all">
              <div className="flex justify-between items-start mb-3 border-b border-slate-700/50 pb-2">
                <div>
                   <div className="font-bold text-amber-500 text-sm flex items-center gap-2">
                      {formatDate(h.createdAt)}
                   </div>
                   
                   {type === 'phase' && (
                     <div className="text-xs text-slate-400 mt-1">
                        Fase: <strong className="text-white text-sm">{h.phaseName}</strong> • Itens: <span className="text-emerald-400">{h.totalScore}/30</span>
                     </div>
                   )}
                   
                   {type === 'strategic' && (
                     <div className="flex gap-3 text-xs mt-1.5 font-mono">
                        <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20">OP: {h.scores.operacional}</span>
                        <span className="bg-yellow-500/10 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/20">TAC: {h.scores.tatico}</span>
                        <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">EST: {h.scores.estrategico}</span>
                     </div>
                   )}

                    {type === 'behavioral' && (
                     <div className="text-xs text-slate-400 mt-1">
                        Dominante: <strong className="text-white">{h.dominantProfile?.name}</strong>
                        <div className="flex gap-2 mt-1 font-mono">
                          <span className="text-emerald-400">CORPO: {h.triadScores?.body}</span>
                          <span className="text-rose-400">CORAÇÃO: {h.triadScores?.heart}</span>
                          <span className="text-blue-400">MENTE: {h.triadScores?.mind}</span>
                        </div>
                     </div>
                   )}
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Stop expansion
                    if (window.confirm("Tem certeza que deseja apagar este registro do histórico?")) {
                      onDelete(h.id);
                    }
                  }} 
                  className="text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition-colors p-2 rounded-md"
                  title="Excluir registro permanentemente"
                >
                  <Trash2 size={16}/>
                </button>
              </div>
              
              {h.aiAnalysis && (
                <div className="markdown-content text-sm text-slate-300">
                  <ReactMarkdown>{h.aiAnalysis}</ReactMarkdown>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};


// --- DIAGNOSE MODULE ---

export const DiagnoseModule = ({ user }: { user: UserProfile }) => {
  const [activeTab, setActiveTab] = useState<'strategic' | 'phases' | 'behavioral'>('strategic');

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-slate-700 pb-0 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('strategic')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'strategic' ? 'text-amber-500 border-amber-500' : 'text-slate-400 border-transparent hover:text-white hover:border-slate-600'}`}
        >
          Análise Estratégica
        </button>
        <button 
          onClick={() => setActiveTab('phases')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'phases' ? 'text-amber-500 border-amber-500' : 'text-slate-400 border-transparent hover:text-white hover:border-slate-600'}`}
        >
          Fases da Empresa
        </button>
        <button 
          onClick={() => setActiveTab('behavioral')}
          className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'behavioral' ? 'text-amber-500 border-amber-500' : 'text-slate-400 border-transparent hover:text-white hover:border-slate-600'}`}
        >
          Perfil Comportamental
        </button>
      </div>

      {activeTab === 'strategic' && <StrategicAnalysis user={user} />}
      {activeTab === 'phases' && <CompanyPhases user={user} />}
      {activeTab === 'behavioral' && <BehavioralAnalysis user={user} />}
    </div>
  );
};

// ... StrategicAnalysis (Existing Code) ...
const StrategicAnalysis = ({ user }: { user: UserProfile }) => {
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [history, setHistory] = useState<StrategicAssessment[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadHistory(); }, [user.uid]);
  const loadHistory = async () => { setHistory(await fetchCollection(user.uid, 'diagnose_strategic', 'createdAt') as StrategicAssessment[]); };

  const handleToggle = (id: string) => setAnswers(prev => ({ ...prev, [id]: !prev[id] }));

  const calculateScores = () => {
    let scores = { operacional: 0, tatico: 0, estrategico: 0 };
    strategicQuestions.forEach(q => {
      if (answers[q.id]) {
        if (q.type === 'Operacional') scores.operacional++;
        if (q.type === 'Tático') scores.tatico++;
        if (q.type === 'Estratégico') scores.estrategico++;
      }
    });
    return scores;
  };

  const handleSave = async () => {
    setSaving(true);
    const scores = calculateScores();
    const prompt = `
      Atue como consultor empresarial sênior do "Conselho P12". 
      Analise as respostas do empresário: Operacional: ${scores.operacional}/8, Tático: ${scores.tatico}/8, Estratégico: ${scores.estrategico}/8.
      Instruções OBRIGATÓRIAS: 1. APENAS Markdown. 2. ## Diagnóstico da Maturidade. 3. ## Plano de Ação Imediato.
    `;
    let aiAnalysis = "Análise indisponível.";
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      aiAnalysis = response.text || "Sem resposta.";
    } catch (error) { console.error(error); }

    await saveDocument(user.uid, 'diagnose_strategic', { createdAt: new Date(), answers, scores, aiAnalysis, actionPlan: "Ver IA" });
    await loadHistory();
    setSaving(false);
  };
  const scores = calculateScores();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><CheckCircle size={20} className="text-amber-500"/> Questionário de Perfil</h2>
        <div className="space-y-1">
          {strategicQuestions.map(q => (
            <div key={q.id} className={`flex items-start gap-3 p-2.5 rounded hover:bg-slate-700/50 cursor-pointer transition-colors ${answers[q.id] ? 'bg-amber-500/10' : ''}`} onClick={() => handleToggle(q.id)}>
              <div className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${answers[q.id] ? 'bg-amber-500 border-amber-500 text-slate-900 font-bold scale-105' : 'border-slate-600'}`}>
                {answers[q.id] && '✓'}
              </div>
              <div className="text-sm text-slate-300"><span className="font-bold text-slate-500 mr-2">#{q.id}</span>{q.text}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving}>{saving ? <><Loader2 className="animate-spin"/> Analisando...</> : <><BrainCircuit size={18}/> Salvar & Analisar</>}</Button>
        </div>
      </Card>
      <div className="space-y-6">
        <Card className="bg-slate-900 border-slate-700">
          <h3 className="font-bold text-slate-100 mb-4 text-center">Gabarito Atual</h3>
          <div className="space-y-4 px-2">
            <div><div className="flex justify-between text-sm mb-1"><span className="text-red-400 font-medium">Operacional</span><span className="font-bold text-white">{scores.operacional} / 8</span></div><div className="h-2.5 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-red-500" style={{ width: `${(scores.operacional/8)*100}%` }}></div></div></div>
            <div><div className="flex justify-between text-sm mb-1"><span className="text-yellow-400 font-medium">Tático</span><span className="font-bold text-white">{scores.tatico} / 8</span></div><div className="h-2.5 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-yellow-500" style={{ width: `${(scores.tatico/8)*100}%` }}></div></div></div>
            <div><div className="flex justify-between text-sm mb-1"><span className="text-emerald-400 font-medium">Estratégico</span><span className="font-bold text-white">{scores.estrategico} / 8</span></div><div className="h-2.5 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${(scores.estrategico/8)*100}%` }}></div></div></div>
          </div>
        </Card>
        <AssessmentHistory history={history} onDelete={async (id) => { await deleteDocument(user.uid, 'diagnose_strategic', id); loadHistory(); }} type="strategic" />
      </div>
    </div>
  );
};

// ... CompanyPhases (Existing Code) ...
const CompanyPhases = ({ user }: { user: UserProfile }) => {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [history, setHistory] = useState<PhaseAssessment[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadHistory(); }, [user.uid]);
  const loadHistory = async () => { setHistory(await fetchCollection(user.uid, 'diagnose_phases', 'createdAt') as PhaseAssessment[]); };

  const toggleItem = (idx: number) => { const s = idx.toString(); setCheckedItems(checkedItems.includes(s) ? checkedItems.filter(i=>i!==s) : [...checkedItems, s]); };
  
  const handleSave = async () => {
    setSaving(true);
    const total = checkedItems.length;
    let phase = 7, name = "Fase 7 - Reino";
    if (total <= 8) { phase = 1; name = "Fase 1 - Sobrevivência"; }
    else if (total <= 15) { phase = 2; name = "Fase 2 - Organização"; }
    else if (total <= 20) { phase = 3; name = "Fase 3 - Crescimento"; }
    else if (total <= 24) { phase = 4; name = "Fase 4 - Consolidação"; }
    else if (total <= 26) { phase = 5; name = "Fase 5 - Expansão"; }
    else if (total <= 29) { phase = 6; name = "Fase 6 - Transformação"; }

    const prompt = `Atue como consultor P12. Empresa ${total}/30 itens. ${name}. APENAS Markdown. ## Análise Motivacional. ## Próximos Passos.`;
    let aiAnalysis = "Análise indisponível.";
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      aiAnalysis = response.text || "Sem resposta.";
    } catch (e) { console.error(e); }

    await saveDocument(user.uid, 'diagnose_phases', { createdAt: new Date(), checkedItems, totalScore: total, phase, phaseName: name, aiAnalysis });
    await loadHistory();
    setSaving(false);
  };
  
  const { name } = (() => {
    const total = checkedItems.length;
    if (total <= 8) return { name: "Fase 1 - Sobrevivência" };
    if (total <= 15) return { name: "Fase 2 - Organização" };
    if (total <= 20) return { name: "Fase 3 - Crescimento" };
    if (total <= 24) return { name: "Fase 4 - Consolidação" };
    if (total <= 26) return { name: "Fase 5 - Expansão" };
    if (total <= 29) return { name: "Fase 6 - Transformação" };
    return { name: "Fase 7 - Reino" };
  })();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><CheckCircle size={20} className="text-emerald-500"/> Checklist de Fases</h2>
        <div className="space-y-0 divide-y divide-slate-700">
          {phaseQuestions.map((text, idx) => (
            <div key={idx} className={`flex items-center gap-3 p-3 hover:bg-slate-700/50 cursor-pointer transition-colors ${checkedItems.includes(idx.toString()) ? 'bg-emerald-500/5' : ''}`} onClick={() => toggleItem(idx)}>
              <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${checkedItems.includes(idx.toString()) ? 'bg-emerald-500 border-emerald-500 text-slate-900 scale-105' : 'border-slate-600'}`}>{checkedItems.includes(idx.toString()) && '✓'}</div>
              <div className="text-sm text-slate-300"><span className="font-bold text-slate-500 mr-2">#{idx + 1}</span>{text}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving}>{saving ? <><Loader2 className="animate-spin"/> Salvando...</> : <><BrainCircuit size={18}/> Salvar & Gerar</>}</Button>
        </div>
      </Card>
      <div className="space-y-6">
        <Card className="bg-slate-800 border-slate-700 text-center relative overflow-hidden">
           <div className="relative z-10">
             <div className="text-slate-400 text-sm mb-2 uppercase tracking-wide">Maturidade Atual</div>
             <div className="text-6xl font-bold text-amber-500 mb-2 drop-shadow-lg">{checkedItems.length}</div>
             <div className="text-xl text-white font-medium">{name}</div>
             <div className="w-full bg-slate-700 h-3 rounded-full mt-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500" style={{ width: `${(checkedItems.length/30)*100}%` }}></div>
             </div>
           </div>
        </Card>
        <AssessmentHistory history={history} onDelete={async (id) => { await deleteDocument(user.uid, 'diagnose_phases', id); loadHistory(); }} type="phase" />
      </div>
    </div>
  );
};

// --- BEHAVIORAL ANALYSIS (NEW) ---

const BehavioralAnalysis = ({ user }: { user: UserProfile }) => {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [history, setHistory] = useState<BehavioralAssessment[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadHistory(); }, [user.uid]);
  const loadHistory = async () => { setHistory(await fetchCollection(user.uid, 'diagnose_behavioral', 'createdAt') as BehavioralAssessment[]); };

  const handleSelect = (qId: number, profileId: number) => {
    setAnswers(prev => ({ ...prev, [qId]: profileId }));
  };

  const calculateResults = () => {
    // 1. Calculate Profile Scores (1-9)
    const profileScores: Record<number, number> = {};
    for (let i = 1; i <= 9; i++) profileScores[i] = 0;
    
    Object.values(answers).forEach((val: any) => {
      const pId = val as number;
      profileScores[pId] = (profileScores[pId] || 0) + 1;
    });

    // 2. Calculate Triads
    const triadScores = {
      body: (profileScores[8] || 0) + (profileScores[9] || 0) + (profileScores[1] || 0), // Corpo: 8, 9, 1
      heart: (profileScores[2] || 0) + (profileScores[3] || 0) + (profileScores[4] || 0), // Coração: 2, 3, 4
      mind: (profileScores[5] || 0) + (profileScores[6] || 0) + (profileScores[7] || 0) // Mente: 5, 6, 7
    };

    // 3. Find Dominant Profile
    let maxScore = -1;
    let dominantProfileNumber = 0;
    
    for (let i = 1; i <= 9; i++) {
      if (profileScores[i] > maxScore) {
        maxScore = profileScores[i];
        dominantProfileNumber = i;
      }
    }

    return { profileScores, triadScores, dominantProfileNumber };
  };

  const handleSave = async () => {
    // Validate
    if (Object.keys(answers).length < 15) {
      alert("Por favor, responda todas as 15 perguntas para obter um resultado preciso.");
      return;
    }

    setSaving(true);
    const { profileScores, triadScores, dominantProfileNumber } = calculateResults();
    const dominantName = profileNames[dominantProfileNumber];

    const prompt = `
      Atue como especialista em análise comportamental (Método Decifrar Pessoas - Eneagrama).
      
      Resultados do Usuário:
      - Tríade do Corpo (Operacional): ${triadScores.body}/5 pontos.
      - Tríade do Coração (Tático): ${triadScores.heart}/5 pontos.
      - Tríade da Mente (Estratégico): ${triadScores.mind}/5 pontos.
      - Perfil Dominante: Tipo ${dominantProfileNumber} - ${dominantName}.
      
      Gere um relatório em Markdown:
      ## Análise do Perfil Dominante: ${dominantName}
      [Descreva motivações, medos e pontos fortes]
      
      ## Análise da Tríade Dominante
      [Explique o que significa ter essa tríade predominante no contexto empresarial]
      
      ## Pontos de Atenção e Evolução
      [3 dicas práticas para o líder]
    `;

    let aiAnalysis = "Análise indisponível.";
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      aiAnalysis = response.text || "Sem resposta.";
    } catch (e) { console.error(e); }

    const assessment: BehavioralAssessment = {
      createdAt: new Date(),
      answers,
      profileScores,
      triadScores,
      dominantProfile: { number: dominantProfileNumber, name: dominantName },
      aiAnalysis
    };

    await saveDocument(user.uid, 'diagnose_behavioral', assessment);
    await loadHistory();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(user.uid, 'diagnose_behavioral', id);
    loadHistory();
  };

  const results = calculateResults();
  const progress = Object.keys(answers).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><UserCheck size={20} className="text-amber-500"/> Teste de Perfil Comportamental</h2>
        <p className="text-sm text-slate-400 mb-6 italic">Responda com honestidade. Não existem respostas certas ou erradas.</p>
        
        <div className="space-y-6">
          {behavioralQuestions.map((q) => (
            <div key={q.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <div className="font-bold text-slate-200 mb-3">{q.id}. {q.text}</div>
              <div className="space-y-2">
                {q.options.map((opt, idx) => (
                  <label key={idx} className={`flex items-start gap-3 p-3 rounded cursor-pointer transition-colors hover:bg-slate-800 ${answers[q.id] === opt.p ? 'bg-amber-500/10 border border-amber-500/30' : 'border border-transparent'}`}>
                    <input 
                      type="radio" 
                      name={`q_${q.id}`} 
                      className="mt-1 accent-amber-500"
                      checked={answers[q.id] === opt.p}
                      onChange={() => handleSelect(q.id, opt.p)}
                    />
                    <span className={`text-sm ${answers[q.id] === opt.p ? 'text-amber-100' : 'text-slate-400'}`}>{opt.t}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between items-center bg-slate-800 p-4 rounded sticky bottom-0 border-t border-slate-700 shadow-xl">
          <div className="text-sm text-slate-400">Progresso: <span className="text-white font-bold">{progress}/15</span></div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="animate-spin"/> Gerando Perfil...</> : <><BrainCircuit size={18}/> Finalizar e Analisar</>}
          </Button>
        </div>
      </Card>

      <div className="space-y-6">
        {/* Real-time Results Preview */}
        <Card className="bg-slate-900 border-slate-700">
          <h3 className="font-bold text-slate-100 mb-4 text-center">Gabarito em Tempo Real</h3>
          <div className="space-y-6 px-2">
            
            {/* CORPO */}
            <div>
              <div className="flex justify-between text-sm mb-1 items-center">
                <span className="text-emerald-400 font-bold flex items-center gap-2"><Zap size={14}/> Corpo (Operacional)</span>
                <span className="font-bold text-white">{results.triadScores.body} pts</span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(results.triadScores.body/5)*100}%` }}></div>
              </div>
              <div className="text-[10px] text-slate-500 text-right">Perfis: Confrontador, Pacificador, Perfeccionista</div>
            </div>

            {/* CORAÇÃO */}
            <div>
              <div className="flex justify-between text-sm mb-1 items-center">
                <span className="text-rose-400 font-bold flex items-center gap-2"><Heart size={14}/> Coração (Tático)</span>
                <span className="font-bold text-white">{results.triadScores.heart} pts</span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${(results.triadScores.heart/5)*100}%` }}></div>
              </div>
              <div className="text-[10px] text-slate-500 text-right">Perfis: Prestativo, Realizador, Exclusivo</div>
            </div>

            {/* MENTE */}
            <div>
              <div className="flex justify-between text-sm mb-1 items-center">
                <span className="text-blue-400 font-bold flex items-center gap-2"><Lightbulb size={14}/> Mente (Estratégico)</span>
                <span className="font-bold text-white">{results.triadScores.mind} pts</span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(results.triadScores.mind/5)*100}%` }}></div>
              </div>
              <div className="text-[10px] text-slate-500 text-right">Perfis: Observador, Cauteloso, Entusiasta</div>
            </div>

            {results.dominantProfileNumber > 0 && (
              <div className="mt-6 p-4 bg-slate-800 rounded border border-amber-500/30 text-center animate-fade-in">
                 <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Perfil Dominante</div>
                 <div className="text-xl font-bold text-amber-500">{profileNames[results.dominantProfileNumber]}</div>
                 <div className="text-xs text-slate-500 mt-1">Tipo {results.dominantProfileNumber}</div>
              </div>
            )}
          </div>
        </Card>

        <AssessmentHistory 
          history={history} 
          onDelete={handleDelete} 
          type="behavioral" 
        />
      </div>
    </div>
  );
};