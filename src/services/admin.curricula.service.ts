import { api } from "./api";

export type RawCurriculo = {
  idCurriculo: number;
  tituloCurriculo?: string | null;
  experienciaProfissional?: string | null;
  habilidades: string;
  formacao?: string | null;
  ultimaAtualizacao?: string | null;
  projetos?: string | null;
  links?: string | null;
  idUsuario: number;
};

type ProjCertBundle = {
  projects?: any[];
  certs?: any[];
};

export type AdminCurriculumSummary = {
  id: string;
  ownerId: number;
  ownerName: string;
  ownerEmail: string;
  completeness: number;
  updatedAt: string;
};

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function computeCompleteness(raw: RawCurriculo): number {
  const skills = parseJson<string[]>(raw.habilidades, []);
  const experiences = parseJson<any[]>(raw.experienciaProfissional, []);
  const edu = parseJson<any[]>(raw.formacao, []);
  const links = parseJson<any[]>(raw.links, []);
  const projBundle = parseJson<ProjCertBundle>(raw.projetos, {
    projects: [],
    certs: [],
  });
  const projects = Array.isArray(projBundle.projects)
    ? projBundle.projects
    : [];
  const certs = Array.isArray(projBundle.certs) ? projBundle.certs : [];

  let pts = 0;
  let total = 0;
  const bump = (v: boolean) => {
    total += 1;
    if (v) pts += 1;
  };

  bump((raw.tituloCurriculo ?? "").trim().length >= 60);
  bump(skills.length >= 3);
  bump(experiences.length > 0);
  bump(edu.length > 0);
  bump(projects.length > 0 || certs.length > 0);
  bump(links.length > 0);

  const pct = total > 0 ? Math.round((pts / total) * 100) : 0;
  return Math.max(0, Math.min(100, pct));
}

export async function getCurriculaAdmin(): Promise<AdminCurriculumSummary[]> {
  const { data } = await api.get<RawCurriculo[]>("/Curriculo");

  return data.map((c) => {
    const completeness = computeCompleteness(c);

    const updatedAt = c.ultimaAtualizacao
      ? new Date(c.ultimaAtualizacao).toLocaleString("pt-BR")
      : "";

    return {
      id: String(c.idCurriculo),
      ownerId: c.idUsuario,
      ownerName: `Usuário #${c.idUsuario}`,
      ownerEmail: "",
      completeness,
      updatedAt,
    };
  });
}
