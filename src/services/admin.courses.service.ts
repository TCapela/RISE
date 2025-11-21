import { api } from "./api";

export type ApiCourse = {
  idCurso: number;
  nomeCurso?: string | null;
  descCurso?: string | null;
  linkCurso?: string | null;
  areaCurso?: string | null;
  idUsuario: number;
};

export type AdminCoursePayload = {
  nomeCurso: string;
  descCurso: string | null;
  linkCurso: string | null;
  areaCurso: string | null;
  idUsuario: number;
};

export type AdminCourse = {
  id: string;
  title: string;
  area: string;
  format: string;
  raw: ApiCourse;
};

const mapApiCourseToAdmin = (c: ApiCourse): AdminCourse => ({
  id: String(c.idCurso),
  title: c.nomeCurso ?? "Curso sem título",
  format: "Curso",
  area: c.areaCurso ?? "Não informado",
  raw: c,
});

export const fetchAdminCourses = async (): Promise<AdminCourse[]> => {
  const { data } = await api.get<ApiCourse[]>("/Curso");
  return data
    .map(mapApiCourseToAdmin)
    .sort((a, b) => a.title.localeCompare(b.title));
};

export const createAdminCourse = async (
  input: AdminCoursePayload
): Promise<AdminCourse> => {
  const { data } = await api.post<ApiCourse>("/Curso", input);
  return mapApiCourseToAdmin(data);
};

export const updateAdminCourse = async (
  idCurso: number,
  input: AdminCoursePayload
): Promise<void> => {
  await api.put(`/Curso/${idCurso}`, input);
};

export const deleteAdminCourse = async (idCurso: number): Promise<void> => {
  await api.delete(`/Curso/${idCurso}`);
};
