import { create } from "zustand";
import {
  BemEstarDto,
  BemEstarCreate,
  BemEstarUpdate,
  fetchBemEstarByUser,
  createBemEstar,
  updateBemEstar,
  deleteBemEstar,
} from "../services/wellbeing.service";

export type MoodValue = 1 | 2 | 3 | 4 | 5;

export type MoodEntry = {
  id: number;
  date: string;
  value: MoodValue;
  note: string;
};

type State = {
  entries: MoodEntry[];
  loading: boolean;
  error?: string;
  load: () => Promise<void>;
  saveToday: (value: MoodValue | 0, note: string) => Promise<void>;
  remove: (id: number) => Promise<void>;
};

const FIXED_USER_ID = 1;

const todayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const dtoToEntry = (dto: BemEstarDto): MoodEntry => {
  const d = new Date(dto.dtRegistro); // respeita UTC -> local

  const localKey =
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0");

  return {
    id: dto.idBemEstar,
    date: localKey,
    value: dto.nivelHumor as MoodValue,
    note: dto.descAtividade ?? "",
  };
};


export const useWellbeing = create<State>((set, get) => ({
  entries: [],
  loading: false,
  error: undefined,

  async load() {
    try {
      set({ loading: true, error: undefined });
      const data = await fetchBemEstarByUser(FIXED_USER_ID);
      const mapped = data
        .map(dtoToEntry)
        .sort((a, b) => a.date.localeCompare(b.date));
      set({ entries: mapped, loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.message || "Erro ao carregar bem-estar",
      });
    }
  },

  async saveToday(value, note) {
    const key = todayKey();
    const state = get();
    const existing = state.entries.find((e) => e.date === key);

    const trimmedNote = note.trim();
    const hasSomething = !!value || !!trimmedNote;
    if (!hasSomething) return;

    const nowIso = new Date().toISOString();

    if (!existing) {
      const payload: BemEstarCreate = {
        dtRegistro: nowIso,
        nivelHumor: (value || 3) as MoodValue,
        horasEstudo: null,
        descAtividade: trimmedNote || null,
        idUsuario: FIXED_USER_ID,
      };

      const created = await createBemEstar(payload);
      const entry = dtoToEntry(created);

      set((prev) => ({
        entries: [...prev.entries.filter((e) => e.date !== entry.date), entry].sort((a, b) =>
          a.date.localeCompare(b.date)
        ),
      }));
      return;
    }

    const payloadUpdate: BemEstarUpdate = {
      idBemEstar: existing.id,
      dtRegistro: nowIso,
      nivelHumor: (value || existing.value) as MoodValue,
      horasEstudo: null,
      descAtividade: trimmedNote || existing.note || null,
      idUsuario: FIXED_USER_ID,
    };

    await updateBemEstar(existing.id, payloadUpdate);

    const updated: MoodEntry = {
      id: existing.id,
      date: existing.date,
      value: (value || existing.value) as MoodValue,
      note: trimmedNote || existing.note,
    };

    set((prev) => ({
      entries: prev.entries
        .map((e) => (e.id === existing.id ? updated : e))
        .sort((a, b) => a.date.localeCompare(b.date)),
    }));
  },

  async remove(id) {
    await deleteBemEstar(id);
    set((prev) => ({
      entries: prev.entries.filter((e) => e.id !== id),
    }));
  },
}));
