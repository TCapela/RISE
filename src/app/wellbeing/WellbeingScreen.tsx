import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme/theme";
import { useWellbeing, MoodEntry, MoodValue } from "../../store/wellbeing.store";
import Svg, { Rect, Line } from "react-native-svg";
import { HeartPulse, Trash2, Save } from "lucide-react-native";

const moods = [
  { v: 1 as const, label: "Péssimo", emoji: "😣" },
  { v: 2 as const, label: "Ruim", emoji: "☁️" },
  { v: 3 as const, label: "Ok", emoji: "😐" },
  { v: 4 as const, label: "Bem", emoji: "🙂" },
  { v: 5 as const, label: "Ótimo", emoji: "😄" },
];

function formatDateBr(date: string) {
  const [y, m, d] = date.split("-");
  return `${d}/${m}`;
}

export default function WellbeingScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { entries, loading, error, load, saveToday, remove } = useWellbeing();

  const todayKey = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const todayEntry = entries.find((e) => e.date === todayKey) ?? null;

  const [selectedMood, setSelectedMood] = useState<MoodValue | null>(
    todayEntry?.value ?? null
  );
  const [note, setNoteLocal] = useState(todayEntry?.note ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelectedMood(todayEntry?.value ?? null);
    setNoteLocal(todayEntry?.note ?? "");
  }, [todayEntry]);

  const last7 = useMemo<MoodEntry[]>(() => {
    const out: MoodEntry[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
      const found = entries.find((e) => e.date === key);
      out.push(
        found ?? {
          id: 0,
          date: key,
          value: 0 as any,
          note: "",
        }
      );
    }
    return out;
  }, [entries]);

  const avg7 = useMemo(() => {
    const vals = last7.filter((e) => e.value >= 1).map((e) => e.value);
    if (!vals.length) return 0;
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  }, [last7]);

  const streak = useMemo(() => {
    let s = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`;
      const has = entries.find((e) => e.date === key && e.value >= 1);
      if (has) s += 1;
      else break;
    }
    return s;
  }, [entries]);

  const summaryLabel = useMemo(() => {
    if (!avg7) return "Sem dados suficientes ainda";
    if (avg7 <= 2) return "Humor mais baixo nos últimos dias";
    if (avg7 < 4) return "Humor estável, com oscilações naturais";
    return "Humor alto na maior parte da semana";
  }, [avg7]);

  const tip = useMemo(() => {
    const v = selectedMood ?? todayEntry?.value ?? 0;
    if (!v) return "Registrar como você está hoje já é um passo importante de autocuidado.";
    if (v <= 1) return "Dia pesado. Tenta separar 5 minutos para respirar fundo, alongar e beber água.";
    if (v === 2) return "Talvez seja um dia bom para reduzir exigências e focar só no essencial.";
    if (v === 3) return "Você está no meio do caminho. Que tal planejar um bloco curto de estudo e uma pausa depois?";
    if (v === 4) return "Aproveita o bom momento para avançar um pouco em uma trilha ou projeto que importa para você.";
    return "Dia ótimo! Só cuida para não lotar demais a agenda: descanso também é produtividade.";
  }, [selectedMood, todayEntry]);

  const handleSave = async () => {
    try {
      if (!selectedMood && !note.trim()) return;
      setSaving(true);
      await saveToday(selectedMood ?? 0, note);
    } catch (err: any) {
      Alert.alert("Erro", err?.message || "Não foi possível salvar o registro.");
    } finally {
      setSaving(false);
    }
  };

  const last14Sorted = useMemo(
    () => [...entries].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 14),
    [entries]
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: t.spacing.lg,
          gap: t.spacing.lg,
          paddingBottom: insets.bottom + t.spacing.xxl + 80,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <HeartPulse color={t.colors.primary} />
          <View>
            <Text style={{ color: t.colors.text, fontSize: 20, fontWeight: "800" }}>
              Bem-estar
            </Text>
            <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
              Registro emocional para acompanhar sua jornada
            </Text>
          </View>
        </View>

        {loading && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <ActivityIndicator color={t.colors.primary} />
            <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
              Carregando registros...
            </Text>
          </View>
        )}

        {!!error && (
          <Text style={{ color: "#FF6B6B", fontSize: 12 }}>
            {error}
          </Text>
        )}

        <View
          style={{
            backgroundColor: t.colors.surfaceAlt,
            borderRadius: t.radius.lg,
            padding: t.spacing.lg,
            borderWidth: 1,
            borderColor: t.colors.border,
            gap: t.spacing.md,
          }}
        >
          <Text style={{ color: t.colors.text, fontWeight: "800" }}>
            Como você está hoje?
          </Text>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {moods.map((m) => {
              const focused = selectedMood === m.v;
              return (
                <TouchableOpacity
                  key={m.v}
                  onPress={() => setSelectedMood(m.v)}
                  style={{
                    flex: 1,
                    marginHorizontal: 4,
                    borderRadius: 18,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 8,
                    backgroundColor: focused ? "rgba(78,242,195,0.12)" : t.colors.glass,
                    borderWidth: 1,
                    borderColor: focused ? t.colors.primary : t.colors.border,
                  }}
                >
                  <Text style={{ fontSize: 20 }}>{m.emoji}</Text>
                  <Text
                    style={{
                      color: focused ? t.colors.primary : t.colors.text,
                      fontSize: 11,
                      marginTop: 4,
                    }}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text
            style={{
              color: t.colors.textMuted,
              fontSize: 11,
              marginTop: 2,
              textAlign: "center",
            }}
          >
            Do 1 (dia muito difícil) ao 5 (dia muito bom)
          </Text>

          <TextInput
            placeholder="O que está influenciando o seu dia? (opcional)"
            placeholderTextColor={t.colors.tabInactive}
            value={note}
            onChangeText={setNoteLocal}
            style={{
              marginTop: t.spacing.sm,
              backgroundColor: "#10152A",
              color: t.colors.text,
              borderRadius: t.radius.md,
              paddingHorizontal: 12,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: t.colors.border,
              minHeight: 70,
            }}
            multiline
          />

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving || (!selectedMood && !note.trim())}
            style={{
              marginTop: t.spacing.sm,
              alignSelf: "flex-end",
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: t.radius.pill,
              backgroundColor:
                saving || (!selectedMood && !note.trim())
                  ? t.colors.border
                  : t.colors.primary,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Save color="#0B0D13" size={16} />
            <Text
              style={{
                color: "#0B0D13",
                fontWeight: "800",
                fontSize: 13,
              }}
            >
              {saving ? "Salvando..." : "Salvar check-in"}
            </Text>
          </TouchableOpacity>

          <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>
            Esse registro é só seu. Use como um diário rápido.
          </Text>

          <Text
            style={{
              color: todayEntry ? t.colors.accent : t.colors.textMuted,
              fontSize: 12,
              marginTop: 4,
            }}
          >
            {todayEntry ? "Check-in salvo para hoje" : "Ainda sem check-in hoje"}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
          <View
            style={{
              flex: 1,
              backgroundColor: t.colors.glass,
              borderRadius: t.radius.lg,
              borderWidth: 1,
              borderColor: t.colors.border,
              padding: t.spacing.md,
              gap: 4,
            }}
          >
            <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>Média 7 dias</Text>
            <Text style={{ color: t.colors.text, fontSize: 22, fontWeight: "800" }}>
              {avg7 || "-"}
            </Text>
            <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>
              {summaryLabel}
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: t.colors.glass,
              borderRadius: t.radius.lg,
              borderWidth: 1,
              borderColor: t.colors.border,
              padding: t.spacing.md,
              gap: 4,
            }}
          >
            <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>Dias seguidos</Text>
            <Text style={{ color: t.colors.text, fontSize: 22, fontWeight: "800" }}>
              {streak}d
            </Text>
            <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>
              Quantos dias você registrou sem pular
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: t.colors.glass,
            borderRadius: t.radius.lg,
            padding: t.spacing.lg,
            borderWidth: 1,
            borderColor: t.colors.border,
          }}
        >
          <Text
            style={{
              color: t.colors.text,
              fontWeight: "800",
              marginBottom: t.spacing.sm,
            }}
          >
            Últimos 7 dias
          </Text>

          <Svg width="100%" height={120} viewBox="0 0 350 120">
            <Line
              x1="0"
              y1="100"
              x2="350"
              y2="100"
              stroke={t.colors.border}
              strokeWidth="1"
            />
            {last7.map((e, i) => {
              const baseHeight = e.value ? e.value * 16 : 4;
              const h = baseHeight;
              const x = 20 + i * 45;
              const y = 100 - h;
              const filled = e.value >= 1;
              return (
                <Rect
                  key={e.date}
                  x={x}
                  y={y}
                  width={28}
                  height={h}
                  rx={8}
                  fill={filled ? t.colors.primary : "#1A1E31"}
                />
              );
            })}
          </Svg>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 4,
            }}
          >
            {last7.map((e) => (
              <Text
                key={`${e.date}-label`}
                style={{
                  color: t.colors.textMuted,
                  fontSize: 10,
                  width: 32,
                  textAlign: "center",
                }}
                numberOfLines={1}
              >
                {formatDateBr(e.date)}
              </Text>
            ))}
          </View>

          <Text
            style={{
              color: t.colors.textMuted,
              marginTop: t.spacing.sm,
              fontSize: 12,
            }}
          >
            {tip}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: t.colors.surfaceAlt,
            borderRadius: t.radius.lg,
            padding: t.spacing.lg,
            borderWidth: 1,
            borderColor: t.colors.border,
            gap: t.spacing.md,
          }}
        >
          <Text style={{ color: t.colors.text, fontWeight: "800" }}>
            Linha do tempo
          </Text>
          <FlatList
            data={last14Sorted}
            keyExtractor={(i) => String(i.id)}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: t.colors.glass,
                  borderRadius: t.radius.md,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                  padding: t.spacing.md,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 999,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(78,242,195,0.12)",
                      borderWidth: 1,
                      borderColor: t.colors.border,
                    }}
                  >
                    <Text style={{ color: t.colors.primary, fontWeight: "800" }}>
                      {item.value || "-"}
                    </Text>
                  </View>
                  <View style={{ maxWidth: 200 }}>
                    <Text style={{ color: t.colors.text, fontWeight: "700" }}>
                      {formatDateBr(item.date)}
                    </Text>
                    {!!item.note && (
                      <Text
                        style={{ color: t.colors.textMuted, fontSize: 12 }}
                        numberOfLines={1}
                      >
                        {item.note}
                      </Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => remove(item.id)}
                  style={{ padding: 6 }}
                >
                  <Trash2 color={t.colors.tabInactive} />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={{ color: t.colors.textMuted }}>
                Sem registros ainda. Comece registrando o dia de hoje.
              </Text>
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
