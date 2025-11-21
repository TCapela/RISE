import { create } from "zustand";
import { login } from "../services/auth.service";
import { createUser } from "../services/user.service";
import { setApiAuthToken } from "../services/api";

export type UserType = "user" | "admin";

export type User = {
  id: string;
  name: string;
  email: string;
  type: UserType;
} | null;

type AuthState = {
  user: User;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInAdmin: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,

  signIn: async (email, password) => {
    try {
      const { user, token } = await login(email, password);

      const mappedUser: User = {
        id: String(user.idUsuario),
        name: user.nomeUsuario,
        email: user.emailUsuario,
        type: (user.tipoUsuario as UserType) || "user",
      };

      if (token) {
        setApiAuthToken(token);
      } else {
        setApiAuthToken(null);
      }

      set({ user: mappedUser, token: token ?? null });
    } catch (err) {
      setApiAuthToken(null);
      set({ user: null, token: null });
      throw err;
    }
  },

  signInAdmin: async (email, password) => {
    const baseName = email.split("@")[0] || "Admin";
    const mockUser: User = {
      id: "adm-1",
      name: baseName,
      email,
      type: "admin",
    };
    setApiAuthToken(null);
    set({ user: mockUser, token: null });
  },

  signUp: async (name, email, password) => {
    try {
      await createUser({
        name,
        email,
        password,
        type: "user",
      });

      setApiAuthToken(null);
      set({ user: null, token: null });
    } catch (err) {
      setApiAuthToken(null);
      set({ user: null, token: null });
      throw err;
    }
  },

  signOut: () => {
    setApiAuthToken(null);
    set({ user: null, token: null });
  },
}));
