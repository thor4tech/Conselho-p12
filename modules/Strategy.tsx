
import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Spinner } from '../components';
import { UserProfile, StrategyIdentity, SWOT, SWOTItem, StrategicAssessment } from '../types';
import { saveDocument, db, getCollectionPath } from '../services';
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { BrainCircuit, Loader2, Save } from 'lucide-react';
import { Radar } from 'react-chartjs-2';
import { GoogleGenAI, Type } from "@google/genai";

// --- IDENTITY MODULE ---

export const IdentityModule = ({ user }: { user: UserProfile }) => {
  const [data, setData] = useState<StrategyIdentity>({ 
    dream: '', purpose: '', mission: '', vision: '', values: [], 
    valueProposition: { title: '', subtitle: '', bullets: [] },
    competitiveAdvantage: ''
  });
  const [newValue, setNewValue] = useState('');
  const [newBullet, setNewBullet] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, getCollectionPath(user.uid, 'strategy_identity'), 'main'));
        if (snap.exists()) {
          const loadedData = snap.data() as any;
          // Robust merge with default structure to prevent undefined errors
          setData({
            dream: loadedData.dream || '',
            purpose: loadedData.purpose || '',
            mission: loadedData.mission || '',
            vision: loadedData.vision || '',
            values: Array.isArray(loadedData.values) ? loadedData.values : [],
            valueProposition: {
              title: loadedData.valueProposition?.title || '',
              subtitle: loadedData.valueProposition?.subtitle || '',
              bullets: Array.isArray(loadedData.valueProposition?.bullets) ? loadedData.valueProposition.bullets : []
            },
            competitiveAdvantage: loadedData.competitiveAdvantage || ''
          });
        }
      } catch (e) {
        console.error("Erro ao carregar identidade", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.uid]);

  const handleSave = async () => {
    await saveDocument(user.uid, 'strategy_identity', data, 'main');
    alert('Identidade Organizacional salva com sucesso!');
  };

  const addValue = () => { 
    if (newValue.trim()) { 
      setData(prev => ({ ...prev, values: [...(prev.values || []), newValue] })); 
      setNewValue(''); 
    } 
  };
  
  const addBullet = () => { 
    if (newBullet.trim()) { 
      setData(prev => ({ 
        ...prev, 
        valueProposition: { 
          ...prev.valueProposition, 
          bullets: [...(prev.valueProposition.bullets || []), newBullet] 
        } 
      })); 
      setNewBullet(''); 
    } 
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-100">Identidade Organizacional</h1>
        <Button onClick={handleSave}><SaveIcon size={18}/> Salvar Tudo</Button>
      </div>

      <Card className="border-t-4 border-slate-500">
        <h3 className="text-xl font-bold mb-1 uppercase text-slate-100">Sonho</h3>
        <p className="text-xs text-slate-400 mb-3">Onde você quer chegar no longo prazo? O objetivo final.</p>
        <textarea className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-slate-100 h-24 focus:border-white outline-none transition-colors"
          value={data.dream || ''} onChange={e => setData({...data, dream: e.target.value})} placeholder="Ex: Ser a maior referência mundial em..." />
      </Card>

      <Card className="border-t-4 border-slate-500">
        <h3 className="text-xl font-bold mb-1 uppercase text-slate-100">Propósito</h3>
        <p className="text-xs text-slate-400 mb-3">Por que fazemos o que fazemos? A causa maior.</p>
        <textarea className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-slate-100 h-24 focus:border-white outline-none transition-colors"
          value={data.purpose || ''} onChange={e => setData({...data, purpose: e.target.value})} placeholder="Ex: Transformar vidas através de..." />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-amber-500/5 border-amber-500/50">
          <h3 className="text-amber-500 font-bold mb-2 uppercase">Missão</h3>
          <textarea className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-slate-100 h-32 text-sm"
            value={data.mission || ''} onChange={e => setData({...data, mission: e.target.value})} placeholder="O que a empresa faz hoje..." />
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/50">
          <h3 className="text-blue-500 font-bold mb-2 uppercase">Visão</h3>
          <textarea className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-slate-100 h-32 text-sm"
            value={data.vision || ''} onChange={e => setData({...data, vision: e.target.value})} placeholder="Onde estaremos em X anos..." />
        </Card>
        <Card className="bg-purple-500/5 border-purple-500/50">
          <h3 className="text-purple-500 font-bold mb-2 uppercase">Valores</h3>
          <div className="flex gap-2 mb-2">
            <input className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-white" value={newValue} onChange={e=>setNewValue(e.target.value)} onKeyDown={e=>e.key==='Enter' && addValue()} placeholder="Novo valor..." />
            <button onClick={addValue} className="bg-slate-700 px-2 rounded text-white">+</button>
          </div>
          <div className="flex flex-wrap gap-1">
            {(data.values || []).map((v, i) => (
              <span key={i} className="bg-slate-800 border border-slate-600 px-2 py-1 rounded text-xs text-slate-300 flex items-center gap-1">
                {v} <button onClick={() => setData({...data, values: data.values.filter((_, idx) => idx !== i)})} className="hover:text-red-400 ml-1">×</button>
              </span>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-lg font-bold text-white mb-4 uppercase border-b border-slate-700 pb-2">Proposta de Valor</h3>
        <div className="space-y-4">
          <Input label="Título (Manchete)" value={data.valueProposition?.title || ''} onChange={(e:any) => setData({...data, valueProposition: { ...data.valueProposition, title: e.target.value }})} placeholder="A promessa principal..." />
          <Input label="Subtítulo (Explicação)" value={data.valueProposition?.subtitle || ''} onChange={(e:any) => setData({...data, valueProposition: { ...data.valueProposition, subtitle: e.target.value }})} placeholder="Como funciona e para quem é..." />
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Benefícios (Bullet Points)</label>
            <div className="flex gap-2 mb-2">
              <input className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-2 text-white" value={newBullet} onChange={e=>setNewBullet(e.target.value)} onKeyDown={e=>e.key==='Enter' && addBullet()} placeholder="Adicionar benefício..." />
              <button onClick={addBullet} className="bg-amber-500 text-slate-900 font-bold px-4 rounded">Adicionar</button>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              {(data.valueProposition?.bullets || []).map((b, i) => (
                <li key={i} className="group flex items-center gap-2">
                  <span>{b}</span>
                  <button onClick={() => setData({...data, valueProposition: { ...data.valueProposition, bullets: data.valueProposition.bullets.filter((_, idx) => idx !== i) }})} className="text-slate-600 group-hover:text-red-400 text-xs">Excluir</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-bold text-white mb-2 uppercase">Diferencial Competitivo</h3>
        <p className="text-xs text-slate-400 mb-3">O que você tem que os concorrentes não conseguem copiar facilmente?</p>
        <textarea className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-slate-100 h-24 focus:border-white outline-none transition-colors"
          value={data.competitiveAdvantage || ''} onChange={e => setData({...data, competitiveAdvantage: e.target.value})} placeholder="Ex: Tecnologia proprietária, Marca exclusiva..." />
      </Card>
    </div>
  );
};

const SaveIcon = ({size}:any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>;

// --- SWOT MODULE ---

export const SWOTModule = ({ user }: { user: UserProfile }) => {
  const [data, setData] = useState<SWOT>({ strengths: [], weaknesses: [], opportunities: [], threats: [] });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, getCollectionPath(user.uid, 'strategy_swot'), 'current'));
        if (snap.exists()) setData(snap.data() as SWOT);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user.uid]);

  const generateWithAI = async () => {
    setGenerating(true);
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        alert("Chave de API não encontrada.");
        setGenerating(false);
        return;
    }

    try {
      // Fetch latest diagnose
      const q = query(collection(db, getCollectionPath(user.uid, 'diagnose_strategic')), orderBy('createdAt', 'desc'), limit(1));
      const snap = await getDocs(q);
      const lastDiagnose = snap.docs.length > 0 ? (snap.docs[0].data() as StrategicAssessment) : null;
      
      const qPhase = query(collection(db, getCollectionPath(user.uid, 'diagnose_phases')), orderBy('createdAt', 'desc'), limit(1));
      const snapPhase = await getDocs(qPhase);
      const lastPhase = snapPhase.docs.length > 0 ? (snapPhase.docs[0].data() as any) : null;

      const prompt = `
        Atue como estrategista de negócios P12. 
        Com base no diagnóstico recente:
        - Nível Operacional: ${lastDiagnose?.scores.operacional || 'N/A'}/8
        - Nível Tático: ${lastDiagnose?.scores.tatico || 'N/A'}/8
        - Nível Estratégico: ${lastDiagnose?.scores.estrategico || 'N/A'}/8
        - Fase da Empresa: ${lastPhase?.phaseName || 'Não definida'}

        Gere uma Matriz SWOT completa em JSON.
        Crie 4 itens para cada quadrante. O "score" (0-100) deve representar o impacto/intensidade.
      `;

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              strengths: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, score: { type: Type.INTEGER } } } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, score: { type: Type.INTEGER } } } },
              opportunities: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, score: { type: Type.INTEGER } } } },
              threats: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { text: { type: Type.STRING }, score: { type: Type.INTEGER } } } },
            }
          }
        }
      });

      // Robust JSON Parsing
      const rawText = response.text || "{}";
      const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanText);

      const newData = { ...parsed, updatedAt: new Date() };
      setData(newData);
      await saveDocument(user.uid, 'strategy_swot', newData, 'current');
    } catch (e) {
      console.error(e);
      alert('Erro ao gerar SWOT com IA. Verifique se realizou os diagnósticos primeiro ou se a chave de API está válida.');
    } finally {
      setGenerating(false);
    }
  };

  const calculateTotal = (items: SWOTItem[]) => (items || []).reduce((acc, i) => acc + (i.score || 0), 0);
  const sTotal = calculateTotal(data.strengths);
  const wTotal = calculateTotal(data.weaknesses);
  const oTotal = calculateTotal(data.opportunities);
  const tTotal = calculateTotal(data.threats);

  const totalPoints = sTotal + wTotal + oTotal + tTotal;
  const favorabilityIndex = totalPoints > 0 
    ? Math.round(((sTotal + oTotal) - (wTotal + tTotal)) / totalPoints * 100) 
    : 0;

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Matriz SWOT Inteligente</h1>
          <p className="text-slate-400 text-sm">Geração automática baseada no diagnóstico estratégico</p>
        </div>
        <Button onClick={generateWithAI} disabled={generating}>
          {generating ? <><Loader2 className="animate-spin" size={18}/> Gerando Estratégia...</> : <><BrainCircuit size={18}/> Gerar com IA</>}
        </Button>
      </div>

      <Card className={`text-center py-6 border-b-4 ${favorabilityIndex > 0 ? 'border-emerald-500 bg-emerald-500/10' : 'border-red-500 bg-red-500/10'}`}>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-300 mb-2">Índice de Favorabilidade (I.F.)</h2>
        <div className="text-5xl font-bold text-white mb-2">{favorabilityIndex}%</div>
        <div className="max-w-md mx-auto h-2 bg-slate-700 rounded-full relative">
           <div className="absolute top-0 left-1/2 h-full w-0.5 bg-white opacity-50"></div>
           <div 
             className={`h-full absolute top-0 transition-all duration-700 ${favorabilityIndex > 0 ? 'bg-emerald-500 left-1/2' : 'bg-red-500 right-1/2'}`}
             style={{ width: `${Math.abs(favorabilityIndex)/2}%`, left: favorabilityIndex > 0 ? '50%' : undefined, right: favorabilityIndex < 0 ? '50%' : undefined }}
           ></div>
        </div>
        <p className="text-xs text-slate-400 mt-2">
           {favorabilityIndex > 20 ? "Cenário Favorável: Aproveite as forças para capitalizar oportunidades." : 
            favorabilityIndex < -20 ? "Cenário Crítico: Priorize a mitigação de riscos e fraquezas." : 
            "Cenário Equilibrado: Atenção aos detalhes para desempatar o jogo."}
        </p>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <Card className="lg:col-span-1 flex flex-col items-center justify-center">
            <h3 className="font-bold mb-4 text-slate-300">Radar de Equilíbrio</h3>
            <div className="w-full max-w-[300px]">
               <Radar 
                 data={{
                   labels: ['Forças', 'Oportunidades', 'Ameaças', 'Fraquezas'],
                   datasets: [{
                     label: 'Intensidade',
                     data: [sTotal, oTotal, tTotal, wTotal],
                     backgroundColor: 'rgba(245, 158, 11, 0.2)',
                     borderColor: '#f59e0b',
                     borderWidth: 2,
                   }]
                 }}
                 options={{
                   scales: {
                     r: { angleLines: { color: '#334155'}, grid: { color: '#334155' }, pointLabels: { color: '#cbd5e1' } }
                   },
                   plugins: { legend: { display: false } }
                 }}
               />
            </div>
         </Card>

         <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <SwotQuadrant title="Forças (Interno)" items={data.strengths} color="emerald" total={sTotal} />
            <SwotQuadrant title="Fraquezas (Interno)" items={data.weaknesses} color="red" total={wTotal} />
            <SwotQuadrant title="Oportunidades (Externo)" items={data.opportunities} color="blue" total={oTotal} />
            <SwotQuadrant title="Ameaças (Externo)" items={data.threats} color="amber" total={tTotal} />
         </div>
      </div>
    </div>
  );
};

const SwotQuadrant = ({ title, items, color, total }: any) => {
  const colorClasses: any = {
    emerald: "border-emerald-500 text-emerald-400",
    red: "border-red-500 text-red-400",
    blue: "border-blue-500 text-blue-400",
    amber: "border-amber-500 text-amber-400"
  };

  return (
    <Card className={`border-t-4 ${colorClasses[color].split(' ')[0]} h-full`}>
       <div className="flex justify-between items-center mb-4">
         <h3 className={`font-bold ${colorClasses[color].split(' ')[1]}`}>{title}</h3>
         <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">{total} pts</span>
       </div>
       <div className="space-y-2">
         {(items || []).map((item: SWOTItem, i: number) => (
           <div key={i} className="flex justify-between items-center bg-slate-900/50 p-2 rounded text-sm group">
              <span className="text-slate-200">{item.text}</span>
              <span className={`text-xs font-mono font-bold ${colorClasses[color].split(' ')[1]}`}>{item.score}</span>
           </div>
         ))}
         {(!items || items.length === 0) && <div className="text-slate-500 text-xs italic">Nenhum item. Gere com IA.</div>}
       </div>
    </Card>
  );
};
