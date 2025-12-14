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
  Loader2,
  Bell,
  Search
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
  <div className={`bg-[#0f172a] border border-slate-800 rounded-xl p-6 shadow-lg ${className}`}>
    {children}
  </div>
);

export const Button = ({ onClick, children, variant = "primary", className = "", disabled = false, size = "md" }: any) => {
  const baseStyle = "rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#020617]";
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const variants = {
    primary: "bg-amber-500 hover:bg-amber-400 text-[#020617] focus:ring-amber-500 shadow-amber-500/10",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 focus:ring-slate-500",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 focus:ring-red-500",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${sizes[size as keyof typeof sizes] || sizes.md} ${variants[variant as keyof typeof variants]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
    >
      {disabled && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

export const Input = ({ label, className = "", ...props }: any) => (
  <div className={`mb-4 ${className}`}>
    {label && <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">{label}</label>}
    <input 
      className="w-full bg-[#020617] border border-slate-700 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm shadow-inner"
      {...props}
    />
  </div>
);

export const Spinner = () => (
  <div className="flex justify-center items-center p-12">
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-4 border-slate-800"></div>
      <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin absolute top-0 left-0"></div>
    </div>
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
    className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all duration-200 border-l-[3px] group
      ${active 
        ? 'bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500 text-amber-500' 
        : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/30'}`}
  >
    <Icon size={20} className={`transition-colors ${active ? "text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "text-slate-500 group-hover:text-slate-300"}`} />
    <span className="tracking-wide">{label}</span>
  </button>
);

const SubMenuItem = ({ id, label, active, onClick }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`w-full flex items-center gap-3 pl-16 pr-4 py-2.5 text-sm transition-all relative
      ${active ? 'text-amber-500 font-medium' : 'text-slate-500 hover:text-slate-300'}`}
  >
    <div className={`absolute left-[2.25rem] w-1.5 h-1.5 rounded-full transition-all ${active ? 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.8)]' : 'bg-slate-700'}`} />
    <span>{label}</span>
  </button>
);

export const Sidebar = ({ currentView, onChangeView, isOpen, toggleSidebar }: SidebarProps) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    diagnose: true,
    strategy: true,
    sales: true,
    people: false,
    processes: false,
    ops: false
  });

  const toggleGroup = (group: string) => setExpanded(prev => ({ ...prev, [group]: !prev[group] }));

  const MenuGroup = ({ id, label, icon: Icon, children }: any) => (
    <div className="mt-1">
      <button 
        onClick={() => toggleGroup(id)} 
        className={`w-full flex items-center justify-between px-6 py-4 text-slate-400 hover:text-slate-100 transition-colors group ${expanded[id] ? 'text-slate-200 bg-slate-800/20' : ''}`}
      >
        <div className="flex items-center gap-3 text-sm font-medium">
          <Icon size={20} className={`transition-colors ${expanded[id] ? 'text-amber-500' : 'text-slate-500 group-hover:text-slate-300'}`} /> 
          <span className="tracking-wide">{label}</span>
        </div>
        {expanded[id] ? <ChevronDown size={14} className="text-amber-500/50" /> : <ChevronRight size={14} className="text-slate-600" />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out bg-[#0a0f1e] ${expanded[id] ? 'max-h-[500px] opacity-100 py-2 border-y border-slate-800/50' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );

  return (
    <>
       {isOpen && <div className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm" onClick={toggleSidebar}></div>}
      
      <aside className={`fixed md:relative z-50 h-full bg-[#0f172a] border-r border-slate-800 w-72 transition-transform duration-300 shadow-2xl flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo Area */}
        <div className="h-24 flex items-center px-6 border-b border-slate-800 bg-[#0f172a]">
          <div className="font-bold text-xl tracking-tight text-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-[#0f172a] font-black text-lg shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              P12
            </div>
            <div className="flex flex-col">
              <span className="leading-none text-amber-500 font-black tracking-widest text-sm">CONSELHO</span>
              <span className="leading-none text-slate-400 text-[10px] uppercase tracking-widest mt-1">Sistema de Gestão</span>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar space-y-1">
          <MenuItem id="dashboard" label="Painel Geral" icon={LayoutDashboard} active={currentView === 'dashboard'} onClick={onChangeView} />
          
          <div className="px-6 py-2 mt-4 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-600 tracking-widest">Módulos</span>
          </div>

          <MenuGroup id="diagnose" label="Diagnóstico" icon={Stethoscope}>
            <SubMenuItem id="diagnose_main" label="Análise & Fases" active={currentView === 'diagnose_main'} onClick={onChangeView} />
          </MenuGroup>

          <MenuGroup id="strategy" label="Estratégia" icon={Target}>
            <SubMenuItem id="strategy_identity" label="Identidade Organizacional" active={currentView === 'strategy_identity'} onClick={onChangeView} />
            <SubMenuItem id="strategy_swot" label="Matriz SWOT" active={currentView === 'strategy_swot'} onClick={onChangeView} />
          </MenuGroup>

          <MenuGroup id="sales" label="Vendas / Financeiro" icon={Wallet}>
            <SubMenuItem id="sales_personas" label="Definição de Persona" active={currentView === 'sales_personas'} onClick={onChangeView} />
            <SubMenuItem id="sales_revenue_products" label="Faturamento por Produto" active={currentView === 'sales_revenue_products'} onClick={onChangeView} />
            <SubMenuItem id="finance_dre" label="Planejamento Financeiro" active={currentView === 'finance_dre'} onClick={onChangeView} />
          </MenuGroup>

          <MenuGroup id="people" label="Gestão de Pessoas" icon={Users}>
            <SubMenuItem id="people_org" label="Organograma" active={currentView === 'people_org'} onClick={onChangeView} />
            <SubMenuItem id="people_jobs" label="Descrição de Função" active={currentView === 'people_jobs'} onClick={onChangeView} />
            <SubMenuItem id="people_eval" label="Avaliação de Desempenho" active={currentView === 'people_eval'} onClick={onChangeView} />
            <SubMenuItem id="people_9box" label="Nine Box" active={currentView === 'people_9box'} onClick={onChangeView} />
          </MenuGroup>

          <MenuGroup id="processes" label="Gestão de Processos" icon={GitMerge}>
            <SubMenuItem id="process_bsc" label="BSC" active={currentView === 'process_bsc'} onClick={onChangeView} />
          </MenuGroup>

           <MenuGroup id="ops" label="Projetos (Kanban)" icon={KanbanSquare}>
            <SubMenuItem id="ops_kanban" label="Quadro de Tarefas" active={currentView === 'ops_kanban'} onClick={onChangeView} />
          </MenuGroup>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0a0f1e]">
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-xs text-slate-400 font-medium">Sistema Online v1.2</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export const Header = ({ userProfile, toggleSidebar }: any) => {
  return (
    <header className="h-20 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm transition-all">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="md:hidden text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg">
          <Menu size={24} />
        </button>
        
        <div className="flex items-center gap-4">
           <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
              <span className="hover:text-slate-300 cursor-pointer transition-colors">Home</span>
              <ChevronRight size={14} />
              <span className="text-amber-500 font-medium">Dashboard</span>
           </div>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-3 text-slate-400 bg-[#020617] px-4 py-2 rounded-lg border border-slate-800 w-64 focus-within:border-amber-500/50 focus-within:text-slate-200 transition-all">
             <Search size={16} />
             <input type="text" placeholder="Buscar..." className="bg-transparent border-none outline-none text-sm text-slate-200 placeholder-slate-600 w-full" />
        </div>

        <button className="relative text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-slate-800 rounded-lg">
          <Bell size={20} />
          <span className="absolute top-1.5 right-2 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-[#0f172a]"></span>
        </button>

        <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>

        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-slate-200 leading-tight group-hover:text-amber-500 transition-colors">{userProfile?.companyName || "Minha Empresa"}</div>
            <div className="text-xs text-slate-500 font-medium">{userProfile?.name?.split(' ')[0]} (Admin)</div>
          </div>
          
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-[#0f172a] shadow-lg ring-2 ring-slate-800 group-hover:ring-amber-500/50 transition-all">
              {userProfile?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
          
          <button 
            onClick={() => signOut(auth)} 
            className="text-slate-500 hover:text-red-400 transition-colors p-2 hover:bg-slate-800 rounded-lg ml-2" 
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};