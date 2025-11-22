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
  hours: string | null;
};

type State = {
  entries: MoodEntry[];
  loading: boolean;
  error?: string;
  load: (userId: number) => Promise<void>;
  upsert: (userId: number, dateKey: string, value: MoodValue | 0, note: string, hoursText: string) => Promise<void>;
  remove: (id: number) => Promise<void>;
};

const toDateKey = (d: Date) =>
  d.getFullYear() +
  "-" +
  String(d.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(d.getDate()).padStart(2, "0");

const dtoToEntry = (dto: BemEstarDto): MoodEntry => {
  const d = new Date(dto.dtRegistro);
  const key = toDateKey(d);
  return {
    id: dto.idBemEstar,
    date: key,
    value: dto.nivelHumor as MoodValue,
    note: dto.descAtividade ?? "",
    hours: dto.horasEstudo ?? null,
  };
};

export const useWellbeing = create<State>((set, get) => ({
  entries: [],
  loading: false,
  error: undefined,

  async load(userId) {
    try {
      set({ loading: true, error: undefined });
      const data = await fetchBemEstarByUser(userId);
      const mapped = data.map(dtoToEntry).sort((a, b) => a.date.localeCompare(b.date));
      set({ entries: mapped, loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.message || "Erro ao carregar bem-estar",
      });
    }
  },

  async upsert(userId, dateKey, value, note, hoursText) {
    const state = get();
    const existing = state.entries.find((e) => e.date === dateKey);

    const trimmedNote = note.trim();
    const hasSomething = !!value || !!trimmedNote || !!hoursText.trim();
    if (!hasSomething) return;

    const dtRegistroIso = new Date(dateKey + "T12:00:00").toISOString();

    const normalizeHours = (txt: string) => {
      const v = txt.trim();
      if (!v) return null;
      const m = /^(\d{1,2}):(\d{2})$/.exec(v);
      if (!m) return null;
      const hh = m[1].padStart(2, "0");
      const mm = m[2];
      return `${hh}:${mm}:00`;
    };

    const horasEstudo = normalizeHours(hoursText);

    if (!existing) {
      const payload: BemEstarCreate = {
        dtRegistro: dtRegistroIso,
        nivelHumor: (value || 3) as MoodValue,
        horasEstudo,
        descAtividade: trimmedNote || null,
        idUsuario: userId,
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
      dtRegistro: dtRegistroIso,
      nivelHumor: (value || existing.value) as MoodValue,
      horasEstudo: horasEstudo ?? existing.hours,
      descAtividade: trimmedNote || existing.note || null,
      idUsuario: userId,
    };

    await updateBemEstar(existing.id, payloadUpdate);

    const updated: MoodEntry = {
      id: existing.id,
      date: existing.date,
      value: (value || existing.value) as MoodValue,
      note: trimmedNote || existing.note,
      hours: horasEstudo ?? existing.hours,
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
