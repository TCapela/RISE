import { api } from "./api";

export type BemEstarDto = {
  idBemEstar: number;
  dtRegistro: string;
  nivelHumor: number;
  horasEstudo?: string | null;
  descAtividade?: string | null;
  idUsuario: number;
};

export type BemEstarCreate = {
  dtRegistro: string;
  nivelHumor: number;
  horasEstudo?: string | null;
  descAtividade?: string | null;
  idUsuario: number;
};

export type BemEstarUpdate = {
  idBemEstar: number;
  dtRegistro: string;
  nivelHumor: number;
  horasEstudo?: string | null;
  descAtividade?: string | null;
  idUsuario: number;
};

const BASE_PATH = "/BemEstar";

export async function fetchBemEstarByUser(
  idUsuario: number
): Promise<BemEstarDto[]> {
  const { data } = await api.get<BemEstarDto[]>(BASE_PATH, {
    params: { idUsuario },
  });
  return data ?? [];
}

export async function createBemEstar(
  payload: BemEstarCreate
): Promise<BemEstarDto> {
  const { data } = await api.post<BemEstarDto>(BASE_PATH, payload);
  return data;
}

export async function updateBemEstar(
  id: number,
  payload: BemEstarUpdate
): Promise<void> {
  await api.put(`${BASE_PATH}/${id}`, payload);
}

export async function deleteBemEstar(id: number): Promise<void> {
  await api.delete(`${BASE_PATH}/${id}`);
}
