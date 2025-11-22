import { useEffect, useMemo, useState, useCallback } from "react";
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
import { HeartPulse, Trash2, Save, Edit3, CalendarDays, Clock3 } from "lucide-react-native";
import { useAuth } from "../../store/auth.store";

const moods = [
  { v: 1 as const, label: "Péssimo", emoji: "😣" },
  { v: 2 as const, label: "Ruim", emoji: "☁️" },
  { v: 3 as const, label: "Ok", emoji: "😐" },
  { v: 4 as const, label: "Bem", emoji: "🙂" },
  { v: 5 as const, label: "Ótimo", emoji: "😄" },
];

const toDateKey = (d: Date) =>
  d.getFullYear() +
  "-" +
  String(d.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(d.getDate()).padStart(2, "0");

const formatDateBrFull = (key: string) => {
  const [y, m, d] = key.split("-");
  return `${d}/${m}/${y}`;
};

const formatDateBrShort = (key: string) => {
  const [y, m, d] = key.split("-");
  return `${d}/${m}`;
};

const parseBrToKey = (txt: string) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(txt.trim());
  if (!m) return null;
  const d = Number(m[1]);
  const mo = Number(m[2]);
  const y = Number(m[3]);
  const dt = new Date(y, mo - 1, d, 12, 0, 0);
  if (Number.isNaN(dt.getTime())) return null;
  return toDateKey(dt);
};

const maskDateBr = (s: string) => {
  const digits = s.replace(/\D/g, "").slice(0, 8);
  const p1 = digits.slice(0, 2);
  const p2 = digits.slice(2, 4);
  const p3 = digits.slice(4, 8);
  let out = p1;
  if (p2) out += "/" + p2;
  if (p3) out += "/" + p3;
  return out;
};

const maskHours = (s: string) => {
  const digits = s.replace(/\D/g, "").slice(0, 4);
  const hh = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  let out = hh;
  if (mm) out += ":" + mm;
  return out;
};

