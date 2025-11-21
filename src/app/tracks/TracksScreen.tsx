import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme/theme";
import {
  Layers,
  CalendarClock,
  CheckCircle2,
  Circle,
  Plus,
  RotateCcw,
  Filter,
  AlertTriangle,
  Tag,
  Clock3,
  X,
} from "lucide-react-native";
import { useAuth } from "../../store/auth.store";
import {
  getTrackByUser,
  createTrack,
  updateTrack,
  deleteTrack,
  Track,
} from "../../services/track.service";
import {
  getObjectivesByUser,
  createObjective,
  updateObjective,
  deleteObjective,
  ObjectiveResponse,
} from "../../services/objectives.service";

type AgendaItem = {
  id: string;
  remoteId: number;
  title: string;
  category: string;
  done: boolean;
  plannedAt: string | null;
};

type ToastKind = "ok" | "err";

function ProgressBar({ value }: { value: number }) {
  const t = useTheme();
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <View
      style={{
        height: 10,
        backgroundColor: "#1A1E31",
        borderRadius: 999,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          width: `${pct}%`,
          height: "100%",
          backgroundColor: t.colors.primary,
        }}
      />
    </View>
  );
}

function mapObjectiveToAgenda(o: ObjectiveResponse): AgendaItem {
  return {
    id: String(o.idObjetivo),
    remoteId: o.idObjetivo,
    title: o.tituloObjetivo || "",
    category: o.categoriaObjetivo || "Estudo",
    done: o.concluido === "S",
    plannedAt: o.dataPlanejada ?? null,
  };
}

function formatPlanned(plannedAt: string | null) {
  if (!plannedAt) return "sem data";
  const d = new Date(plannedAt);
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

function maskDateInput(text: string) {
  const digits = text.replace(/\D/g, "").slice(0, 8);
  let out = digits;

  if (digits.length >= 3) out = `${digits.slice(0, 2)}/${digits.slice(2)}`;
  if (digits.length >= 5) out = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;

  return out;
}

function parseDateInput(s: string) {
  const v = s.trim();
  if (!v) return null;

  const digits = v.replace(/\D/g, "");
  if (digits.length !== 8) return null;

  const d = Number(digits.slice(0, 2));
  const m = Number(digits.slice(2, 4));
  const y = Number(digits.slice(4, 8));

  if (y < 1900 || y > 2100) return null;
  if (m < 1 || m > 12) return null;
  if (d < 1 || d > 31) return null;

  const dt = new Date(y, m - 1, d, 12, 0, 0, 0);
  if (Number.isNaN(dt.getTime())) return null;

  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== m - 1 ||
    dt.getDate() !== d
  ) return null;

  return dt.toISOString();
}

