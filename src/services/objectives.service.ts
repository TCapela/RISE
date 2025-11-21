import { api } from "./api";

export type ObjectiveResponse = {
  idObjetivo: number;
  tituloObjetivo: string | null;
  categoriaObjetivo: string | null;
  dataPlanejada: string | null;
  concluido: string | null;
  dataConclusao: string | null;
  dtCriacao: string | null;
  idTrilha: number;
};

export type ObjectiveCreateInput = {
  idUsuario: number;
  tituloObjetivo: string;
  categoriaObjetivo?: string | null;
  dataPlanejada?: string | null;
};

export type ObjectiveUpdateInput = {
  tituloObjetivo?: string | null;
  categoriaObjetivo?: string | null;
  dataPlanejada?: string | null;
  concluido?: "S" | "N" | null;
};

export async function getObjectivesByUser(idUsuario: number): Promise<ObjectiveResponse[]> {
  const { data } = await api.get<ObjectiveResponse[]>(`/TrilhaObjetivo/usuario/${idUsuario}`);
  return data;
}

export async function createObjective(input: ObjectiveCreateInput): Promise<ObjectiveResponse> {
  const { data } = await api.post<ObjectiveResponse>("/TrilhaObjetivo", input);
  return data;
}

export async function updateObjective(idObjetivo: number, input: ObjectiveUpdateInput): Promise<void> {
  await api.put(`/TrilhaObjetivo/${idObjetivo}`, input);
}

export async function deleteObjective(idObjetivo: number): Promise<void> {
  await api.delete(`/TrilhaObjetivo/${idObjetivo}`);
}
