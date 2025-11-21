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

export type ParsedCurriculo = {
  idCurriculo: number;
  summary: string;
  skills: string[];
  experiences: any[];
  edu: any[];
  projects: any[];
  certs: any[];
  links: any[];
};

export type CurriculoContent = {
  summary: string;
  skills: string[];
  experiences: any[];
  edu: any[];
  projects: any[];
  certs: any[];
  links: any[];
};

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

type ProjCertBundle = {
  projects?: any[];
  certs?: any[];
};

export async function getCurriculoByUser(
  idUsuario: number
): Promise<ParsedCurriculo | null> {
  const { data } = await api.get<RawCurriculo[]>("/Curriculo", {
    params: { idUsuario },
  });

  if (!data.length) return null;

  const c = data[0];

  const skills = parseJson<string[]>(c.habilidades, []);
  const experiences = parseJson<any[]>(c.experienciaProfissional, []);
  const edu = parseJson<any[]>(c.formacao, []);
  const links = parseJson<any[]>(c.links, []);

  const projBundle = parseJson<ProjCertBundle>(c.projetos, {
    projects: [],
    certs: [],
  });
  const projects = Array.isArray(projBundle.projects)
    ? projBundle.projects
    : [];
  const certs = Array.isArray(projBundle.certs) ? projBundle.certs : [];

  return {
    idCurriculo: c.idCurriculo,
    summary: c.tituloCurriculo ?? "",
    skills,
    experiences,
    edu,
    projects,
    certs,
    links,
  };
}

export async function saveCurriculo(
  idUsuario: number,
  content: CurriculoContent,
  existingId?: number | null
): Promise<number> {
  const payload = {
    tituloCurriculo: content.summary,
    experienciaProfissional: JSON.stringify(content.experiences),
    habilidades: JSON.stringify(content.skills),
    formacao: JSON.stringify(content.edu),
    ultimaAtualizacao: new Date().toISOString(),
    projetos: JSON.stringify({
      projects: content.projects,
      certs: content.certs,
    }),
    links: JSON.stringify(content.links),
    idUsuario,
  };

  if (existingId) {
    await api.put(`/Curriculo/${existingId}`, payload);
    return existingId;
  } else {
    const { data } = await api.post<RawCurriculo>("/Curriculo", payload);
    return data.idCurriculo;
  }
}
