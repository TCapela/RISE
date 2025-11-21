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

async function tryGetTrackByUser(idUsuario: number): Promise<Track | null> {
  const urls = [
    `/TrilhaProgresso/usuario/${idUsuario}`,
    `/TrilhaProgresso/Usuario/${idUsuario}`,
    `/TrilhaProgresso/${idUsuario}`,
  ];

  for (const url of urls) {
    try {
      const { data } = await api.get<Track>(url);
      return data;
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        continue;
      }
      throw err;
    }
  }

  return null;
}

export async function getTrackByUser(idUsuario: number): Promise<Track | null> {
  return tryGetTrackByUser(idUsuario);
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

async function tryUpdateTrack(idUsuario: number, body: any): Promise<void> {
  const urls = [
    `/TrilhaProgresso/usuario/${idUsuario}`,
    `/TrilhaProgresso/Usuario/${idUsuario}`,
    `/TrilhaProgresso/${idUsuario}`,
  ];

  let lastErr: any = null;

  for (const url of urls) {
    try {
      await api.put(url, body);
      return;
    } catch (err: any) {
      lastErr = err;
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        continue;
      }
      throw err;
    }
  }

  throw lastErr;
}

export async function updateTrack(
  idUsuario: number,
  input: TrackUpdateInput
): Promise<void> {
  const body = {
    idUsuario,
    percentualConcluido: input.percentualConcluido ?? null,
    dtInicio: input.dtInicio ?? null,
    dtUltimaAtualizacao: input.dtUltimaAtualizacao ?? new Date().toISOString(),
  };

  await tryUpdateTrack(idUsuario, body);
}

async function tryDeleteTrack(idUsuario: number): Promise<void> {
  const urls = [
    `/TrilhaProgresso/usuario/${idUsuario}`,
    `/TrilhaProgresso/Usuario/${idUsuario}`,
    `/TrilhaProgresso/${idUsuario}`,
  ];

  let lastErr: any = null;

  for (const url of urls) {
    try {
      await api.delete(url);
      return;
    } catch (err: any) {
      lastErr = err;
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        continue;
      }
      throw err;
    }
  }

  throw lastErr;
}

export async function deleteTrack(idUsuario: number): Promise<void> {
  await tryDeleteTrack(idUsuario);
}
