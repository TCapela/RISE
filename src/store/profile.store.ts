import { create } from "zustand";
import {
  fetchUsuarioById,
  updateUsuario,
  UsuarioResponse,
  UsuarioUpdate,
} from "../services/profile.service";

export type Profile = {
  idUsuario: number | null;
  name: string;
  email: string;
  role: string;
  phone: string;
  bio: string;
  skills: string[];
};

type State = {
  profile: Profile;
  loading: boolean;
  saving: boolean;
  error?: string;
  load: (idUsuario: number | string) => Promise<void>;
  save: () => Promise<void>;
  setField: <K extends keyof Profile>(field: K, value: Profile[K]) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
};

const parseSkills = (raw?: string | null) =>
  (raw || "")
    .split(/[;,]/g)
    .map((s) => s.trim())
    .filter(Boolean);

const stringifySkills = (skills: string[]) =>
  skills.map((s) => s.trim()).filter(Boolean).join(", ");

const mapDtoToProfile = (dto: UsuarioResponse, prev?: Profile): Profile => ({
  idUsuario: dto.idUsuario,
  name: dto.nomeUsuario || prev?.name || "",
  email: dto.emailUsuario || prev?.email || "",
  role: dto.tipoUsuario || prev?.role || "",
  phone: dto.telefone || prev?.phone || "",
  bio: dto.desc || prev?.bio || "",
  skills: dto.habilidades ? parseSkills(dto.habilidades) : prev?.skills || [],
});

export const useProfile = create<State>((set, get) => ({
  profile: {
    idUsuario: null,
    name: "",
    email: "",
    role: "",
    phone: "",
    bio: "",
    skills: [],
  },
  loading: false,
  saving: false,
  error: undefined,

  async load(idUsuario) {
    if (!idUsuario) {
      set({ error: "Usuário inválido para carregar perfil" });
      return;
    }

    try {
      set({ loading: true, error: undefined });
      const dto = await fetchUsuarioById(idUsuario);
      set((state) => ({
        profile: mapDtoToProfile(dto, state.profile),
        loading: false,
      }));
    } catch (err: any) {
      set({
        loading: false,
        error: err?.message || "Erro ao carregar perfil",
      });
      throw err;
    }
  },

  async save() {
    const { profile } = get();
    const id = profile.idUsuario;

    if (!id) {
      set({ error: "Não foi possível salvar: usuário sem ID" });
      throw new Error("Usuário sem ID");
    }

    if (!profile.email.trim()) {
      set({ error: "Email é obrigatório" });
      throw new Error("Email é obrigatório");
    }

    const payload: UsuarioUpdate = {
      nomeUsuario: profile.name.trim() || "Usuário R.I.S.E.",
      emailUsuario: profile.email.trim(),
      tipoUsuario: profile.role.trim() || null,
      telefone: profile.phone.trim() || null,
      desc: profile.bio.trim() || null,
      habilidades: stringifySkills(profile.skills) || null,
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