export default function WellbeingScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth() as any;
  const userId = user ? Number(user.id) : NaN;

  const { entries, loading, error, load, upsert, remove } = useWellbeing();

  useEffect(() => {
    if (!Number.isNaN(userId)) load(userId);
  }, [load, userId]);

  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const [dateText, setDateText] = useState(formatDateBrFull(todayKey));
  const [selectedMood, setSelectedMood] = useState<MoodValue | null>(null);
  const [note, setNote] = useState("");
  const [hoursText, setHoursText] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const currentKey = parseBrToKey(dateText) ?? todayKey;
  const currentEntry = entries.find((e) => e.date === currentKey) ?? null;

  useEffect(() => {
    setSelectedMood(currentEntry?.value ?? null);
    setNote(currentEntry?.note ?? "");
    setHoursText(currentEntry?.hours ? currentEntry.hours.slice(0, 5) : "");
    setEditingId(currentEntry?.id ?? null);
  }, [currentKey, currentEntry?.id]);

  const last7 = useMemo<MoodEntry[]>(() => {
    const out: MoodEntry[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      const found = entries.find((e) => e.date === key);
      out.push(
        found ?? {
          id: 0,
          date: key,
          value: 0 as any,
          note: "",
          hours: null,
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

  const hours7 = useMemo(() => {
    const toMinutes = (h: string | null) => {
      if (!h) return 0;
      const m = /^(\d{2}):(\d{2})/.exec(h);
      if (!m) return 0;
      return Number(m[1]) * 60 + Number(m[2]);
    };
    const mins = last7.reduce((acc, e) => acc + toMinutes(e.hours), 0);
    const hh = Math.floor(mins / 60);
    const mm = mins % 60;
    return mins ? `${hh}h ${String(mm).padStart(2, "0")}m` : "-";
  }, [last7]);

  const streak = useMemo(() => {
    let s = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = toDateKey(d);
      const has = entries.find((e) => e.date === key && e.value >= 1);
      if (has) s += 1;
      else break;
    }
    return s;
  }, [entries]);

  const tip = useMemo(() => {
    const v = selectedMood ?? currentEntry?.value ?? 0;
    if (!v) return "Registrar seu dia te dá clareza. Pequeno hábito, grande efeito.";
    if (v <= 1) return "Se hoje está difícil, prioriza o básico: sono, água, comida e pedir apoio se precisar.";
    if (v === 2) return "Talvez valha diminuir cobrança e focar no essencial. Um passo por vez.";
    if (v === 3) return "Dia neutro. Um bloco curto de estudo + pausa pode virar um bom ritmo.";
    if (v === 4) return "Bom dia. Aproveita o embalo pra avançar numa meta pequena.";
    return "Dia ótimo. Só não transforma isso em sobrecarga: descanso também é progresso.";
  }, [selectedMood, currentEntry]);

  const summaryLabel = useMemo(() => {
    if (!avg7) return "Poucos dados na semana";
    if (avg7 <= 2) return "Semana mais pesada";
    if (avg7 < 4) return "Semana estável";
    return "Semana positiva";
  }, [avg7]);

  const handleSave = useCallback(async () => {
    const key = parseBrToKey(dateText);
    if (!key) {
      Alert.alert("Data inválida", "Use DD/MM/AAAA");
      return;
    }
    if (Number.isNaN(userId)) {
      Alert.alert("Usuário não identificado");
      return;
    }
    try {
      setSaving(true);
      await upsert(userId, key, selectedMood ?? 0, note, hoursText);
    } catch (err: any) {
      Alert.alert("Erro", err?.message || "Não foi possível salvar o registro.");
    } finally {
      setSaving(false);
    }
  }, [dateText, userId, upsert, selectedMood, note, hoursText]);

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
              Check-in rápido do seu dia
            </Text>
          </View>
        </View>

        {loading && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
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
            <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
              Média 7 dias
            </Text>
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
            <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
              Sequência
            </Text>
            <Text style={{ color: t.colors.text, fontSize: 22, fontWeight: "800" }}>
              {streak}d
            </Text>
            <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>
              Dias seguidos com check-in
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
            <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
              Estudo 7 dias
            </Text>
            <Text style={{ color: t.colors.text, fontSize: 22, fontWeight: "800" }}>
              {hours7}
            </Text>
            <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>
              Soma de horas registradas
            </Text>
          </View>
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
            Check-in do dia
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
            <CalendarDays color={t.colors.tabInactive} size={18} />
            <TextInput
              placeholder="Data (DD/MM/AAAA)"
              placeholderTextColor={t.colors.tabInactive}
              value={dateText}
              onChangeText={(v) => setDateText(maskDateBr(v))}
              style={{ flex: 1, color: t.colors.text, fontSize: 14 }}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
            {currentKey !== todayKey && (
              <TouchableOpacity onPress={() => setDateText(formatDateBrFull(todayKey))}>
                <Text style={{ color: t.colors.primary, fontWeight: "800", fontSize: 12 }}>
                  Hoje
                </Text>
              </TouchableOpacity>
            )}
          </View>

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
                    borderRadius: 16,
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
                      fontSize: 10,
                      marginTop: 4,
                    }}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
              placeholder="Horas de estudo (HH:MM)"
              placeholderTextColor={t.colors.tabInactive}
              value={hoursText}
              onChangeText={(v) => setHoursText(maskHours(v))}
              style={{ flex: 1, color: t.colors.text, fontSize: 14 }}
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>

          <TextInput
            placeholder="Atividade/nota do dia (até 50 caracteres)"
            placeholderTextColor={t.colors.tabInactive}
            value={note}
            onChangeText={setNote}
            style={{
              backgroundColor: "#10152A",
              color: t.colors.text,
              borderRadius: t.radius.md,
              paddingHorizontal: 12,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: t.colors.border,
              minHeight: 70,
            }}
            maxLength={50}
            multiline
          />

          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>
              {note.length}/50
            </Text>

            <TouchableOpacity
              onPress={handleSave}
              disabled={saving || (!selectedMood && !note.trim() && !hoursText.trim())}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: t.radius.pill,
                backgroundColor:
                  saving || (!selectedMood && !note.trim() && !hoursText.trim())
                    ? t.colors.border
                    : t.colors.primary,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Save color="#0B0D13" size={16} />
              <Text style={{ color: "#0B0D13", fontWeight: "800", fontSize: 13 }}>
                {saving ? "Salvando..." : editingId ? "Atualizar" : "Salvar"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
            {currentEntry ? "Registro existente para esse dia." : "Sem registro nesse dia ainda."}
          </Text>
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
          <Text style={{ color: t.colors.text, fontWeight: "800", marginBottom: t.spacing.sm }}>
            Últimos 7 dias
          </Text>

          <Svg width="100%" height={120} viewBox="0 0 350 120">
            <Line x1="0" y1="100" x2="350" y2="100" stroke={t.colors.border} strokeWidth="1" />
            {last7.map((e, i) => {
              const h = e.value ? e.value * 16 : 4;
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

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
            {last7.map((e) => (
              <Text
                key={`${e.date}-label`}
                style={{ color: t.colors.textMuted, fontSize: 10, width: 32, textAlign: "center" }}
                numberOfLines={1}
              >
                {formatDateBrShort(e.date)}
              </Text>
            ))}
          </View>

          <Text style={{ color: t.colors.textMuted, marginTop: t.spacing.sm, fontSize: 12 }}>
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
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setDateText(formatDateBrFull(item.date))}
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
                      width: 40,
                      height: 40,
                      borderRadius: 999,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(78,242,195,0.12)",
                      borderWidth: 1,
                      borderColor: t.colors.border,
                    }}
                  >
                    <Text style={{ color: t.colors.primary, fontWeight: "900" }}>
                      {item.value || "-"}
                    </Text>
                  </View>

                  <View style={{ maxWidth: 220, gap: 2 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Text style={{ color: t.colors.text, fontWeight: "800" }}>
                        {formatDateBrFull(item.date)}
                      </Text>
                      {!!item.hours && (
                        <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                          • {item.hours.slice(0,5)}h estudo
                        </Text>
                      )}
                    </View>

                    {!!item.note && (
                      <Text style={{ color: t.colors.textMuted, fontSize: 12 }} numberOfLines={2}>
                        {item.note}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Edit3 size={16} color={t.colors.tabInactive} />
                  <TouchableOpacity
                    onPress={() => remove(item.id)}
                    style={{ padding: 6 }}
                  >
                    <Trash2 color={t.colors.tabInactive} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={{ color: t.colors.textMuted }}>
                Sem registros ainda. Comece com o dia de hoje.
              </Text>
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
