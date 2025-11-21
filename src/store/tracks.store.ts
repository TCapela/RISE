import { create } from "zustand";

export type TrackModule = { id: string; title: string; done: boolean; minutes: number };
export type Track = {
  id: string;
  title: string;
  area: "Tecnologia" | "Gestão" | "Sustentabilidade" | "Design" | string;
  totalHours: number;
  fiapRefs: { title: string; url: string }[];
  modules: TrackModule[];
};

type State = {
  tracks: Track[];
  toggleModule: (trackId: string, moduleId: string) => void;
  resetTrack: (trackId: string) => void;
};

const sample: Track[] = [
  {
    id: "t-ai",
    title: "Trilha: Fundamentos de IA",
    area: "Tecnologia",
    totalHours: 18,
    fiapRefs: [
      { title: "Inteligência Artificial & Machine Learning", url: "https://www.fiap.com.br/" },
      { title: "Python Essentials", url: "https://www.fiap.com.br/" }
    ],
    modules: [
      { id: "m1", title: "Conceitos de IA e ML", done: false, minutes: 40 },
      { id: "m2", title: "Tipos de Aprendizado", done: false, minutes: 45 },
      { id: "m3", title: "Workflow de um Projeto de ML", done: false, minutes: 50 },
      { id: "m4", title: "Prática: Classificação Básica", done: false, minutes: 60 }
    ]
  },
  {
    id: "t-gestao",
    title: "Trilha: Gestão Ágil",
    area: "Gestão",
    totalHours: 12,
    fiapRefs: [
      { title: "Agile Fundamentals", url: "https://www.fiap.com.br/" },
      { title: "Product Management", url: "https://www.fiap.com.br/" }
    ],
    modules: [
      { id: "m1", title: "Manifesto Ágil e Valores", done: false, minutes: 35 },
      { id: "m2", title: "Scrum em Projetos", done: false, minutes: 50 },
      { id: "m3", title: "Kanban e Fluxo", done: false, minutes: 40 }
    ]
  },
  {
    id: "t-ux",
    title: "Trilha: UX Essentials",
    area: "Design",
    totalHours: 14,
    fiapRefs: [
      { title: "Design de Experiência do Usuário (UX)", url: "https://www.fiap.com.br/" }
    ],
    modules: [
      { id: "m1", title: "Pesquisa com Usuários", done: false, minutes: 45 },
      { id: "m2", title: "Arquitetura de Informação", done: false, minutes: 40 },
      { id: "m3", title: "Protótipos de Baixa Fidelidade", done: false, minutes: 55 }
    ]
  }
];

export const useTracks = create<State>((set, get) => ({
  tracks: sample,
  toggleModule: (trackId, moduleId) => {
    set({
      tracks: get().tracks.map(t =>
        t.id !== trackId
          ? t
          : { ...t, modules: t.modules.map(m => (m.id === moduleId ? { ...m, done: !m.done } : m)) }
      )
    });
  },
  resetTrack: (trackId) => {
    set({
      tracks: get().tracks.map(t =>
        t.id !== trackId ? t : { ...t, modules: t.modules.map(m => ({ ...m, done: false })) }
      )
    });
  }
}));
