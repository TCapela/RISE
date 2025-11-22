import { api } from "./api";

export type AiCurriculoFeedbackRequest = {
  idUsuario: number;
  nome?: string | null;
  email?: string | null;
  cargoObjetivo?: string | null;
  resumo?: string | null;
  skills: string[];
  experiences?: any;
  education?: any;
  projects?: any;
  certs?: any;
  links?: any;
  completenessApp: number;
};

export type SuggestedBulletsBlock = {
  section?: "experiences" | "education" | "projects" | "certs";
  index: number;
  bullets: string[];
};

export type RecommendedCourseBlock = {
  idCurso: number;
  reason?: string | null;
};

export type InterviewPrepBlock = {
  questions: string[];
  answersDraft: string[];
};

export type AiCurriculoFeedbackResponse = {
  score: number;
  summarySuggested?: string | null;
  gaps: string[];
  suggestedBullets: SuggestedBulletsBlock[];
  recommendedCourses: RecommendedCourseBlock[];
  interviewPrep?: InterviewPrepBlock | null;
  raw?: string | null;
};

export async function getAiCurriculoFeedback(idUsuario: number) {
  const { data } = await api.get<AiCurriculoFeedbackResponse>(
    `/AiCurriculo/feedback/${idUsuario}`
  );
  return data;
}

export async function postAiCurriculoFeedback(payload: AiCurriculoFeedbackRequest) {
  const { data } = await api.post<AiCurriculoFeedbackResponse>(
    `/AiCurriculo/feedback`,
    payload
  );
  return data;
}
