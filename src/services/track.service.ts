import axios from "axios";
import { api } from "./api";

export type Track = {
  idUsuario: number;
  percentualConcluido: number | null;
  dtInicio: string | null;
  dtUltimaAtualizacao: string | null;
};

export type TrackCreateInput = {
  idUsuario: number;
  percentualConcluido?: number | null;
  dtInicio?: string | null;
};

export type TrackUpdateInput = {
  idUsuario: number;
  percentualConcluido?: number | null;
  dtInicio?: string | null;
  dtUltimaAtualizacao?: string | null;
};

export async function getTrackByUser(idUsuario: number): Promise<Track | null> {
  try {
    const { data } = await api.get<Track>(`/TrilhaProgresso/usuario/${idUsuario}`);
    return data;
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return null;
    }
    throw err;
  }
}

export async function createTrack(input: TrackCreateInput): Promise<Track> {
  const body = {
    idUsuario: input.idUsuario,
    percentualConcluido: input.percentualConcluido ?? 0,
    dtInicio: input.dtInicio ?? new Date().toISOString(),
  };

  const { data } = await api.post<Track>("/TrilhaProgresso", body);
  return data;
}

export async function updateTrack(
  idUsuario: number,
  input: TrackUpdateInput
): Promise<void> {
  const body = {
    idUsuario,
    percentualConcluido: input.percentualConcluido ?? null,
    dtInicio: input.dtInicio ?? null,
    dtUltimaAtualizacao:
      input.dtUltimaAtualizacao ?? new Date().toISOString(),
  };

  await api.put(`/TrilhaProgresso/usuario/${idUsuario}`, body);
}

export async function deleteTrack(idUsuario: number): Promise<void> {
  await api.delete(`/TrilhaProgresso/usuario/${idUsuario}`);
}
