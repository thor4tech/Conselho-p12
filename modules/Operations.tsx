import React, { useState, useEffect } from 'react';
import { ProjectTask, UserProfile } from '../types';
import { fetchCollection, saveDocument } from '../services';

export const KanbanModule = ({ user }: { user: UserProfile }) => {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    const load = async () => {
       const res = await fetchCollection(user.uid, 'projects_default_tasks'); 
       setTasks(res as ProjectTask[]);
    };
    load();
  }, [user.uid]);

  const addTask = async () => {
    if(!newTask) return;
    const task = { title: newTask, status: 'todo' as const, responsible: 'Eu', dueDate: new Date().toISOString() };
    const id = await saveDocument(user.uid, 'projects_default_tasks', task);
    setTasks([...tasks, { ...task, id }]);
    setNewTask('');
  };

  const moveTask = async (task: ProjectTask, newStatus: 'todo' | 'doing' | 'done') => {
    const updated = { ...task, status: newStatus };
    setTasks(tasks.map(t => t.id === task.id ? updated : t));
    await saveDocument(user.uid, 'projects_default_tasks', updated, task.id);
  };

  const Column = ({ title, status, color }: any) => (
    <div className="flex-1 min-w-[300px] bg-slate-900/50 rounded-lg p-4 border border-slate-700">
      <h3 className={`font-bold mb-4 pb-2 border-b border-slate-700 ${color}`}>{title}</h3>
      <div className="space-y-3">
        {tasks.filter(t => t.status === status).map(t => (
          <div key={t.id} className="bg-slate-800 p-3 rounded shadow text-sm text-slate-200 border border-slate-700 group">
             <div className="font-medium mb-2">{t.title}</div>
             <div className="flex justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {status !== 'todo' && <button onClick={() => moveTask(t, 'todo')} className="text-xs text-slate-500 hover:text-white">A Fazer</button>}
                {status !== 'doing' && <button onClick={() => moveTask(t, 'doing')} className="text-xs text-slate-500 hover:text-blue-400">Fazendo</button>}
                {status !== 'done' && <button onClick={() => moveTask(t, 'done')} className="text-xs text-slate-500 hover:text-emerald-400">Feito</button>}
             </div>
          </div>
        ))}
        {status === 'todo' && (
          <div className="mt-4 flex gap-2">
            <input className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs w-full text-white" placeholder="Nova Tarefa..." value={newTask} onChange={e=>setNewTask(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addTask()} />
            <button onClick={addTask} className="bg-amber-500 text-slate-900 rounded px-2 text-xs font-bold">+</button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-x-auto">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Quadro Kanban</h1>
      <div className="flex gap-4 items-start h-[calc(100vh-200px)]">
         <Column title="A Fazer" status="todo" color="text-slate-400" />
         <Column title="Fazendo" status="doing" color="text-blue-400" />
         <Column title="Concluído" status="done" color="text-emerald-400" />
      </div>
    </div>
  );
};
