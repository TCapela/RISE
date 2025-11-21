import { api } from "./api";

export type UsuarioResponse = {
  idUsuario: number;
  nomeUsuario: string;
  emailUsuario?: string | null;
  tipoUsuario?: string | null;
};

export type UsuarioUpdate = {
  nomeUsuario: string;
  emailUsuario?: string | null;
  senhaUsuario?: string | null;
  tipoUsuario?: string | null;
};

const BASE_PATH = "/Usuario";

export async function fetchUsuarioById(id: number | string): Promise<UsuarioResponse> {
  const { data } = await api.get<UsuarioResponse>(`${BASE_PATH}/${id}`);
  return data;
}

export async function updateUsuario(
  id: number | string,
  payload: UsuarioUpdate
): Promise<void> {
  await api.put(`${BASE_PATH}/${id}`, payload);
}
