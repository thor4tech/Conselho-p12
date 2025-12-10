
import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Spinner } from '../components';
import { UserProfile, Persona, DRERecord, ProductRecord, ProductMonthData } from '../types';
import { fetchCollection, saveDocument, deleteDocument, formatCurrency, db, getCollectionPath } from '../services';
import { Trash2, Plus, Save, User, ChevronRight, ChevronLeft, BarChart3 } from 'lucide-react';
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
      {/* Sidebar List */}
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
              className={`p-3 rounded cursor-pointer border flex items-center gap-3 transition-colors ${selected?.id === p.id ? 'border-amber-500 bg-amber-500/10 text-amber-500' : 'border-slate-700 hover:bg-slate-700 text-slate-300'}`}
            >
              <User size={18} />
              <div className="font-medium truncate">{p.name}</div>
            </div>
          ))}
          {personas.length === 0 && <div className="text-slate-500 text-sm text-center py-4">Nenhuma persona cadastrada.</div>}
        </div>
      </Card>

      {/* Main Form Area */}
      <Card className="md:col-span-3 overflow-y-auto custom-scrollbar">
        {selected ? (
          <div className="space-y-6 pb-10">
            <div className="flex justify-between items-center border-b border-slate-700 pb-4">
              <div className="w-1/2">
                <Input label="Definição de Persona (Nome)" value={selected.name} onChange={(e:any) => setSelected({...selected, name: e.target.value})} />
              </div>
              <div className="flex gap-2">
                 <Button variant="danger" onClick={handleDelete}><Trash2 size={16} /></Button>
                 <Button onClick={handleSave}><Save size={16} /> Salvar Persona</Button>
              </div>
            </div>

            <div className="bg-slate-800 p-4 rounded border border-slate-600 mb-6">
               <p className="text-slate-300 text-sm italic mb-2">
                 "Sem realmente conhecer quem é o seu cliente, você jamais conseguirá suprir as necessidades dele. Muitas vezes os empresários querem oferecer o que é melhor para eles mesmos e não para seus clientes."
               </p>
               <p className="text-amber-500 font-bold text-sm">
                 Suas vendas serão escaláveis somente quando você se interessar verdadeiramente pelas pessoas.
               </p>
            </div>

            <div className="space-y-6">
              <QuestionBlock 
                number="1" 
                question="ONDE O SEU COMPRADOR DOS SONHOS VAI PARA SE DIVERTIR E SOCIALIZAR? (Seja específico)" 
                value={selected.q1} 
                onChange={(v) => setSelected({...selected, q1: v})} 
              />
              <QuestionBlock 
                number="2" 
                question="ONDE O COMPRADOR DOS SEUS SONHOS CONSEGUE INFORMAÇÕES?" 
                value={selected.q2} 
                onChange={(v) => setSelected({...selected, q2: v})} 
              />
              <QuestionBlock 
                number="3" 
                question="QUAIS SÃO SUAS MAIORES FRUSTRAÇÕES E DESAFIOS?" 
                value={selected.q3} 
                onChange={(v) => setSelected({...selected, q3: v})} 
              />
              <QuestionBlock 
                number="4" 
                question="QUAIS SÃO SUAS ESPERANÇAS, SONHOS E DESEJOS?" 
                value={selected.q4} 
                onChange={(v) => setSelected({...selected, q4: v})} 
              />
              <QuestionBlock 
                number="5" 
                question="QUAIS SÃO SEUS MAIORES MEDOS?" 
                value={selected.q5} 
                onChange={(v) => setSelected({...selected, q5: v})} 
              />
              <QuestionBlock 
                number="6" 
                question="QUAL A SUA FORMA PREFERIDA DE COMUNICAÇÃO?" 
                value={selected.q6} 
                onChange={(v) => setSelected({...selected, q6: v})} 
              />
              <QuestionBlock 
                number="7" 
                question="QUAIS FRASES, TERMOS E EXPRESSÕES ELES USAM?" 
                value={selected.q7} 
                onChange={(v) => setSelected({...selected, q7: v})} 
              />
              <QuestionBlock 
                number="8" 
                question="COMO É O DIA A DIA/COTIDIANO DE SUAS VIDAS?" 
                value={selected.q8} 
                onChange={(v) => setSelected({...selected, q8: v})} 
              />
              <QuestionBlock 
                number="9" 
                question="O QUE O FAZ FELIZ?" 
                value={selected.q9} 
                onChange={(v) => setSelected({...selected, q9: v})} 
              />
            </div>
            
            <div className="pt-6 border-t border-slate-700 flex justify-end">
              <Button onClick={handleSave} className="w-full md:w-auto"><Save size={16} /> Salvar Persona</Button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <User size={48} className="mb-4 opacity-50"/>
            <p>Selecione uma persona ao lado ou crie uma nova para começar.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

const QuestionBlock = ({ number, question, value, onChange }: { number: string, question: string, value: string, onChange: (v: string) => void }) => (
  <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
    <div className="bg-slate-700 px-4 py-2 font-bold text-slate-100 text-sm flex gap-2">
      <span className="text-amber-500">{number}-</span> {question}
    </div>
    <textarea 
      className="w-full bg-slate-900 p-4 text-slate-100 focus:outline-none focus:bg-slate-800 transition-colors h-32 resize-y"
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)}
      placeholder="Descreva aqui..."
    />
  </div>
);

