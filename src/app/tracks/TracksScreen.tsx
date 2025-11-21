import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react-native";
import { useAuth } from "../../store/auth.store";
import {
  getTrackByUser,
  createTrack,
  updateTrack,
  deleteTrack,
  Track,
} from "../../services/track.service";


type AgendaWhen = "hoje" | "semana" | "mes";

type AgendaItem = {
  id: string;
  title: string;
  when: AgendaWhen;
  category: "Estudo" | "Carreira" | "Pessoal" | string;
  done: boolean;
};

const INITIAL_ITEMS: AgendaItem[] = [
  {
    id: "1",
    title: "Estudar 1h da trilha principal",
    when: "hoje",
    category: "Estudo",
    done: false,
  },
  {
    id: "2",
    title: "Revisar anotações da última aula",
    when: "hoje",
    category: "Estudo",
    done: false,
  },
  {
    id: "3",
    title: "Planejar horários de estudo da semana",
    when: "semana",
    category: "Carreira",
    done: false,
  },
  {
    id: "4",
    title: "Separar 2 noites livres para estudo",
    when: "semana",
    category: "Estudo",
    done: false,
  },
];

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

export default function TracksScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [items, setItems] = useState<AgendaItem[]>(INITIAL_ITEMS);
  const [filterWhen, setFilterWhen] = useState<AgendaWhen | "todos">("hoje");
  const [search, setSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newWhen, setNewWhen] = useState<AgendaWhen>("hoje");

  const [track, setTrack] = useState<Track | null>(null);
  const [loadingTrack, setLoadingTrack] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncedPercent, setLastSyncedPercent] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return items
      .filter((i) => (filterWhen === "todos" ? true : i.when === filterWhen))
      .filter((i) =>
        search ? i.title.toLowerCase().includes(search.toLowerCase()) : true
      );
  }, [items, filterWhen, search]);

  const totalView = filtered.length;
  const doneView = filtered.filter((i) => i.done).length;
  const pctView = totalView ? Math.round((doneView / totalView) * 100) : 0;

  const totalAll = items.length;
  const doneAll = items.filter((i) => i.done).length;
  const pctAll = totalAll ? Math.round((doneAll / totalAll) * 100) : 0;

  const addItem = () => {
    const title = newTitle.trim();
    if (!title) return;
    const item: AgendaItem = {
      id: String(Date.now()),
      title,
      when: newWhen,
      category: "Estudo",
      done: false,
    };
    setItems((prev) => [item, ...prev]);
    setNewTitle("");
  };

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i))
    );
  };

  const clearDone = () => {
    setItems((prev) => prev.filter((i) => !i.done));
  };

  const whenLabel = (w: AgendaWhen) => {
    if (w === "hoje") return "Hoje";
    if (w === "semana") return "Esta semana";
    return "Este mês";
  };

  const numericUserId = user ? Number(user.id) : NaN;

  const loadTrack = async () => {
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
    } finally {
      setLoadingTrack(false);
    }
  };

  const syncProgress = async (newPercent: number) => {
    if (!user || Number.isNaN(numericUserId)) return;
    if (lastSyncedPercent === newPercent) return;
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
    } catch {
    } finally {
      setSyncing(false);
    }
  };

  const resetRemoteTrack = async () => {
    if (!user || Number.isNaN(numericUserId)) return;
    setSyncing(true);
    try {
      await deleteTrack(numericUserId);
      setTrack(null);
      setLastSyncedPercent(0);
    } catch {
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadTrack();
  }, [numericUserId]);

  useEffect(() => {
    if (!user || Number.isNaN(numericUserId)) return;
    syncProgress(pctAll);
  }, [pctAll]);

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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Layers color={t.colors.primary} />
          <Text style={{ color: t.colors.text, fontSize: 20, fontWeight: "800" }}>
            Agenda de estudo
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <CalendarClock color={t.colors.primary} />
              <Text
                style={{
                  color: t.colors.text,
                  fontSize: 16,
                  fontWeight: "800",
                }}
              >
                Resumo de objetivos
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: t.radius.pill,
                backgroundColor: t.colors.surfaceAlt,
              }}
            >
              <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                {filterWhen === "todos"
                  ? "Todos"
                  : whenLabel(filterWhen as AgendaWhen)}
              </Text>
            </View>
          </View>

          <ProgressBar value={pctView} />

          <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
            {totalView === 0
              ? "Nenhum objetivo cadastrado para este período."
              : `${doneView} de ${totalView} objetivos concluídos (${pctView}%).`}
          </Text>

          {loadingTrack && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginTop: 4,
              }}
            >
              <ActivityIndicator size="small" color={t.colors.primary} />
              <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>
                Carregando trilha no servidor...
              </Text>
            </View>
          )}

          {syncing && !loadingTrack && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginTop: 4,
              }}
            >
              <ActivityIndicator size="small" color={t.colors.primary} />
              <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>
                Sincronizando progresso com a API...
              </Text>
            </View>
          )}

          {track && (
            <Text style={{ color: t.colors.textMuted, fontSize: 11, marginTop: 4 }}>
              Progresso salvo no servidor:{" "}
              {typeof track.percentualConcluido === "number"
                ? `${track.percentualConcluido}%`
                : "0%"}
            </Text>
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
              <Text
                style={{
                  color: t.colors.textMuted,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
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
              <Text
                style={{
                  color: t.colors.textMuted,
                  fontSize: 11,
                  fontWeight: "600",
                }}
              >
                Resetar trilha no servidor
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
          <TextInput
            placeholder="Buscar objetivo (ex.: IA, FIAP, revisão...)"
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
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: t.radius.md,
              backgroundColor: t.colors.glass,
              borderWidth: 1,
              borderColor: t.colors.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Filter color={t.colors.tabInactive} />
          </View>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: t.spacing.sm }}>
          {[
            { key: "hoje" as const, label: "Hoje" },
            { key: "semana" as const, label: "Esta semana" },
            { key: "mes" as const, label: "Este mês" },
            { key: "todos" as const, label: "Todos" },
          ].map((opt) => (
            <TouchableOpacity
              key={opt.key}
              onPress={() => setFilterWhen(opt.key)}
              style={{
                backgroundColor:
                  filterWhen === opt.key ? "rgba(78,242,195,0.12)" : "#1A2035",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: t.radius.pill,
                borderWidth: 1,
                borderColor:
                  filterWhen === opt.key ? t.colors.primary : t.colors.border,
              }}
            >
              <Text
                style={{
                  color:
                    filterWhen === opt.key ? t.colors.primary : t.colors.text,
                }}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
          <Text
            style={{
              color: t.colors.text,
              fontSize: 16,
              fontWeight: "800",
            }}
          >
            Novo objetivo
          </Text>

          <TextInput
            placeholder="Ex.: Estudar 2h de R.I.S.E., revisar aula de dados..."
            placeholderTextColor={t.colors.tabInactive}
            value={newTitle}
            onChangeText={setNewTitle}
            style={{
              backgroundColor: "#10152A",
              color: t.colors.text,
              borderRadius: t.radius.md,
              paddingHorizontal: 12,
              height: 44,
              borderWidth: 1,
              borderColor: t.colors.border,
            }}
          />

          <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
            {[
              { key: "hoje" as const, label: "Hoje" },
              { key: "semana" as const, label: "Esta semana" },
              { key: "mes" as const, label: "Este mês" },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setNewWhen(opt.key)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  paddingVertical: 8,
                  borderRadius: t.radius.md,
                  borderWidth: 1,
                  borderColor:
                    newWhen === opt.key ? t.colors.primary : t.colors.border,
                  backgroundColor:
                    newWhen === opt.key ? "rgba(78,242,195,0.12)" : t.colors.glass,
                }}
              >
                <Text
                  style={{
                    color:
                      newWhen === opt.key ? t.colors.primary : t.colors.text,
                    fontWeight: "600",
                    fontSize: 12,
                  }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={addItem}
            style={{
              marginTop: t.spacing.xs,
              alignSelf: "flex-end",
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: t.radius.pill,
              backgroundColor: newTitle.trim()
                ? t.colors.primary
                : t.colors.border,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
            disabled={!newTitle.trim()}
          >
            <Plus color="#0B0D13" />
            <Text
              style={{
                color: "#0B0D13",
                fontWeight: "800",
              }}
            >
              Adicionar
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
          <Text
            style={{
              color: t.colors.text,
              fontSize: 16,
              fontWeight: "800",
            }}
          >
            Minha agenda
          </Text>

          <FlatList
            data={filtered}
            keyExtractor={(i) => i.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => (
              <View style={{ height: t.spacing.xs }} />
            )}
            renderItem={({ item }) => {
              const Icon = item.done ? CheckCircle2 : Circle;
              return (
                <TouchableOpacity
                  onPress={() => toggleItem(item.id)}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 8,
                    borderRadius: t.radius.md,
                    backgroundColor: item.done
                      ? "rgba(78,242,195,0.10)"
                      : "#1A2035",
                    borderWidth: 1,
                    borderColor: item.done
                      ? t.colors.primary
                      : t.colors.border,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <Icon
                    color={
                      item.done ? t.colors.primary : t.colors.tabInactive
                    }
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: t.colors.text,
                        fontWeight: "700",
                        textDecorationLine: item.done ? "line-through" : "none",
                      }}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={{
                        color: t.colors.textMuted,
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      {whenLabel(item.when)} • {item.category}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={{ color: t.colors.textMuted }}>
                Nenhum objetivo cadastrado para este período.
              </Text>
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
