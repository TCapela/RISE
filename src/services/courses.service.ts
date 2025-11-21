import { api } from "./api";

export type ApiCourse = {
  idCurso: number;
  nomeCurso?: string | null;
  descCurso?: string | null;
  linkCurso?: string | null;
  areaCurso?: string | null;
  idUsuario: number;
};

export type Course = {
  id: string;
  title: string;
  area?: string;
  format?: string;
  workloadHours?: number;
  fiapUrl: string;
  description?: string;
  tags?: string[];
  skills?: string[];
  tools?: string[];
  modes?: string[];
  campuses?: string[];
  semesterCerts?: { label: string }[];
};

const mapApiCourseToCourse = (c: ApiCourse): Course => {
  return {
    id: String(c.idCurso),
    title: c.nomeCurso ?? "Curso sem nome",
    area: c.areaCurso ?? undefined,
    fiapUrl: c.linkCurso ?? "",
    description: c.descCurso ?? undefined,
  };
};

export const fetchCourses = async (idUsuario?: number): Promise<Course[]> => {
  const params = idUsuario ? { idUsuario } : undefined;
  const { data } = await api.get<ApiCourse[]>("/Curso", { params });
  return data.map(mapApiCourseToCourse);
};
