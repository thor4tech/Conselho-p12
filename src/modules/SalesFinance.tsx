import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Spinner } from '../components';
import { UserProfile, Persona, DRERecord, ProductRecord, ProductMonthData } from '../types';
import { fetchCollection, saveDocument, deleteDocument, formatCurrency, db, getCollectionPath } from '../services';
import { Trash2, Plus, Save, User, ChevronRight, ChevronLeft, BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight, Package } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Line } from 'react-chartjs-2';

// --- PERSONAS (COMPRADOR DOS SONHOS) ---
export const PersonasModule = ({ user }: { user: UserProfile }) => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selected, setSelected] = useState<Persona | null>(null);

  useEffect(() => {
    fetchCollection(user.uid, 'sales_personas').then((d) => setPersonas(d as Persona[]));
  }, [user.uid]);

  const handleSave = async () => {
    if (!selected) return;
    const id = await saveDocument(user.uid, 'sales_personas', selected, selected.id);
    
    const newP = { ...selected, id };
    const idx = personas.findIndex(p => p.id === id);
    if (idx >= 0) {
      const copy = [...personas]; copy[idx] = newP; setPersonas(copy);
    } else {
      setPersonas([...personas, newP]);
    }
    alert("Persona salva com sucesso!");
  };

  const createNew = () => setSelected({ 
    id: '', 
    name: 'Nova Persona', 
    q1: '', q2: '', q3: '', q4: '', q5: '', q6: '', q7: '', q8: '', q9: '' 
  });

  const handleDelete = async () => {
    if (selected?.id && window.confirm("Tem certeza que deseja excluir esta persona?")) {
      await deleteDocument(user.uid, 'sales_personas', selected.id);
      setPersonas(personas.filter(p => p.id !== selected.id));
      setSelected(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-140px)]">
      <Card className="md:col-span-1 overflow-y-auto border-r border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-slate-100">Personas</h3>
          <Button onClick={createNew} size="sm" variant="primary"><Plus size={16}/></Button>
        </div>
        <div className="space-y-2">
          {personas.map(p => (
            <div 
              key={p.id} 
              onClick={() => setSelected(p)} 
              className={`p-3 rounded-lg cursor-pointer border flex items-center gap-3 transition-all ${selected?.id === p.id ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              <div className={`p-2 rounded-full ${selected?.id === p.id ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-500'}`}>
                 <User size={16} />
              </div>
              <div className="font-medium truncate">{p.name}</div>
            </div>
          ))}
          {personas.length === 0 && <div className="text-slate-500 text-sm text-center py-8 italic">Nenhuma persona cadastrada.</div>}
        </div>
      </Card>

      <Card className="md:col-span-3 overflow-y-auto custom-scrollbar">
        {selected ? (
          <div className="space-y-6 pb-10">
            <div className="flex justify-between items-center border-b border-slate-800 pb-6">
              <div className="w-1/2">
                <Input label="Nome da Persona" value={selected.name} onChange={(e:any) => setSelected({...selected, name: e.target.value})} className="mb-0" />
              </div>
              <div className="flex gap-3">
                 <Button variant="danger" onClick={handleDelete}><Trash2 size={16} /></Button>
                 <Button onClick={handleSave}><Save size={16} /> Salvar Alterações</Button>
              </div>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-lg mb-6">
               <p className="text-amber-100/80 text-sm italic mb-3 leading-relaxed">
                 "Sem realmente conhecer quem é o seu cliente, você jamais conseguirá suprir as necessidades dele. Muitas vezes os empresários querem oferecer o que é melhor para eles mesmos e não para seus clientes."
               </p>
               <p className="text-amber-500 font-bold text-xs uppercase tracking-widest">
                 Dica de Vendas P12
               </p>
            </div>

            <div className="space-y-6">
              <QuestionBlock 
                number="1" 
                question="Onde o seu comprador dos sonhos vai para se divertir e socializar?" 
                value={selected.q1} 
                onChange={(v) => setSelected({...selected, q1: v})} 
              />
              <QuestionBlock number="2" question="Onde ele consegue informações?" value={selected.q2} onChange={(v) => setSelected({...selected, q2: v})} />
              <QuestionBlock number="3" question="Quais são suas maiores frustrações e desafios?" value={selected.q3} onChange={(v) => setSelected({...selected, q3: v})} />
              <QuestionBlock number="4" question="Quais são suas esperanças, sonhos e desejos?" value={selected.q4} onChange={(v) => setSelected({...selected, q4: v})} />
              <QuestionBlock number="5" question="Quais são seus maiores medos?" value={selected.q5} onChange={(v) => setSelected({...selected, q5: v})} />
              <QuestionBlock number="6" question="Qual a sua forma preferida de comunicação?" value={selected.q6} onChange={(v) => setSelected({...selected, q6: v})} />
              <QuestionBlock number="7" question="Quais frases, termos e expressões eles usam?" value={selected.q7} onChange={(v) => setSelected({...selected, q7: v})} />
              <QuestionBlock number="8" question="Como é o dia a dia/cotidiano de suas vidas?" value={selected.q8} onChange={(v) => setSelected({...selected, q8: v})} />
              <QuestionBlock number="9" question="O que o faz feliz?" value={selected.q9} onChange={(v) => setSelected({...selected, q9: v})} />
            </div>
            
            <div className="pt-6 border-t border-slate-800 flex justify-end">
              <Button onClick={handleSave} className="w-full md:w-auto"><Save size={16} /> Salvar Persona</Button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
            <User size={64} className="mb-6 stroke-1"/>
            <p className="text-lg">Selecione uma persona para editar</p>
            <p className="text-sm">ou crie uma nova para começar.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

const QuestionBlock = ({ number, question, value, onChange }: { number: string, question: string, value: string, onChange: (v: string) => void }) => (
  <div className="bg-[#020617] border border-slate-800 rounded-lg overflow-hidden focus-within:border-amber-500/50 transition-colors">
    <div className="bg-slate-900 px-4 py-3 font-bold text-slate-200 text-sm flex gap-3 items-center border-b border-slate-800">
      <span className="bg-amber-500 text-[#020617] w-6 h-6 rounded flex items-center justify-center text-xs font-black">{number}</span> 
      {question}
    </div>
    <textarea 
      className="w-full bg-[#020617] p-4 text-slate-300 focus:outline-none focus:bg-[#020617] transition-colors h-32 resize-y text-sm leading-relaxed"
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)}
      placeholder="Descreva detalhadamente..."
    />
  </div>
);

// --- PRODUCT REVENUE MODULE (FATURAMENTO POR PRODUTO) ---

const months = [
  { key: '01', label: 'jan' }, { key: '02', label: 'fev' }, { key: '03', label: 'mar' },
  { key: '04', label: 'abr' }, { key: '05', label: 'mai' }, { key: '06', label: 'jun' },
  { key: '07', label: 'jul' }, { key: '08', label: 'ago' }, { key: '09', label: 'set' },
  { key: '10', label: 'out' }, { key: '11', label: 'nov' }, { key: '12', label: 'dez' }
];

export const ProductRevenueModule = ({ user }: { user: UserProfile }) => {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollection(user.uid, 'sales_products').then(d => {
      setProducts(d as ProductRecord[]);
      setLoading(false);
    });
  }, [user.uid]);

  const handleAddProduct = async () => {
    const newProd: ProductRecord = {
      id: '',
      name: 'Novo Produto',
      category: 'Geral',
      avgPrice: 0,
      data: {}
    };
    const id = await saveDocument(user.uid, 'sales_products', newProd);
    setProducts([...products, { ...newProd, id }]);
  };

  const updateProduct = async (id: string, field: keyof ProductRecord, value: any) => {
    const updated = products.map(p => p.id === id ? { ...p, [field]: value } : p);
    setProducts(updated);
    const p = updated.find(x => x.id === id);
    if(p) await saveDocument(user.uid, 'sales_products', p, id);
  };

  const updateMonthData = async (id: string, monthKey: string, field: keyof ProductMonthData, val: number) => {
    const p = products.find(x => x.id === id);
    if(!p) return;
    
    const fullKey = `${year}-${monthKey}`;
    const newData = { ...(p.data || {}) };
    if(!newData[fullKey]) newData[fullKey] = { plannedQ: 0, plannedR: 0, realQ: 0, realR: 0 };
    
    newData[fullKey] = { ...newData[fullKey], [field]: val };
    
    // Auto calc revenue if changing Qty
    if(field === 'plannedQ') newData[fullKey].plannedR = val * p.avgPrice;
    
    updateProduct(id, 'data', newData);
  };

  const handleDelete = async (id: string) => {
    if(window.confirm('Excluir este produto?')) {
      await deleteDocument(user.uid, 'sales_products', id);
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // Chart Data preparation
  const chartLabels = months.map(m => m.label);
  const chartDataReal = months.map(m => {
    const k = `${year}-${m.key}`;
    return products.reduce((acc, p) => acc + (p.data?.[k]?.realR || 0), 0);
  });
  const chartDataPlanned = months.map(m => {
    const k = `${year}-${m.key}`;
    return products.reduce((acc, p) => acc + (p.data?.[k]?.plannedR || 0), 0);
  });

  if(loading) return <Spinner />;

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Faturamento por Produto</h1>
          <p className="text-slate-400 mt-1">Gestão detalhada do mix de produtos e serviços.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/50 p-1.5 rounded-lg border border-slate-700">
           <input 
             type="number" 
             value={year} 
             onChange={e => setYear(Number(e.target.value))} 
             className="bg-[#020617] border border-slate-700 rounded px-3 py-2 text-white w-24 text-center font-bold focus:border-amber-500 outline-none" 
           />
           <Button onClick={handleAddProduct}><Plus size={16}/> Adicionar Produto</Button>
        </div>
      </div>

      <Card className="overflow-hidden p-0 border border-slate-800 shadow-2xl rounded-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#0f172a] text-xs uppercase text-slate-400 font-bold sticky top-0 z-20 shadow-md">
              <tr>
                <th className="p-4 border-r border-slate-800 sticky left-0 bg-[#0f172a] z-30 min-w-[220px] shadow-[2px_0_5px_rgba(0,0,0,0.2)]">
                  Produto / Serviço
                </th>
                <th className="p-3 border-r border-slate-800 min-w-[140px] bg-[#0f172a]">Categoria</th>
                <th className="p-3 border-r border-slate-800 min-w-[120px] bg-[#0f172a]">Valor Médio</th>
                <th className="p-3 border-r border-slate-800 bg-slate-800/80 text-center border-b-2 border-b-slate-700" colSpan={2}>
                   Consolidado Anual
                </th>
                {months.map(m => (
                  <th key={m.key} className="p-3 border-r border-slate-800 text-center min-w-[240px] bg-[#0f172a] border-b border-slate-800" colSpan={3}>
                    {m.label.toUpperCase()}/{year.toString().slice(2)}
                  </th>
                ))}
                <th className="p-3 bg-[#0f172a] text-center min-w-[60px]"></th>
              </tr>
              <tr className="text-[10px] text-slate-500 font-semibold tracking-wider">
                <th className="p-2 border-r border-slate-800 sticky left-0 bg-[#0f172a] z-30 shadow-[2px_0_5px_rgba(0,0,0,0.2)]"></th>
                <th className="p-2 border-r border-slate-800 bg-[#0f172a]"></th>
                <th className="p-2 border-r border-slate-800 bg-[#0f172a]"></th>
                <th className="p-2 border-r border-slate-800 bg-slate-800/50 text-center text-slate-300">Plan (R$)</th>
                <th className="p-2 border-r border-slate-800 bg-slate-800/50 text-center text-emerald-400">Real (R$)</th>
                {months.map(m => (
                  <React.Fragment key={m.key}>
                    <th className="p-2 border-r border-slate-800 text-center bg-[#0f172a]">Qtd Plan</th>
                    <th className="p-2 border-r border-slate-800 text-center bg-[#0f172a]">R$ Plan</th>
                    <th className="p-2 border-r border-slate-800 text-center bg-emerald-950/20 text-emerald-500 border-b-2 border-b-emerald-900/50">R$ Real</th>
                  </React.Fragment>
                ))}
                <th className="bg-[#0f172a]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {products.map((p, idx) => {
                const totalPlan = months.reduce((acc, m) => acc + (p.data?.[`${year}-${m.key}`]?.plannedR || 0), 0);
                const totalReal = months.reduce((acc, m) => acc + (p.data?.[`${year}-${m.key}`]?.realR || 0), 0);
                return (
                  <tr key={p.id} className={`group transition-colors ${idx % 2 === 0 ? 'bg-slate-900/20' : 'bg-transparent'} hover:bg-slate-800/60`}>
                    <td className="p-3 border-r border-slate-800 sticky left-0 bg-[#020617] group-hover:bg-[#0f172a] z-10 transition-colors shadow-[2px_0_5px_rgba(0,0,0,0.2)]">
                      <input 
                        className="bg-transparent text-slate-200 w-full outline-none font-bold placeholder-slate-600 focus:text-amber-500 transition-colors" 
                        value={p.name} 
                        onChange={e => updateProduct(p.id, 'name', e.target.value)}
                        placeholder="Nome do Produto"
                      />
                    </td>
                    <td className="p-3 border-r border-slate-800">
                      <div className="bg-slate-800/50 rounded px-2 py-1 border border-slate-700/30">
                        <input className="bg-transparent text-slate-400 w-full outline-none text-xs" value={p.category} onChange={e => updateProduct(p.id, 'category', e.target.value)} />
                      </div>
                    </td>
                    <td className="p-3 border-r border-slate-800">
                      <input type="number" className="bg-transparent text-slate-300 w-full outline-none text-right font-mono text-xs" value={p.avgPrice} onChange={e => updateProduct(p.id, 'avgPrice', Number(e.target.value))} />
                    </td>
                    <td className="p-3 border-r border-slate-800 bg-slate-800/20 text-right font-mono text-xs text-slate-400 font-medium">{formatCurrency(totalPlan)}</td>
                    <td className="p-3 border-r border-slate-800 bg-slate-800/20 text-right font-mono text-xs font-bold text-emerald-400 shadow-inner">{formatCurrency(totalReal)}</td>
                    
                    {months.map(m => {
                      const d = p.data?.[`${year}-${m.key}`] || { plannedQ: 0, plannedR: 0, realQ: 0, realR: 0 };
                      return (
                        <React.Fragment key={m.key}>
                          <td className="p-2 border-r border-slate-800 text-center">
                            <input type="number" className="w-16 bg-transparent text-center text-xs text-slate-500 outline-none focus:text-white focus:bg-slate-700 rounded transition-all" value={d.plannedQ || ''} placeholder="-" onChange={e => updateMonthData(p.id, m.key, 'plannedQ', Number(e.target.value))} />
                          </td>
                          <td className="p-2 border-r border-slate-800 text-right">
                             <div className="text-[10px] text-slate-600 font-mono">{d.plannedR ? (d.plannedR/1000).toFixed(1)+'k' : '-'}</div>
                          </td>
                          <td className="p-2 border-r border-slate-800 bg-emerald-950/10">
                             <input type="number" className="w-full bg-transparent text-right text-xs font-bold text-emerald-400 outline-none focus:bg-emerald-900/30 rounded px-1 transition-all" value={d.realR || ''} placeholder="-" onChange={e => updateMonthData(p.id, m.key, 'realR', Number(e.target.value))} />
                          </td>
                        </React.Fragment>
                      );
                    })}
                    <td className="p-2 text-center">
                       <button onClick={() => handleDelete(p.id)} className="text-slate-600 hover:text-red-500 transition-colors p-1.5 hover:bg-red-500/10 rounded"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                );
              })}
              
              {products.length === 0 && (
                <tr>
                   <td colSpan={42} className="p-12 text-center border-t border-slate-800">
                      <div className="flex flex-col items-center justify-center text-slate-500 opacity-60">
                         <Package size={48} className="mb-4 stroke-1" />
                         <p className="text-lg font-medium">Nenhum produto cadastrado</p>
                         <p className="text-sm mb-4">Comece adicionando seus produtos e serviços para projetar o faturamento.</p>
                         <Button onClick={handleAddProduct} variant="secondary"><Plus size={16}/> Adicionar Primeiro Produto</Button>
                      </div>
                   </td>
                </tr>
              )}
              
              {/* Add Button Row */}
              <tr>
                <td colSpan={42} className="p-3 bg-[#0f172a] border-t border-slate-800">
                  <button onClick={handleAddProduct} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-amber-500 transition-colors px-4 py-1 uppercase tracking-wider border border-dashed border-slate-700 hover:border-amber-500 rounded-lg w-full justify-center">
                    <Plus size={14} /> Adicionar Novo Item na Tabela
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Chart Section */}
      <Card className="border-slate-800">
        <div className="flex justify-between items-center mb-6">
           <h3 className="font-bold text-slate-100 flex items-center gap-2"><BarChart3 size={20} className="text-amber-500"/> Evolução Financeira</h3>
           <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-400"><div className="w-3 h-3 bg-slate-500 rounded-full"></div> Planejado</div>
              <div className="flex items-center gap-2 text-slate-400"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div> Realizado</div>
           </div>
        </div>
        <div className="h-80 w-full">
           <Line data={{
             labels: chartLabels,
             datasets: [
               { 
                 label: 'Planejado (R$)', 
                 data: chartDataPlanned, 
                 borderColor: '#64748b', 
                 borderDash: [6, 6], 
                 pointRadius: 3,
                 tension: 0.4 
               },
               { 
                 label: 'Realizado (R$)', 
                 data: chartDataReal, 
                 borderColor: '#10b981', 
                 backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, "rgba(16, 185, 129, 0.2)");
                    gradient.addColorStop(1, "rgba(16, 185, 129, 0)");
                    return gradient;
                 },
                 fill: true, 
                 tension: 0.4,
                 pointBackgroundColor: '#064e3b',
                 pointBorderColor: '#10b981',
                 pointBorderWidth: 2,
                 pointRadius: 4,
                 pointHoverRadius: 6
               }
             ]
           }} 
           options={{ 
             responsive: true, 
             maintainAspectRatio: false, 
             plugins: { 
               legend: { display: false },
               tooltip: { 
                 backgroundColor: '#0f172a', 
                 titleColor: '#f8fafc', 
                 bodyColor: '#cbd5e1', 
                 borderColor: '#334155', 
                 borderWidth: 1,
                 padding: 10,
                 displayColors: true,
                 callbacks: {
                   label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw as number)}`
                 }
               } 
             }, 
             scales: { 
               y: { 
                 grid: { color: '#1e293b', tickLength: 0 }, 
                 ticks: { color: '#64748b', font: { size: 10 }, callback: (v) => (Number(v)/1000).toFixed(0) + 'k' },
                 border: { display: false }
               }, 
               x: { 
                 grid: { display: false },
                 ticks: { color: '#94a3b8', font: { size: 11 } }
               } 
             } 
           }} />
        </div>
      </Card>
    </div>
  );
};

// ... (DREModule permanece o mesmo)
const dreRows = [
  { id: 'revProducts', label: 'Receita com Produto (+)', type: 'entry' },
  { id: 'revServices', label: 'Receita com Serviços (+)', type: 'entry' },
  { id: 'revFinancial', label: 'Receitas Financeiras (+)', type: 'entry' },
  { id: 'revNonOp', label: 'Entradas Não Operacionais (+)', type: 'entry' },
  { id: 'totalRev', label: 'TOTAL ENTRADAS (=)', type: 'calc', isBold: true },
  { id: 'taxes', label: 'Impostos (-)', type: 'exit' },
  { id: 'costVariable', label: 'Despesa Variável (-)', type: 'exit' },
  { id: 'costFixed', label: 'Despesa Fixa (-)', type: 'exit' },
  { id: 'investments', label: 'Investimento (-)', type: 'exit' },
  { id: 'costNonOp', label: 'Saída Não Operacional (-)', type: 'exit' },
  { id: 'totalCost', label: 'TOTAL SAÍDAS (=)', type: 'calc', isBold: true },
  { id: 'netProfit', label: 'LUCRO LÍQUIDO (=)', type: 'calc', isBold: true, isResult: true },
];

export const DREModule = ({ user }: { user: UserProfile }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState<Record<string, DRERecord>>({}); // key: month "01".."12"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load all months for the year
    const load = async () => {
      setLoading(true);
      const newData: Record<string, DRERecord> = {};
      
      // Initialize empty
      months.forEach(m => {
        newData[m.key] = {
           id: `${year}-${m.key}`, month: `${year}-${m.key}`,
           revProducts: {planned:0, real:0}, revServices: {planned:0, real:0}, revFinancial: {planned:0, real:0}, revNonOp: {planned:0, real:0},
           taxes: {planned:0, real:0}, costVariable: {planned:0, real:0}, costFixed: {planned:0, real:0}, investments: {planned:0, real:0}, costNonOp: {planned:0, real:0}
        };
      });

      try {
         // Fetch existing
         for(const m of months) {
           const id = `${year}-${m.key}`;
           const snap = await getDoc(doc(db, getCollectionPath(user.uid, 'finance_dre'), id));
           if(snap.exists()) newData[m.key] = snap.data() as DRERecord;
         }
         setData(newData);
      } catch(e) {
         console.error(e);
      } finally {
         setLoading(false);
      }
    };
    load();
  }, [user.uid, year]);

  const updateVal = async (monthKey: string, field: keyof DRERecord, subField: 'planned' | 'real', val: number) => {
    const updatedRecord = { ...data[monthKey] };
    const item = updatedRecord[field] as any;
    // Type guard basic
    if(item && typeof item === 'object') {
       updatedRecord[field] = { ...item, [subField]: val };
    }
    setData({ ...data, [monthKey]: updatedRecord });
    
    // Auto Save
    await setDoc(doc(db, getCollectionPath(user.uid, 'finance_dre'), updatedRecord.id), updatedRecord);
  };

  const getSum = (monthKey: string, type: 'entry' | 'exit', sub: 'planned' | 'real') => {
    const r = data[monthKey];
    if(!r) return 0;
    if(type === 'entry') return (r.revProducts?.[sub]||0) + (r.revServices?.[sub]||0) + (r.revFinancial?.[sub]||0) + (r.revNonOp?.[sub]||0);
    if(type === 'exit') return (r.taxes?.[sub]||0) + (r.costVariable?.[sub]||0) + (r.costFixed?.[sub]||0) + (r.investments?.[sub]||0) + (r.costNonOp?.[sub]||0);
    return 0;
  };

  if(loading) return <Spinner />;

  return (
    <div className="space-y-6 pb-10">
       <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold text-slate-100">Planejamento Financeiro (DRE)</h1>
         <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="bg-[#020617] border border-slate-700 rounded-lg px-3 py-2 text-white w-24 text-center font-bold focus:border-amber-500 outline-none" />
       </div>

       <Card className="p-0 overflow-hidden border-slate-700">
         <div className="overflow-x-auto">
           <table className="w-full text-sm border-collapse">
              <thead className="bg-[#0f172a] sticky top-0 z-20 shadow-lg">
                <tr>
                   <th className="p-3 border-r border-slate-700 text-left min-w-[200px] sticky left-0 bg-[#0f172a] z-30 font-bold text-slate-300 shadow-[2px_0_5px_rgba(0,0,0,0.2)]">DRE / {year}</th>
                   {months.map(m => (
                     <th key={m.key} colSpan={4} className="p-2 border-r border-slate-700 text-center font-bold text-slate-400 bg-[#0f172a] border-b border-slate-700">
                        {m.label.toUpperCase()}
                     </th>
                   ))}
                </tr>
                <tr className="text-[10px] uppercase text-slate-500 font-semibold">
                   <th className="p-2 border-r border-slate-700 sticky left-0 bg-[#0f172a] z-30 shadow-[2px_0_5px_rgba(0,0,0,0.2)]"></th>
                   {months.map(m => (
                     <React.Fragment key={m.key}>
                       <th className="p-1 border-r border-slate-700 min-w-[80px] bg-slate-900/50">Previsto</th>
                       <th className="p-1 border-r border-slate-700 min-w-[40px] bg-slate-900/50">%</th>
                       <th className="p-1 border-r border-slate-700 min-w-[80px] bg-[#020617]">Realizado</th>
                       <th className="p-1 border-r border-slate-700 min-w-[40px] bg-[#020617]">%</th>
                     </React.Fragment>
                   ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                 {dreRows.map(row => (
                   <tr key={row.id} className={row.isResult ? "bg-slate-800/80 font-bold" : "hover:bg-slate-800/30"}>
                      <td className={`p-2 border-r border-slate-700 sticky left-0 bg-[#020617] z-10 shadow-[2px_0_5px_rgba(0,0,0,0.2)] ${row.isBold ? 'font-bold text-slate-100' : 'text-slate-300'}`}>
                         {row.label}
                      </td>
                      {months.map(m => {
                        const rec = data[m.key];
                        let plan = 0, real = 0;
                        
                        if(row.type === 'calc') {
                           if(row.id === 'totalRev') { plan = getSum(m.key, 'entry', 'planned'); real = getSum(m.key, 'entry', 'real'); }
                           if(row.id === 'totalCost') { plan = getSum(m.key, 'exit', 'planned'); real = getSum(m.key, 'exit', 'real'); }
                           if(row.id === 'netProfit') {
                              plan = getSum(m.key, 'entry', 'planned') - getSum(m.key, 'exit', 'planned');
                              real = getSum(m.key, 'entry', 'real') - getSum(m.key, 'exit', 'real');
                           }
                        } else {
                           plan = (rec as any)[row.id]?.planned || 0;
                           real = (rec as any)[row.id]?.real || 0;
                        }

                        // Variation
                        const varVal = real - plan;
                        const varPerc = plan !== 0 ? (varVal / plan) * 100 : 0;

                        return (
                           <React.Fragment key={m.key}>
                              <td className="p-1 border-r border-slate-700 bg-slate-900/20">
                                 {row.type !== 'calc' ? (
                                   <input type="number" className="w-full bg-transparent text-right outline-none text-xs text-slate-300 focus:text-white transition-colors" value={plan || ''} placeholder="0" onChange={e => updateVal(m.key, row.id as any, 'planned', Number(e.target.value))} />
                                 ) : (
                                   <div className="text-right text-xs pr-1">{formatCurrency(plan)}</div>
                                 )}
                              </td>
                              <td className="p-1 border-r border-slate-700 bg-slate-900/20 text-center text-[10px] text-slate-600">100%</td>
                              
                              <td className={`p-1 border-r border-slate-700 ${row.isResult && real < 0 ? 'bg-red-900/20' : ''}`}>
                                 {row.type !== 'calc' ? (
                                   <input type="number" className="w-full bg-transparent text-right outline-none text-xs text-emerald-300 font-medium focus:text-emerald-400 transition-colors" value={real || ''} placeholder="0" onChange={e => updateVal(m.key, row.id as any, 'real', Number(e.target.value))} />
                                 ) : (
                                   <div className={`text-right text-xs pr-1 ${real < 0 ? 'text-red-400' : 'text-emerald-400'}`}>{formatCurrency(real)}</div>
                                 )}
                              </td>
                              <td className={`p-1 border-r border-slate-700 text-center text-[10px] ${varPerc < 0 ? 'text-red-400' : 'text-emerald-500'}`}>
                                 {row.type === 'calc' && real !== 0 ? '100%' : (plan !== 0 ? `${varPerc.toFixed(0)}%` : '-')}
                              </td>
                           </React.Fragment>
                        );
                      })}
                   </tr>
                 ))}
              </tbody>
           </table>
         </div>
       </Card>
    </div>
  );
};