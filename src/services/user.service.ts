import { api } from "./api";

export type ApiLink = {
  rel: string;
  href: string;
  method: string;
};

export type ApiUsuario = {
  idUsuario: number;
  nomeUsuario: string;
  emailUsuario: string;
  tipoUsuario: string | null;
  telefone?: string | null;
  habilidades?: string | null;
  desc?: string | null;
  links?: ApiLink[];
};

export type PagedResponse<T> = {
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: T[];
  links: ApiLink[];
};

export type UserListItem = {
  id: number;
  name: string;
  email: string;
  type: string | null;
};

export type PagedUsers = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: UserListItem[];
};

const mapApiUsuarioToUser = (u: ApiUsuario): UserListItem => ({
  id: u.idUsuario,
  name: u.nomeUsuario,
  email: u.emailUsuario,
  type: u.tipoUsuario ?? null,
});

export const fetchUsers = async (
  pageNumber = 1,
  pageSize = 10
): Promise<PagedUsers> => {
  const { data } = await api.get<PagedResponse<ApiUsuario>>("/Usuario", {
    params: { pageNumber, pageSize },
  });

  return {
    page: data.pageNumber,
    pageSize: data.pageSize,
    totalItems: data.totalItems,
    totalPages: data.totalPages,
    items: data.items.map(mapApiUsuarioToUser),
  };
};

export const fetchUserById = async (id: number): Promise<UserListItem> => {
  const { data } = await api.get<ApiUsuario>(`/Usuario/${id}`);
  return mapApiUsuarioToUser(data as ApiUsuario);
};

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  type?: string | null;
};

export const createUser = async (
  input: CreateUserInput
): Promise<UserListItem> => {
  const payload = {
    nomeUsuario: input.name,
    emailUsuario: input.email,
    senhaUsuario: input.password,
    tipoUsuario: input.type ?? null,
  };

  const { data } = await api.post<ApiUsuario>("/Usuario", payload);
  return mapApiUsuarioToUser(data);
};

type UpdateUserInput = {
  name: string;
  email: string;
  password?: string;
  type?: string | null;
};

export const updateUser = async (
  id: number,
  input: UpdateUserInput
): Promise<void> => {
  const payload: any = {
    nomeUsuario: input.name,
    emailUsuario: input.email,
    tipoUsuario: input.type ?? null,
  };

  if (input.password && input.password.trim().length > 0) {
    payload.senhaUsuario = input.password;
  }

  await api.put(`/Usuario/${id}`, payload);
};

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/Usuario/${id}`);
}
