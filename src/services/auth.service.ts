import { api } from "./api";
import type { ApiUsuario } from "./user.service";

export type LoginResult = {
  user: ApiUsuario;
  token: string | null;
};

export async function login(email: string, password: string): Promise<LoginResult> {
  const { data } = await api.post<any>("/Usuario/login", {
    emailUsuario: email,
    senhaUsuario: password,
  });

  const user: ApiUsuario = data.usuario ?? data;
  const token: string | null =
    typeof data.token === "string" && data.token.trim().length > 0
      ? data.token
      : null;

  return { user, token };
}
