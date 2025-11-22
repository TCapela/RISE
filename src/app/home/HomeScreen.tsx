import { useEffect, useMemo, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator } from "react-native";
import { useTheme } from "../../theme/theme";
import { useNavigation } from "@react-navigation/native";
import {
  Settings,
  User,
  Sparkles,
  HeartPulse,
  FileText,
  Target,
  ListChecks,
  TrendingUp,
  ChevronRight,
} from "lucide-react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useProfile } from "../../store/profile.store";
import { useAuth } from "../../store/auth.store";
import { useWellbeing } from "../../store/wellbeing.store";
import { getObjectivesByUser } from "../../services/objectives.service";
import { getTrackByUser } from "../../services/track.service";
import type { ObjectiveResponse } from "../../services/objectives.service";
import type { Track } from "../../services/track.service";

const logo = require("../../../assets/logo.png");

type AgendaItem = {
  id: string;
  remoteId: number;
  title: string;
  category: string;
  done: boolean;
  plannedAt: string | null;
};

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
  if (!plannedAt) return null;
  const d = new Date(plannedAt);
  const dia = String(d.getDate()).padStart(2, "0");
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}`;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  onPress,
  accent,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: any;
  onPress?: () => void;
  accent?: string;
}) {
  const t = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.9 : 1}
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: t.colors.glass,
        borderRadius: t.radius.lg,
        padding: t.spacing.md,
        borderWidth: 1,
        borderColor: t.colors.border,
        gap: 6,
        minHeight: 96,
        justifyContent: "space-between",
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {icon}
        <Text style={{ color: t.colors.textMuted, fontSize: 12, fontWeight: "700" }}>
          {title}
        </Text>
      </View>

      <Text
        style={{
          color: accent || t.colors.text,
          fontSize: 22,
          fontWeight: "900",
          letterSpacing: 0.2,
        }}
      >
        {value}
      </Text>

      {!!subtitle && (
        <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>
          {subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const t = useTheme();
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const { profile, load: loadProfile, loading: loadingProfile } = useProfile();
  const { user } = useAuth() as any;

  const userId = user ? Number(user.id) : NaN;

  const { entries, load: loadWellbeing } = useWellbeing();

  const [objectives, setObjectives] = useState<AgendaItem[]>([]);
  const [loadingObjectives, setLoadingObjectives] = useState(false);
  const [track, setTrack] = useState<Track | null>(null);
  const [loadingTrack, setLoadingTrack] = useState(false);

  useEffect(() => {
    if (!profile.idUsuario && user?.id && !loadingProfile) {
      loadProfile(user.id);
    }
  }, [user?.id, profile.idUsuario, loadingProfile, loadProfile]);

  useEffect(() => {
    if (!Number.isNaN(userId)) loadWellbeing(userId);
  }, [userId, loadWellbeing]);

  useEffect(() => {
    const loadAll = async () => {
      if (!user || Number.isNaN(userId)) return;

      setLoadingObjectives(true);
      setLoadingTrack(true);

      try {
        const [objs, tr] = await Promise.all([
          getObjectivesByUser(userId),
          getTrackByUser(userId),
        ]);

        setObjectives(objs.map(mapObjectiveToAgenda));
        setTrack(tr || null);
      } catch {
        setObjectives([]);
        setTrack(null);
      } finally {
        setLoadingObjectives(false);
        setLoadingTrack(false);
      }
    };

    loadAll();
  }, [userId, user]);

  const { completenessLabel, completenessColor, completenessPct } = useMemo(() => {
    let pts = 0;
    let total = 0;

    const bump = (ok: boolean, weight: number) => {
      total += weight;
      if (ok) pts += weight;
    };

    bump(!!profile.name?.trim(), 20);
    bump(!!profile.email?.trim(), 20);
    bump(!!profile.bio && profile.bio.trim().length >= 40, 30);

    const skills = profile.skills?.length || 0;
    const skillsScore = Math.min(skills, 6) * 5;
    pts += skillsScore;
    total += 30;

    const pct = total ? Math.round((pts / total) * 100) : 0;

    if (pct >= 80) return { completenessLabel: "Pronto", completenessColor: t.colors.primary, completenessPct: pct };
    if (pct >= 50) return { completenessLabel: "Quase lá", completenessColor: t.colors.accent, completenessPct: pct };
    return { completenessLabel: "Em construção", completenessColor: t.colors.textMuted, completenessPct: pct };
  }, [profile, t.colors.primary, t.colors.accent, t.colors.textMuted]);

  const totals = useMemo(() => {
    const total = objectives.length;
    const done = objectives.filter((o) => o.done).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { total, done, pct };
  }, [objectives]);

  const nextObjectives = useMemo(() => {
    return objectives
      .filter((o) => !o.done)
      .sort((a, b) => {
        const ad = a.plannedAt ? new Date(a.plannedAt).getTime() : Infinity;
        const bd = b.plannedAt ? new Date(b.plannedAt).getTime() : Infinity;
        return ad - bd;
      })
      .slice(0, 3);
  }, [objectives]);

  const todayKey = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  const todayEntry = entries.find((e) => e.date === todayKey) ?? null;

  const avg7 = useMemo(() => {
    const last7Vals = entries
      .filter((e) => {
        const dt = new Date(e.date + "T12:00:00");
        const diff = (new Date().getTime() - dt.getTime()) / (1000 * 60 * 60 * 24);
        return diff <= 7 && e.value >= 1;
      })
      .map((e) => e.value);

    if (!last7Vals.length) return 0;
    return Math.round((last7Vals.reduce((a, b) => a + b, 0) / last7Vals.length) * 10) / 10;
  }, [entries]);

  const suggestions = useMemo(() => {
    const list: { title: string; action: string; go: () => void }[] = [];

    if (completenessPct < 80) {
      list.push({
        title: "Melhore seu currículo",
        action: "Adicionar bio e habilidades",
        go: () => nav.navigate("Currículo"),
      });
    }

    if (totals.total === 0) {
      list.push({
        title: "Crie sua primeira meta",
        action: "Comece com algo simples",
        go: () => nav.navigate("Trilhas"),
      });
    }

    if (!todayEntry) {
      list.push({
        title: "Faça seu check-in",
        action: "Registrar seu humor do dia",
        go: () => nav.navigate("Bem-Estar"),
      });
    }

    if (!list.length) {
      list.push({
        title: "Continue evoluindo",
        action: "Revise metas e mantenha o ritmo",
        go: () => nav.navigate("Trilhas"),
      });
    }

    return list.slice(0, 3);
  }, [completenessPct, totals.total, todayEntry, nav]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: t.spacing.lg,
          gap: t.spacing.lg,
          paddingBottom: insets.bottom + t.spacing.xxl + 40,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: insets.top ? 0 : t.spacing.sm,
          }}
        >
          <TouchableOpacity onPress={() => nav.navigate("Config")} style={{ padding: 6 }}>
            <Settings color={t.colors.tabInactive} />
          </TouchableOpacity>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Image source={logo} style={{ width: 22, height: 22 }} resizeMode="contain" />
            <View>
              <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>
                {greeting}
              </Text>
              <Text style={{ color: t.colors.text, fontSize: 18, fontWeight: "800" }}>
                {profile.name || "Minha Jornada"}
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => nav.navigate("Perfil")} style={{ padding: 6 }}>
            <User color={t.colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
          <StatCard
            title="Currículo"
            value={`${completenessPct}%`}
            subtitle={completenessLabel}
            accent={completenessColor}
            icon={<FileText color={t.colors.primary} size={18} />}
            onPress={() => nav.navigate("Currículo")}
          />

          <StatCard
            title="Objetivos"
            value={loadingObjectives ? "-" : `${totals.done}/${totals.total}`}
            subtitle={totals.total ? `${totals.pct}% concluído` : "Sem metas ainda"}
            icon={<Target color={t.colors.accent} size={18} />}
            onPress={() => nav.navigate("Trilhas")}
          />

          <StatCard
            title="Bem-estar"
            value={todayEntry ? `${todayEntry.value}/5` : "-"}
            subtitle={avg7 ? `Média 7 dias: ${avg7}` : "Sem check-in hoje"}
            icon={<HeartPulse color={t.colors.primary} size={18} />}
            onPress={() => nav.navigate("Bem-Estar")}
          />
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
          <Text style={{ color: t.colors.text, fontSize: 16, fontWeight: "900" }}>
            Continue de onde parou
          </Text>

          {loadingObjectives ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <ActivityIndicator color={t.colors.primary} size="small" />
              <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                Carregando suas metas...
              </Text>
            </View>
          ) : nextObjectives.length ? (
            nextObjectives.map((o) => (
              <TouchableOpacity
                key={o.id}
                activeOpacity={0.9}
                onPress={() => nav.navigate("Trilhas")}
                style={{
                  backgroundColor: t.colors.glass,
                  borderRadius: t.radius.md,
                  padding: t.spacing.md,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={{ color: t.colors.text, fontWeight: "800" }}>
                    {o.title}
                  </Text>
                  <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                    {o.category}
                    {o.plannedAt ? ` • até ${formatPlanned(o.plannedAt)}` : ""}
                  </Text>
                </View>
                <ChevronRight color={t.colors.tabInactive} size={18} />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={{ color: t.colors.textMuted, fontSize: 13 }}>
              Você ainda não tem objetivos pendentes. Crie o primeiro e comece a trilhar.
            </Text>
          )}

          {!!track && (
            <View
              style={{
                marginTop: 6,
                backgroundColor: "#10152A",
                borderRadius: t.radius.md,
                padding: t.spacing.md,
                borderWidth: 1,
                borderColor: t.colors.border,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <TrendingUp color={t.colors.primary} size={16} />
              <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                Progresso geral salvo:{" "}
                <Text style={{ color: t.colors.text, fontWeight: "900" }}>
                  {loadingTrack ? "-" : `${track.percentualConcluido ?? totals.pct}%`}
                </Text>
              </Text>
            </View>
          )}
        </View>

        <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
          <TouchableOpacity
            onPress={() => nav.navigate("Currículo")}
            style={{
              flex: 1,
              backgroundColor: "#1A2035",
              borderRadius: t.radius.lg,
              padding: t.spacing.lg,
              borderWidth: 1,
              borderColor: t.colors.border,
              gap: 6,
            }}
          >
            <FileText color={t.colors.primary} />
            <Text style={{ color: t.colors.text, fontWeight: "900" }}>Currículo</Text>
            <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
              Ajuste seu perfil profissional
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => nav.navigate("Trilhas")}
            style={{
              flex: 1,
              backgroundColor: "#1A2035",
              borderRadius: t.radius.lg,
              padding: t.spacing.lg,
              borderWidth: 1,
              borderColor: t.colors.border,
              gap: 6,
            }}
          >
            <ListChecks color={t.colors.accent} />
            <Text style={{ color: t.colors.text, fontWeight: "900" }}>Objetivos</Text>
            <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
              Organize metas e estudos
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
          <TouchableOpacity
            onPress={() => nav.navigate("Bem-Estar")}
            style={{
              flex: 1,
              backgroundColor: "#1A2035",
              borderRadius: t.radius.lg,
              padding: t.spacing.lg,
              borderWidth: 1,
              borderColor: t.colors.border,
              gap: 6,
            }}
          >
            <HeartPulse color={t.colors.primary} />
            <Text style={{ color: t.colors.text, fontWeight: "900" }}>Bem-estar</Text>
            <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
              Check-in emocional
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => nav.navigate("Cursos")}
            style={{
              flex: 1,
              backgroundColor: "#1A2035",
              borderRadius: t.radius.lg,
              padding: t.spacing.lg,
              borderWidth: 1,
              borderColor: t.colors.border,
              gap: 6,
            }}
          >
            <Sparkles color={t.colors.accent} />
            <Text style={{ color: t.colors.text, fontWeight: "900" }}>Cursos</Text>
            <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
              Explore novos caminhos
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            backgroundColor: t.colors.glass,
            borderRadius: t.radius.lg,
            padding: t.spacing.lg,
            gap: t.spacing.sm,
            borderWidth: 1,
            borderColor: t.colors.border,
          }}
        >
          <Text style={{ color: t.colors.text, fontSize: 16, fontWeight: "900" }}>
            Próximos passos inteligentes
          </Text>

          {suggestions.map((s, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={s.go}
              activeOpacity={0.9}
              style={{
                backgroundColor: "#10152A",
                borderRadius: t.radius.md,
                padding: t.spacing.md,
                borderWidth: 1,
                borderColor: t.colors.border,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.colors.text, fontWeight: "800" }}>
                  {s.title}
                </Text>
                <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                  {s.action}
                </Text>
              </View>
              <ChevronRight color={t.colors.tabInactive} size={18} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
