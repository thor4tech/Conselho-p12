
import React, { useState, useEffect } from 'react';
import { auth, db, getCollectionPath } from './services';
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { UserProfile } from './types';
import { Sidebar, Header, Spinner, Button, Input, Card } from './components';

// Import Modules
import { Dashboard, DiagnoseModule } from './modules/Dashboard';
import { IdentityModule, SWOTModule } from './modules/Strategy';
import { PersonasModule, ProductRevenueModule, DREModule } from './modules/SalesFinance';
import { PeopleModule } from './modules/People';
import { KanbanModule } from './modules/Operations';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth & Profile Load
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, getCollectionPath(u.uid, 'profile'), 'main');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setProfile({ uid: u.uid, ...snap.data() } as UserProfile);
        } else {
          setProfile(null); // Triggers Onboarding
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleOnboarding = async (name: string, company: string) => {
    if (!user) return;
    const newProfile = {
      name, 
      companyName: company,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    await setDoc(doc(db, `users/${user.uid}/profile/main`), newProfile);
    setProfile({ uid: user.uid, ...newProfile });
  };

  if (loading) return <div className="h-screen bg-slate-950 flex items-center justify-center"><Spinner /></div>;

  if (!user) return <AuthScreen />;

  if (!profile) return <OnboardingScreen onComplete={handleOnboarding} />;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <Sidebar 
        currentView={view} 
        onChangeView={(v) => { setView(v); setSidebarOpen(false); }} 
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <Header userProfile={profile} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
           {view === 'dashboard' && <Dashboard user={profile} />}
           {view === 'diagnose_main' && <DiagnoseModule user={profile} />}
           {view === 'strategy_identity' && <IdentityModule user={profile} />}
           {view === 'strategy_swot' && <SWOTModule user={profile} />}
           {view === 'sales_personas' && <PersonasModule user={profile} />}
           {view === 'sales_revenue_products' && <ProductRevenueModule user={profile} />}
           {view === 'finance_dre' && <DREModule user={profile} />}
           {view.startsWith('people_') && <PeopleModule user={profile} view={view} />}
           {view === 'process_bsc' && <div className="text-center mt-20 text-slate-500">Módulo BSC (Em Desenvolvimento)</div>}
           {view === 'ops_kanban' && <KanbanModule user={profile} />}
        </main>
      </div>
    </div>
  );
}

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      if (isLogin) await signInWithEmailAndPassword(auth, email, pass);
      else await createUserWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      setErr("Erro de autenticação: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-amber-500/30">
        <div className="text-center mb-8">
           <h1 className="text-3xl font-bold text-slate-100">CONSELHO <span className="text-amber-500">P12</span></h1>
           <p className="text-slate-400 mt-2">Sistema de Gestão Empresarial</p>
        </div>
        <form onSubmit={handleAuth} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e:any) => setEmail(e.target.value)} required />
          <Input label="Senha" type="password" value={pass} onChange={(e:any) => setPass(e.target.value)} required />
          {err && <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded border border-red-500/20">{err}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
             {isLogin ? 'Entrar' : 'Registrar'}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-slate-400 hover:text-amber-500 text-sm">
            {isLogin ? "Não tem conta? Crie uma" : "Já tem conta? Entre"}
          </button>
        </div>
      </Card>
    </div>
  );
};

const OnboardingScreen = ({ onComplete }: { onComplete: (n: string, c: string) => void }) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-amber-500">
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Bem-vindo ao P12</h2>
        <p className="text-slate-400 mb-6">Vamos configurar seu espaço. Por favor, forneça seus dados.</p>
        <div className="space-y-4">
          <Input label="Seu Nome" value={name} onChange={(e:any) => setName(e.target.value)} />
          <Input label="Nome da Empresa" value={company} onChange={(e:any) => setCompany(e.target.value)} />
          <Button onClick={() => onComplete(name, company)} className="w-full mt-6" disabled={!name || !company}>
            Começar
          </Button>
        </div>
      </Card>
    </div>
  );
};
