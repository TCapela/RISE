// src/store/profile.store.ts
import { create } from "zustand";
import {
  fetchUsuarioById,
  updateUsuario,
  UsuarioResponse,
  UsuarioUpdate,
} from "../services/profile.service";

const FIXED_USER_ID = 1;

export type Profile = {
  idUsuario: number | null;
  name: string;
  email: string;
  role: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills: string[];
};

type State = {
  profile: Profile;
  loading: boolean;
  saving: boolean;
  error?: string;
  load: () => Promise<void>;
  save: () => Promise<void>;
  setField: <K extends keyof Profile>(field: K, value: Profile[K]) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
};

const mapDtoToProfile = (dto: UsuarioResponse, prev?: Profile): Profile => ({
  idUsuario: dto.idUsuario,
  name: dto.nomeUsuario || prev?.name || "",
  email: dto.emailUsuario || prev?.email || "",
  role: dto.tipoUsuario || prev?.role || "",
  phone: prev?.phone || "",
  location: prev?.location || "",
  bio: prev?.bio || "",
  skills: prev?.skills || [],
});

export const useProfile = create<State>((set, get) => ({
  profile: {
    idUsuario: null,
    name: "",
    email: "",
    role: "",
    phone: "",
    location: "",
    bio: "",
    skills: [],
  },
  loading: false,
  saving: false,
  error: undefined,

  async load() {
    try {
      set({ loading: true, error: undefined });
      const dto = await fetchUsuarioById(FIXED_USER_ID);
      set((state) => ({
        profile: mapDtoToProfile(dto, state.profile),
        loading: false,
      }));
    } catch (err: any) {
      set({
        loading: false,
        error: err?.message || "Erro ao carregar perfil",
      });
    }
  },

  async save() {
    const { profile } = get();
    const id = profile.idUsuario ?? FIXED_USER_ID;

    const payload: UsuarioUpdate = {
      nomeUsuario: profile.name || "Usuário R.I.S.E.",
      emailUsuario: profile.email || null,
      tipoUsuario: profile.role || null,
      senhaUsuario: null,
    };

    set({ saving: true, error: undefined });

    try {
      await updateUsuario(id, payload);
    } catch (err: any) {
      set({
        error: err?.message || "Erro ao salvar perfil",
      });
      throw err;
    } finally {
      set({ saving: false });
    }
  },

  setField(field, value) {
    set((state) => ({
      profile: {
        ...state.profile,
        [field]: value,
      },
    }));
  },

  addSkill(skill) {
    const trimmed = skill.trim();
    if (!trimmed) return;
    set((state) => {
      if (state.profile.skills.includes(trimmed)) return state;
      return {
        profile: {
          ...state.profile,
          skills: [...state.profile.skills, trimmed],
        },
      };
    });
  },

  removeSkill(skill) {
    set((state) => ({
      profile: {
        ...state.profile,
        skills: state.profile.skills.filter((s) => s !== skill),
      },
    }));
  },
}));
