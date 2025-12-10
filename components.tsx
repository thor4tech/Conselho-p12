
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Target, 
  Wallet, 
  Users, 
  GitMerge, 
  KanbanSquare, 
  Menu, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  Plus,
  Trash2,
  Save,
  Loader2
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from './services';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  ArcElement,
} from 'chart.js';

// --- CHART REGISTRATION ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// --- UI PRIMITIVES ---

export const Card = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
  <div className={`bg-slate-800 border border-slate-700 rounded-lg p-6 shadow-sm ${className}`}>
    {children}
  </div>
);

export const Button = ({ onClick, children, variant = "primary", className = "", disabled = false }: any) => {
  const baseStyle = "px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-amber-500 hover:bg-amber-600 text-slate-900",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-100",
    danger: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50",
    ghost: "bg-transparent hover:bg-slate-700 text-slate-300"
  };
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {disabled && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

export const Input = ({ label, ...props }: any) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>}
    <input 
      className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
      {...props}
    />
  </div>
);

export const Spinner = () => (
  <div className="flex justify-center items-center p-8">
    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
  </div>
);

// --- LAYOUT COMPONENTS ---

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const MenuItem = ({ id, label, icon: Icon, active, onClick }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-2
      ${active ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800'}`}
  >
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

const SubMenuItem = ({ id, label, active, onClick }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 pl-12 pr-4 py-2 text-sm transition-colors
      ${active ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
  >
    <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-amber-500' : 'bg-slate-600'}`} />
    <span>{label}</span>
  </button>
);

export const Sidebar = ({ currentView, onChangeView, isOpen, toggleSidebar }: SidebarProps) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    diagnose: true,
    strategy: true,
    sales: true, // Default open for Sales
    people: false,
    processes: false,
    ops: false
  });

  const toggleGroup = (group: string) => setExpanded(prev => ({ ...prev, [group]: !prev[group] }));

  return (
    <aside className={`fixed md:relative z-20 h-full bg-slate-900 border-r border-slate-700 w-64 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="h-16 flex items-center px-6 border-b border-slate-700">
        <div className="font-bold text-xl tracking-wider text-slate-100">
          CONSELHO <span className="text-amber-500">P12</span>
        </div>
      </div>
      
      <div className="overflow-y-auto h-[calc(100vh-4rem)] py-4">
        <MenuItem id="dashboard" label="Painel Geral" icon={LayoutDashboard} active={currentView === 'dashboard'} onClick={onChangeView} />
        
        {/* Diagnose Group */}
        <div className="mt-2">
          <button onClick={() => toggleGroup('diagnose')} className="w-full flex items-center justify-between px-4 py-2 text-slate-400 hover:text-slate-100">
            <div className="flex items-center gap-3 text-sm font-medium">
              <Stethoscope size={18} /> <span>Diagnóstico</span>
            </div>
            {expanded.diagnose ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          {expanded.diagnose && (
            <div className="bg-slate-900/50">
              <SubMenuItem id="diagnose_main" label="Análise & Fases" active={currentView === 'diagnose_main'} onClick={onChangeView} />
            </div>
          )}
        </div>

        {/* Strategy Group */}
        <div className="mt-2">
          <button onClick={() => toggleGroup('strategy')} className="w-full flex items-center justify-between px-4 py-2 text-slate-400 hover:text-slate-100">
            <div className="flex items-center gap-3 text-sm font-medium">
              <Target size={18} /> <span>Estratégia</span>
            </div>
            {expanded.strategy ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          {expanded.strategy && (
            <div className="bg-slate-900/50">
              <SubMenuItem id="strategy_identity" label="Identidade Organizacional" active={currentView === 'strategy_identity'} onClick={onChangeView} />
              <SubMenuItem id="strategy_swot" label="Matriz SWOT" active={currentView === 'strategy_swot'} onClick={onChangeView} />
            </div>
          )}
        </div>

        {/* Sales & Finance */}
        <div className="mt-2">
          <button onClick={() => toggleGroup('sales')} className="w-full flex items-center justify-between px-4 py-2 text-slate-400 hover:text-slate-100">
            <div className="flex items-center gap-3 text-sm font-medium">
              <Wallet size={18} /> <span>Vendas / Financeiro</span>
            </div>
            {expanded.sales ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          {expanded.sales && (
            <div className="bg-slate-900/50">
              <SubMenuItem id="sales_personas" label="Definição de Persona" active={currentView === 'sales_personas'} onClick={onChangeView} />
              <SubMenuItem id="sales_revenue_products" label="Faturamento por Produto" active={currentView === 'sales_revenue_products'} onClick={onChangeView} />
              <SubMenuItem id="finance_dre" label="Planejamento Financeiro" active={currentView === 'finance_dre'} onClick={onChangeView} />
            </div>
          )}
        </div>

        {/* People */}
        <div className="mt-2">
          <button onClick={() => toggleGroup('people')} className="w-full flex items-center justify-between px-4 py-2 text-slate-400 hover:text-slate-100">
            <div className="flex items-center gap-3 text-sm font-medium">
              <Users size={18} /> <span>Gestão de Pessoas</span>
            </div>
            {expanded.people ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          {expanded.people && (
            <div className="bg-slate-900/50">
              <SubMenuItem id="people_org" label="Organograma" active={currentView === 'people_org'} onClick={onChangeView} />
              <SubMenuItem id="people_jobs" label="Descrição de Função" active={currentView === 'people_jobs'} onClick={onChangeView} />
              <SubMenuItem id="people_eval" label="Avaliação de Desempenho" active={currentView === 'people_eval'} onClick={onChangeView} />
              <SubMenuItem id="people_9box" label="Nine Box" active={currentView === 'people_9box'} onClick={onChangeView} />
            </div>
          )}
        </div>

        {/* Processes */}
        <div className="mt-2">
          <button onClick={() => toggleGroup('processes')} className="w-full flex items-center justify-between px-4 py-2 text-slate-400 hover:text-slate-100">
            <div className="flex items-center gap-3 text-sm font-medium">
              <GitMerge size={18} /> <span>Gestão de Processos</span>
            </div>
            {expanded.processes ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          {expanded.processes && (
            <div className="bg-slate-900/50">
              <SubMenuItem id="process_bsc" label="BSC" active={currentView === 'process_bsc'} onClick={onChangeView} />
            </div>
          )}
        </div>

         {/* Operations */}
         <div className="mt-2">
          <button onClick={() => toggleGroup('ops')} className="w-full flex items-center justify-between px-4 py-2 text-slate-400 hover:text-slate-100">
            <div className="flex items-center gap-3 text-sm font-medium">
              <KanbanSquare size={18} /> <span>Projetos (Kanban)</span>
            </div>
            {expanded.ops ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          {expanded.ops && (
            <div className="bg-slate-900/50">
              <SubMenuItem id="ops_kanban" label="Quadro de Tarefas" active={currentView === 'ops_kanban'} onClick={onChangeView} />
            </div>
          )}
        </div>

      </div>
    </aside>
  );
};

export const Header = ({ userProfile, toggleSidebar }: any) => {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="md:hidden text-slate-300 hover:text-slate-100">
          <Menu size={24} />
        </button>
        <h2 className="text-lg font-medium text-slate-100 hidden md:block">{userProfile?.companyName || "Minha Empresa"}</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <div className="text-sm font-medium text-slate-100">{userProfile?.name}</div>
          <div className="text-xs text-slate-400">Administrador</div>
        </div>
        <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center font-bold text-slate-900">
          {userProfile?.name?.charAt(0) || "U"}
        </div>
        <button onClick={() => signOut(auth)} className="text-slate-400 hover:text-red-400 transition-colors" title="Sair">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};
