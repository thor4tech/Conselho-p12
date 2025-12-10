
export interface UserProfile {
  uid: string;
  name: string;
  companyName: string;
  createdAt: any;
  updatedAt: any;
}

export interface StrategicAssessment {
  id?: string;
  createdAt: any;
  answers: Record<string, boolean>; // Mapa de A-Z
  scores: {
    operacional: number;
    tatico: number;
    estrategico: number;
  };
  aiAnalysis: string;
  actionPlan: string;
}

export interface PhaseAssessment {
  id?: string;
  createdAt: any;
  checkedItems: string[]; // IDs das perguntas marcadas (1-30)
  totalScore: number;
  phase: number; // 1 a 7
  phaseName: string;
  aiAnalysis: string;
}

export interface BehavioralAssessment {
  id?: string;
  createdAt: any;
  answers: Record<number, number>; // Question Index -> Profile Number Selected
  profileScores: Record<number, number>; // Profile Number (1-9) -> Score
  triadScores: {
    body: number; // Operacional (1, 8, 9)
    heart: number; // Tático (2, 3, 4)
    mind: number; // Estratégico (5, 6, 7)
  };
  dominantProfile: {
    number: number;
    name: string;
  };
  aiAnalysis: string;
}

export interface StrategyIdentity {
  dream: string; // Sonho
  purpose: string; // Propósito
  mission: string;
  vision: string;
  values: string[];
  valueProposition: {
    title: string;
    subtitle: string;
    bullets: string[];
  };
  competitiveAdvantage: string; // Diferencial Competitivo
}

export interface SWOTItem {
  text: string;
  score: number; // 0-100 impact/intensity
}

export interface SWOT {
  strengths: SWOTItem[];
  weaknesses: SWOTItem[];
  opportunities: SWOTItem[];
  threats: SWOTItem[];
  favorabilityIndex?: number;
  updatedAt?: any;
}

// Updated for "Comprador dos Sonhos" (9 Questions)
export interface Persona {
  id: string;
  name: string;
  q1: string; // Onde se diverte?
  q2: string; // Onde consegue informações?
  q3: string; // Frustrações e desafios?
  q4: string; // Esperanças e sonhos?
  q5: string; // Maiores medos?
  q6: string; // Forma preferida de comunicação?
  q7: string; // Frases e termos?
  q8: string; // Dia a dia?
  q9: string; // O que o faz feliz?
}

// --- NEW TYPES FOR FINANCE & SALES ---

export interface ProductMonthData {
  plannedQ: number;
  plannedR: number;
  realQ: number;
  realR: number;
}

export interface ProductRecord {
  id: string;
  name: string;
  category: string;
  avgPrice: number;
  // Map "YYYY-MM" -> Data
  data: Record<string, ProductMonthData>; 
}

export interface DREItem {
  planned: number;
  real: number;
}

export interface DRERecord {
  id: string; // "YYYY-MM"
  month: string;
  
  // Entries
  revProducts: DREItem;
  revServices: DREItem;
  revFinancial: DREItem;
  revNonOp: DREItem;
  
  // Exits
  costVariable: DREItem;
  costFixed: DREItem;
  investments: DREItem;
  costNonOp: DREItem;
  taxes: DREItem;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'active' | 'inactive';
}

export interface Evaluation {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  skills: {
    technique: number;
    behavior: number;
    delivery: number;
    deadlines: number;
    innovation: number;
  };
  performanceScore: number;
  potentialScore: number;
  feedback: string;
}

export interface OrgNode {
  id: string;
  name: string;
  role: string;
  parentId: string | null;
}

export interface ProjectTask {
  id: string;
  title: string;
  responsible: string;
  dueDate: string;
  status: 'todo' | 'doing' | 'done';
}