export default function TracksScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth() as any;

  const [items, setItems] = useState<AgendaItem[]>([]);
  const [search, setSearch] = useState("");

  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Estudo");
  const [newDateText, setNewDateText] = useState("");

  const [track, setTrack] = useState<Track | null>(null);
  const [loadingTrack, setLoadingTrack] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncedPercent, setLastSyncedPercent] = useState<number | null>(null);

  const [loadingObjectives, setLoadingObjectives] = useState(false);

  const [toast, setToast] = useState<{ kind: ToastKind; msg: string } | null>(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [showDone, setShowDone] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");

  const numericUserId = user ? Number(user.id) : NaN;

  const showToast = useCallback((kind: ToastKind, msg: string) => {
    setToast({ kind, msg });
    setTimeout(() => setToast(null), 2200);
  }, []);

  const filtered = useMemo(() => {
    const cat = categoryFilter.trim().toLowerCase();
    return items
      .filter((i) => (showDone ? true : !i.done))
      .filter((i) =>
        search ? i.title.toLowerCase().includes(search.toLowerCase()) : true
      )
      .filter((i) =>
        cat ? i.category.toLowerCase().includes(cat) : true
      );
  }, [items, showDone, search, categoryFilter]);

  const totalView = filtered.length;
  const doneView = filtered.filter((i) => i.done).length;
  const pctView = totalView ? Math.round((doneView / totalView) * 100) : 0;

  const totalAll = items.length;
  const doneAll = items.filter((i) => i.done).length;
  const pctAll = totalAll ? Math.round((doneAll / totalAll) * 100) : 0;

  const hasLoadedRef = useRef(false);

  const loadObjectives = useCallback(async () => {
    if (!user || Number.isNaN(numericUserId)) return;
    setLoadingObjectives(true);
    try {
      const list = await getObjectivesByUser(numericUserId);
      setItems(list.map(mapObjectiveToAgenda));
    } catch {
      showToast("err", "Não deu pra carregar seus objetivos.");
    } finally {
      setLoadingObjectives(false);
    }
  }, [user, numericUserId, showToast]);

  const addItem = useCallback(async () => {
    const title = newTitle.trim();
    const category = newCategory.trim() || "Estudo";
    if (!title || !user || Number.isNaN(numericUserId)) return;

    const plannedAt = parseDateInput(newDateText);
    if (newDateText.trim() && !plannedAt) {
      showToast("err", "Data inválida. Use DD/MM/AAAA.");
      return;
    }

    try {
      const created = await createObjective({
        idUsuario: numericUserId,
        tituloObjetivo: title,
        categoriaObjetivo: category,
        dataPlanejada: plannedAt,
      });

      setItems((prev) => [mapObjectiveToAgenda(created), ...prev]);
      setNewTitle("");
      setNewCategory("Estudo");
      setNewDateText("");
      showToast("ok", "Objetivo criado.");
    } catch {
      showToast("err", "Falha ao criar objetivo.");
    }
  }, [newTitle, newCategory, newDateText, user, numericUserId, showToast]);

  const toggleItem = useCallback(
    async (id: string) => {
      const found = items.find((i) => i.id === id);
      if (!found) return;

      const newDone = !found.done;

      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, done: newDone } : i))
      );

      try {
        await updateObjective(found.remoteId, {
          idUsuario: numericUserId,
          tituloObjetivo: found.title,
          categoriaObjetivo: found.category,
          dataPlanejada: found.plannedAt,
          concluido: newDone ? "S" : "N",
        });
        showToast("ok", newDone ? "Objetivo concluído." : "Objetivo reaberto.");
      } catch {
        showToast("err", "Falha ao atualizar objetivo.");
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, done: !newDone } : i))
        );
      }
    },
    [items, numericUserId, showToast]
  );

  const clearDone = useCallback(async () => {
    const doneItems = items.filter((i) => i.done);
    if (!doneItems.length) return;

    setItems((prev) => prev.filter((i) => !i.done));

    try {
      await Promise.all(doneItems.map((i) => deleteObjective(i.remoteId)));
      showToast("ok", "Concluídos removidos.");
    } catch {
      showToast("err", "Falha ao remover concluídos.");
      loadObjectives();
    }
  }, [items, loadObjectives, showToast]);

  const loadTrack = useCallback(async () => {
    if (!user || Number.isNaN(numericUserId)) return;
    setLoadingTrack(true);

    try {
      const existing = await getTrackByUser(numericUserId);

      if (existing) {
        setTrack(existing);
        const basePct =
          typeof existing.percentualConcluido === "number"
            ? existing.percentualConcluido
            : 0;
        setLastSyncedPercent(basePct);
      } else {
        const created = await createTrack({
          idUsuario: numericUserId,
          percentualConcluido: pctAll,
        });
        setTrack(created);
        setLastSyncedPercent(pctAll);
      }
    } catch {
      showToast("err", "Não deu pra buscar sua trilha.");
    } finally {
      setLoadingTrack(false);
    }
  }, [user, numericUserId, pctAll, showToast]);

  const syncProgress = useCallback(
    async (newPercent: number) => {
      if (!user || Number.isNaN(numericUserId)) return;
      if (lastSyncedPercent === newPercent) return;
      if (!hasLoadedRef.current) return;

      setSyncing(true);

      try {
        if (!track) {
          const created = await createTrack({
            idUsuario: numericUserId,
            percentualConcluido: newPercent,
          });
          setTrack(created);
        } else {
          await updateTrack(numericUserId, {
            idUsuario: numericUserId,
            percentualConcluido: newPercent,
          });
          setTrack((prev) =>
            prev
              ? {
                  ...prev,
                  percentualConcluido: newPercent,
                  dtUltimaAtualizacao: new Date().toISOString(),
                }
              : prev
          );
        }
        setLastSyncedPercent(newPercent);
        showToast("ok", "Progresso atualizado.");
      } catch {
        showToast("err", "Falha ao salvar progresso.");
      } finally {
        setSyncing(false);
      }
    },
    [user, numericUserId, lastSyncedPercent, track, showToast]
  );

  const resetRemoteTrack = useCallback(async () => {
    if (!user || Number.isNaN(numericUserId)) return;

    setSyncing(true);

    try {
      await deleteTrack(numericUserId);
      setTrack(null);
      setLastSyncedPercent(0);
      showToast("ok", "Trilha resetada.");
    } catch {
      showToast("err", "Falha ao resetar trilha.");
    } finally {
      setSyncing(false);
    }
  }, [user, numericUserId, showToast]);

  useEffect(() => {
    if (!user || Number.isNaN(numericUserId)) return;
    loadTrack();
    loadObjectives();
    hasLoadedRef.current = true;
  }, [numericUserId, user, loadTrack, loadObjectives]);

  useEffect(() => {
    if (!user || Number.isNaN(numericUserId)) return;
    syncProgress(pctAll);
  }, [pctAll, numericUserId, user, syncProgress]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: t.spacing.lg,
          gap: t.spacing.md,
          paddingBottom: insets.bottom + t.spacing.xxl + 80,
        }}
      >
        {!!toast && (
          <View
            style={{
              backgroundColor: toast.kind === "ok" ? "#2ecc7120" : "#ff4d4d20",
              borderColor: toast.kind === "ok" ? "#2ecc71" : "#ff4d4d",
              borderWidth: 1,
              padding: 10,
              borderRadius: t.radius.md,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            {toast.kind === "ok" ? (
              <CheckCircle2 color="#2ecc71" size={18} />
            ) : (
              <AlertTriangle color="#ff4d4d" size={18} />
            )}
            <Text
              style={{
                color: toast.kind === "ok" ? "#2ecc71" : "#ff4d4d",
                fontWeight: "700",
                flex: 1,
              }}
            >
              {toast.msg}
            </Text>
          </View>
        )}

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Layers color={t.colors.primary} />
          <Text style={{ color: t.colors.text, fontSize: 20, fontWeight: "800" }}>
            Agenda de objetivos
          </Text>
        </View>

        <View
          style={{
            backgroundColor: t.colors.glass,
            borderRadius: t.radius.lg,
            padding: t.spacing.lg,
            borderWidth: 1,
            borderColor: t.colors.border,
            gap: t.spacing.sm,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <CalendarClock color={t.colors.primary} />
              <Text style={{ color: t.colors.text, fontSize: 16, fontWeight: "800" }}>
                Resumo
              </Text>
            </View>
          </View>

          <ProgressBar value={pctView} />

          <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
            {totalView === 0
              ? "Nenhum objetivo por aqui."
              : `${doneView} de ${totalView} concluídos (${pctView}%).`}
          </Text>

          {(loadingTrack || syncing) && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
              <ActivityIndicator size="small" color={t.colors.primary} />
              <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>
                Atualizando...
              </Text>
            </View>
          )}

          {doneView > 0 && (
            <TouchableOpacity
              onPress={clearDone}
              style={{
                alignSelf: "flex-start",
                marginTop: t.spacing.xs,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: t.radius.pill,
                borderWidth: 1,
                borderColor: t.colors.border,
                backgroundColor: t.colors.surfaceAlt,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
              }}
            >
              <RotateCcw color={t.colors.textMuted} size={14} />
              <Text style={{ color: t.colors.textMuted, fontSize: 12, fontWeight: "600" }}>
                Limpar concluídos
              </Text>
            </TouchableOpacity>
          )}

          {track && (
            <TouchableOpacity
              onPress={resetRemoteTrack}
              disabled={syncing}
              style={{
                alignSelf: "flex-start",
                marginTop: t.spacing.xs,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: t.radius.pill,
                borderWidth: 1,
                borderColor: t.colors.border,
                backgroundColor: "#1A1E31",
              }}
            >
              <Text style={{ color: t.colors.textMuted, fontSize: 11, fontWeight: "600" }}>
                Resetar trilha
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {loadingObjectives && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <ActivityIndicator size="small" color={t.colors.primary} />
            <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>
              Carregando objetivos...
            </Text>
          </View>
        )}

        <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
          <TextInput
            placeholder="Buscar objetivo"
            placeholderTextColor={t.colors.tabInactive}
            value={search}
            onChangeText={setSearch}
            style={{
              flex: 1,
              backgroundColor: "#10152A",
              color: t.colors.text,
              borderRadius: t.radius.md,
              paddingHorizontal: 12,
              height: 44,
              borderWidth: 1,
              borderColor: t.colors.border,
            }}
          />
          <TouchableOpacity
            onPress={() => setFilterOpen(v => !v)}
            style={{
              width: 44,
              height: 44,
              borderRadius: t.radius.md,
              backgroundColor: t.colors.glass,
              borderWidth: 1,
              borderColor: filterOpen ? t.colors.primary : t.colors.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Filter color={filterOpen ? t.colors.primary : t.colors.tabInactive} />
          </TouchableOpacity>
        </View>

        {filterOpen && (
          <View
            style={{
              backgroundColor: t.colors.glass,
              borderRadius: t.radius.lg,
              padding: t.spacing.lg,
              borderWidth: 1,
              borderColor: t.colors.border,
              gap: t.spacing.sm,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ color: t.colors.text, fontWeight: "800" }}>Filtros</Text>
              <TouchableOpacity onPress={() => setFilterOpen(false)}>
                <X color={t.colors.tabInactive} size={18} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setShowDone(v => !v)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingVertical: 8,
              }}
            >
              {showDone ? (
                <CheckCircle2 color={t.colors.primary} size={18} />
              ) : (
                <Circle color={t.colors.tabInactive} size={18} />
              )}
              <Text style={{ color: t.colors.text }}>
                Mostrar concluídos
              </Text>
            </TouchableOpacity>

            <View
              style={{
                backgroundColor: "#10152A",
                borderRadius: t.radius.md,
                borderWidth: 1,
                borderColor: t.colors.border,
                paddingHorizontal: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                height: 46,
              }}
            >
              <Tag color={t.colors.tabInactive} size={18} />
              <TextInput
                placeholder="Filtrar por categoria"
                placeholderTextColor={t.colors.tabInactive}
                value={categoryFilter}
                onChangeText={setCategoryFilter}
                style={{ flex: 1, color: t.colors.text, fontSize: 14 }}
              />
            </View>
          </View>
        )}

        <View
          style={{
            backgroundColor: t.colors.surfaceAlt,
            borderRadius: t.radius.lg,
            padding: t.spacing.lg,
            borderWidth: 1,
            borderColor: t.colors.border,
            gap: t.spacing.sm,
          }}
        >
          <Text style={{ color: t.colors.text, fontSize: 16, fontWeight: "800" }}>
            Novo objetivo
          </Text>

          <View
            style={{
              backgroundColor: "#10152A",
              borderRadius: t.radius.md,
              borderWidth: 1,
              borderColor: t.colors.border,
              paddingHorizontal: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              height: 46,
            }}
          >
            <Plus color={t.colors.tabInactive} size={18} />
            <TextInput
              placeholder="Ex.: Estudar 1h de IA"
              placeholderTextColor={t.colors.tabInactive}
              value={newTitle}
              onChangeText={setNewTitle}
              style={{ flex: 1, color: t.colors.text, fontSize: 14 }}
              returnKeyType="done"
              onSubmitEditing={addItem}
            />
          </View>

          <View
            style={{
              backgroundColor: "#10152A",
              borderRadius: t.radius.md,
              borderWidth: 1,
              borderColor: t.colors.border,
              paddingHorizontal: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              height: 46,
            }}
          >
            <Tag color={t.colors.tabInactive} size={18} />
            <TextInput
              placeholder="Categoria (ex.: Estudo, Carreira...)"
              placeholderTextColor={t.colors.tabInactive}
              value={newCategory}
              onChangeText={setNewCategory}
              style={{ flex: 1, color: t.colors.text, fontSize: 14 }}
            />
          </View>

          <View
            style={{
              backgroundColor: "#10152A",
              borderRadius: t.radius.md,
              borderWidth: 1,
              borderColor: t.colors.border,
              paddingHorizontal: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              height: 46,
            }}
          >
            <Clock3 color={t.colors.tabInactive} size={18} />
            <TextInput
              placeholder="Data planejada (DD/MM/AAAA)"
              placeholderTextColor={t.colors.tabInactive}
              value={newDateText}
              onChangeText={(txt) => setNewDateText(maskDateInput(txt))}
              style={{ flex: 1, color: t.colors.text, fontSize: 14 }}
              keyboardType="number-pad"
              maxLength={10}
            />
          </View>

          <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
            {newDateText.trim()
              ? (parseDateInput(newDateText) ? `Prazo: ${formatPlanned(parseDateInput(newDateText))}` : "Formato de data inválido")
              : "Sem prazo definido"}
          </Text>

          <TouchableOpacity
            onPress={addItem}
            style={{
              marginTop: 2,
              height: 48,
              borderRadius: t.radius.pill,
              backgroundColor: newTitle.trim() ? t.colors.primary : t.colors.border,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              opacity: newTitle.trim() ? 1 : 0.8,
            }}
            disabled={!newTitle.trim()}
          >
            <Plus color="#0B0D13" />
            <Text style={{ color: "#0B0D13", fontWeight: "900" }}>
              Adicionar objetivo
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            backgroundColor: t.colors.glass,
            borderRadius: t.radius.lg,
            padding: t.spacing.lg,
            borderWidth: 1,
            borderColor: t.colors.border,
            gap: t.spacing.sm,
          }}
        >
          <Text style={{ color: t.colors.text, fontSize: 16, fontWeight: "800" }}>
            Minha agenda
          </Text>

          <FlatList
            data={filtered}
            keyExtractor={(i) => i.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: t.spacing.xs }} />}
            renderItem={({ item }) => {
              const Icon = item.done ? CheckCircle2 : Circle;
              return (
                <TouchableOpacity
                  onPress={() => toggleItem(item.id)}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderRadius: t.radius.md,
                    backgroundColor: item.done ? "rgba(78,242,195,0.10)" : "#1A2035",
                    borderWidth: 1,
                    borderColor: item.done ? t.colors.primary : t.colors.border,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Icon color={item.done ? t.colors.primary : t.colors.tabInactive} />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: t.colors.text,
                        fontWeight: "800",
                        textDecorationLine: item.done ? "line-through" : "none",
                      }}
                    >
                      {item.title}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                        {item.category}
                      </Text>
                      {item.plannedAt && (
                        <>
                          <View
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: 999,
                              backgroundColor: t.colors.border,
                            }}
                          />
                          <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                            {formatPlanned(item.plannedAt)}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={{ color: t.colors.textMuted }}>
                Você ainda não cadastrou nenhum objetivo.
              </Text>
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