// --- PRODUCT REVENUE MODULE (Faturamento por Produto) ---

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
    // Debounce save in production, direct for now
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
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Faturamento por Produto</h1>
          <div className="flex items-center gap-4 mt-2">
            <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white w-24" />
            <Button size="sm" onClick={handleAddProduct}><Plus size={16}/> Adicionar Produto</Button>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden p-0 border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-900 text-xs uppercase text-slate-400 font-bold sticky top-0 z-10">
              <tr>
                <th className="p-3 border-r border-slate-700 sticky left-0 bg-slate-900 z-20 min-w-[150px]">Produto / Serviço</th>
                <th className="p-3 border-r border-slate-700 min-w-[100px]">Categoria</th>
                <th className="p-3 border-r border-slate-700 min-w-[100px]">Valor Médio</th>
                <th className="p-3 border-r border-slate-700 bg-slate-800 text-center" colSpan={2}>Anual</th>
                {months.map(m => (
                  <th key={m.key} className="p-3 border-r border-slate-700 text-center min-w-[200px]" colSpan={3}>
                    {m.label}/{year.toString().slice(2)}
                  </th>
                ))}
                <th className="p-3">Ações</th>
              </tr>
              <tr>
                <th className="p-2 border-r border-slate-700 sticky left-0 bg-slate-900"></th>
                <th className="p-2 border-r border-slate-700"></th>
                <th className="p-2 border-r border-slate-700"></th>
                <th className="p-2 border-r border-slate-700 bg-slate-800 text-center text-[10px]">Plan (R$)</th>
                <th className="p-2 border-r border-slate-700 bg-slate-800 text-center text-[10px]">Real (R$)</th>
                {months.map(m => (
                  <React.Fragment key={m.key}>
                    <th className="p-2 border-r border-slate-700 text-center text-[10px] bg-slate-800/50">Plan (Q)</th>
                    <th className="p-2 border-r border-slate-700 text-center text-[10px] bg-slate-800/50">Plan (R$)</th>
                    <th className="p-2 border-r border-slate-700 text-center text-[10px] bg-emerald-900/20">Real (R$)</th>
                  </React.Fragment>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {products.map(p => {
                const totalPlan = months.reduce((acc, m) => acc + (p.data?.[`${year}-${m.key}`]?.plannedR || 0), 0);
                const totalReal = months.reduce((acc, m) => acc + (p.data?.[`${year}-${m.key}`]?.realR || 0), 0);
                return (
                  <tr key={p.id} className="hover:bg-slate-800/50">
                    <td className="p-2 border-r border-slate-700 sticky left-0 bg-slate-950 z-10">
                      <input className="bg-transparent text-white w-full outline-none font-medium" value={p.name} onChange={e => updateProduct(p.id, 'name', e.target.value)} />
                    </td>
                    <td className="p-2 border-r border-slate-700">
                      <input className="bg-transparent text-slate-300 w-full outline-none" value={p.category} onChange={e => updateProduct(p.id, 'category', e.target.value)} />
                    </td>
                    <td className="p-2 border-r border-slate-700">
                      <input type="number" className="bg-transparent text-slate-300 w-full outline-none text-right" value={p.avgPrice} onChange={e => updateProduct(p.id, 'avgPrice', Number(e.target.value))} />
                    </td>
                    <td className="p-2 border-r border-slate-700 bg-slate-800 text-right font-bold text-slate-300">{formatCurrency(totalPlan)}</td>
                    <td className="p-2 border-r border-slate-700 bg-slate-800 text-right font-bold text-emerald-400">{formatCurrency(totalReal)}</td>
                    
                    {months.map(m => {
                      const d = p.data?.[`${year}-${m.key}`] || { plannedQ: 0, plannedR: 0, realQ: 0, realR: 0 };
                      return (
                        <React.Fragment key={m.key}>
                          <td className="p-1 border-r border-slate-700">
                            <input type="number" className="w-full bg-transparent text-right text-xs outline-none focus:bg-slate-700 rounded" value={d.plannedQ || ''} placeholder="0" onChange={e => updateMonthData(p.id, m.key, 'plannedQ', Number(e.target.value))} />
                          </td>
                          <td className="p-1 border-r border-slate-700">
                             <input type="number" className="w-full bg-transparent text-right text-xs outline-none focus:bg-slate-700 rounded" value={d.plannedR || ''} placeholder="0" onChange={e => updateMonthData(p.id, m.key, 'plannedR', Number(e.target.value))} />
                          </td>
                          <td className="p-1 border-r border-slate-700 bg-emerald-900/10">
                             <input type="number" className="w-full bg-transparent text-right text-xs font-medium text-emerald-300 outline-none focus:bg-slate-700 rounded" value={d.realR || ''} placeholder="0" onChange={e => updateMonthData(p.id, m.key, 'realR', Number(e.target.value))} />
                          </td>
                        </React.Fragment>
                      );
                    })}
                    <td className="p-2 text-center">
                       <button onClick={() => handleDelete(p.id)} className="text-slate-600 hover:text-red-400"><Trash2 size={14}/></button>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr><td colSpan={42} className="p-8 text-center text-slate-500">Nenhum produto cadastrado. Adicione um novo para começar.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2"><BarChart3 size={18}/> Evolução dos Produtos / Serviços</h3>
        <div className="h-64 w-full">
           <Line data={{
             labels: chartLabels,
             datasets: [
               { label: 'Planejado (R$)', data: chartDataPlanned, borderColor: '#64748b', tension: 0.3, borderDash: [5, 5] },
               { label: 'Realizado (R$)', data: chartDataReal, borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.3 }
             ]
           }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { grid: { color: '#334155' } }, x: { grid: { display: false } } } }} />
        </div>
      </Card>
    </div>
  );
};

// --- DRE MODULE (Planejamento Financeiro) ---
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
         <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="bg-slate-900 border border-slate-700 rounded px-3 py-1 text-white w-24 text-center font-bold" />
       </div>

       <Card className="p-0 overflow-hidden border-slate-700">
         <div className="overflow-x-auto">
           <table className="w-full text-sm border-collapse">
              <thead className="bg-slate-900 sticky top-0 z-20">
                <tr>
                   <th className="p-3 border-r border-slate-700 text-left min-w-[200px] sticky left-0 bg-slate-900 z-30 font-bold text-slate-300">DRE / {year}</th>
                   {months.map(m => (
                     <th key={m.key} colSpan={4} className="p-2 border-r border-slate-700 text-center font-bold text-slate-400 bg-slate-900 border-b border-slate-700">
                        {m.label.toUpperCase()}
                     </th>
                   ))}
                </tr>
                <tr className="text-[10px] uppercase text-slate-500">
                   <th className="p-2 border-r border-slate-700 sticky left-0 bg-slate-900 z-30"></th>
                   {months.map(m => (
                     <React.Fragment key={m.key}>
                       <th className="p-1 border-r border-slate-700 min-w-[80px] bg-slate-800">Previsto</th>
                       <th className="p-1 border-r border-slate-700 min-w-[40px] bg-slate-800">%</th>
                       <th className="p-1 border-r border-slate-700 min-w-[80px] bg-slate-900">Realizado</th>
                       <th className="p-1 border-r border-slate-700 min-w-[40px] bg-slate-900">%</th>
                     </React.Fragment>
                   ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                 {dreRows.map(row => (
                   <tr key={row.id} className={row.isResult ? "bg-slate-800/80 font-bold" : "hover:bg-slate-800/30"}>
                      <td className={`p-2 border-r border-slate-700 sticky left-0 bg-slate-950 z-10 ${row.isBold ? 'font-bold text-slate-100' : 'text-slate-300'}`}>
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
                              <td className="p-1 border-r border-slate-700 bg-slate-800/30">
                                 {row.type !== 'calc' ? (
                                   <input type="number" className="w-full bg-transparent text-right outline-none text-xs text-slate-300" value={plan || ''} placeholder="0" onChange={e => updateVal(m.key, row.id as any, 'planned', Number(e.target.value))} />
                                 ) : (
                                   <div className="text-right text-xs pr-1">{formatCurrency(plan)}</div>
                                 )}
                              </td>
                              <td className="p-1 border-r border-slate-700 bg-slate-800/30 text-center text-[10px] text-slate-500">100%</td>
                              
                              <td className={`p-1 border-r border-slate-700 ${row.isResult && real < 0 ? 'bg-red-900/20' : ''}`}>
                                 {row.type !== 'calc' ? (
                                   <input type="number" className="w-full bg-transparent text-right outline-none text-xs text-emerald-300 font-medium" value={real || ''} placeholder="0" onChange={e => updateVal(m.key, row.id as any, 'real', Number(e.target.value))} />
                                 ) : (
                                   <div className={`text-right text-xs pr-1 ${real < 0 ? 'text-red-400' : 'text-emerald-400'}`}>{formatCurrency(real)}</div>
                                 )}
                              </td>
                              <td className={`p-1 border-r border-slate-700 text-center text-[10px] ${varPerc < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
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
