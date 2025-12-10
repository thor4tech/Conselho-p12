import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '../components';
import { UserProfile, Employee, OrgNode } from '../types';
import { fetchCollection, saveDocument } from '../services';
import { Radar } from 'react-chartjs-2';

export const PeopleModule = ({ user, view }: { user: UserProfile, view: string }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    fetchCollection(user.uid, 'people_employees').then(d => setEmployees(d as Employee[]));
  }, [user.uid]);

  if (view === 'people_org') return <OrgChart user={user} />;
  if (view === 'people_9box') return <NineBox user={user} employees={employees} />;
  if (view === 'people_eval') return <Evaluations user={user} employees={employees} />;
  
  return <div className="text-slate-400">Selecione um submódulo</div>;
};

const OrgChart = ({ user }: { user: UserProfile }) => {
  return (
    <Card className="min-h-[500px] flex items-center justify-center border-dashed">
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-100">Organograma</h3>
        <p className="text-slate-400">Funcionalidade: Diagrama Interativo apareceria aqui.</p>
        <p className="text-xs text-slate-600 mt-2">Conectando cargos via parentId recursivamente.</p>
      </div>
    </Card>
  );
};

const NineBox = ({ user, employees }: { user: UserProfile, employees: Employee[] }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Matriz Nine Box</h2>
      <div className="grid grid-cols-3 gap-1 bg-slate-700 p-1 aspect-square max-w-2xl mx-auto rounded">
         {/* Top Row: High Potential */}
         <div className="bg-slate-800 p-4 relative group hover:bg-slate-800/80"><span className="absolute top-2 left-2 text-xs text-slate-500">Enigma</span></div>
         <div className="bg-slate-800 p-4 relative group hover:bg-slate-800/80"><span className="absolute top-2 left-2 text-xs text-slate-500">Forte Desempenho</span></div>
         <div className="bg-slate-800 p-4 relative group hover:bg-emerald-900/20"><span className="absolute top-2 left-2 text-xs text-slate-500">Alto Potencial</span></div>
         
         {/* Mid Row */}
         <div className="bg-slate-800 p-4 relative group hover:bg-slate-800/80"><span className="absolute top-2 left-2 text-xs text-slate-500">Questionável</span></div>
         <div className="bg-slate-800 p-4 relative group hover:bg-slate-800/80"><span className="absolute top-2 left-2 text-xs text-slate-500">Mantenedor</span></div>
         <div className="bg-slate-800 p-4 relative group hover:bg-slate-800/80"><span className="absolute top-2 left-2 text-xs text-slate-500">Forte Desempenho</span></div>
         
         {/* Bottom Row */}
         <div className="bg-slate-800 p-4 relative group hover:bg-red-900/20"><span className="absolute top-2 left-2 text-xs text-slate-500">Insuficiente</span></div>
         <div className="bg-slate-800 p-4 relative group hover:bg-slate-800/80"><span className="absolute top-2 left-2 text-xs text-slate-500">Eficaz</span></div>
         <div className="bg-slate-800 p-4 relative group hover:bg-slate-800/80"><span className="absolute top-2 left-2 text-xs text-slate-500">Comprometido</span></div>
      </div>
      <div className="text-center text-sm text-slate-400">
         Eixos: Y = Potencial, X = Desempenho
      </div>
    </div>
  );
};

const Evaluations = ({ user, employees }: { user: UserProfile, employees: Employee[] }) => {
  const [selectedEmp, setSelectedEmp] = useState<string>('');
  const [scores, setScores] = useState({ technique: 5, behavior: 5, delivery: 5, deadlines: 5, innovation: 5 });

  const handleSave = async () => {
    if(!selectedEmp) return;
    const scoreValues = Object.values(scores) as number[];
    const avg = scoreValues.reduce((a, b) => a + b, 0) / 5;
    await saveDocument(user.uid, 'people_evaluations', {
      employeeId: selectedEmp,
      date: new Date().toISOString(),
      skills: scores,
      performanceScore: avg,
      potentialScore: avg,
      feedback: 'Avaliação Gerada'
    });
    alert('Avaliação Salva');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <h3 className="font-bold mb-4">Nova Avaliação</h3>
        <select className="w-full bg-slate-900 border border-slate-700 p-2 rounded mb-4 text-white" value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)}>
           <option value="">Selecione Colaborador...</option>
           {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        
        {Object.keys(scores).map(key => (
          <div key={key} className="mb-3">
             <div className="flex justify-between text-sm mb-1 capitalize text-slate-300">
                <span>{key}</span><span>{scores[key as keyof typeof scores]}</span>
             </div>
             <input type="range" min="0" max="10" value={scores[key as keyof typeof scores]} onChange={e => setScores({...scores, [key]: Number(e.target.value)})} className="w-full accent-amber-500"/>
          </div>
        ))}
        <Button onClick={handleSave} className="w-full mt-4">Salvar Avaliação</Button>
      </Card>
      
      <Card className="flex items-center justify-center">
         <div className="w-full max-w-xs">
           <Radar data={{
             labels: Object.keys(scores),
             datasets: [{ label: 'Pontuação', data: Object.values(scores), borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.2)' }]
           }} options={{ scales: { r: { min: 0, max: 10, grid: { color: '#334155' }, angleLines: { color: '#334155' }}}}} />
         </div>
      </Card>
    </div>
  );
};
