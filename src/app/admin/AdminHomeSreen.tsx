import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  useWindowDimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../theme/theme";
import { useNavigation } from "@react-navigation/native";
import {
  LayoutDashboard,
  RefreshCw,
  Settings as SettingsIcon,
  GraduationCap,
  Users,
  FileText,
  Sparkles,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
} from "lucide-react-native";
import { useAuth } from "../../store/auth.store";
import { api } from "../../services/api";
import { fetchAdminCourses } from "../../services/admin.courses.service";
import { getCurriculaAdmin, RawCurriculo } from "../../services/admin.curricula.service";
import { fetchUsers } from "../../services/user.service";

type DashboardStats = {
  courses: number;
  users: number;
  curricula: number;
  admins: number;
  avgCompleteness: number;
  newCurricula7d: number;
};

type CompletenessBucket = {
  label: string;
  pct: number;
  count: number;
  range: [number, number];
};

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.getTime();
}

function fmtTime(d?: Date | null) {
  if (!d) return "";
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminHomeScreen() {
  const t = useTheme();
  const nav = useNavigation<any>();
  const { user, signOut } = useAuth();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const [stats, setStats] = useState<DashboardStats>({
    courses: 0,
    users: 0,
    curricula: 0,
    admins: 0,
    avgCompleteness: 0,
    newCurricula7d: 0,
  });

  const [buckets, setBuckets] = useState<CompletenessBucket[]>([
    { label: "0–39%", pct: 0, count: 0, range: [0, 39] },
    { label: "40–69%", pct: 0, count: 0, range: [40, 69] },
    { label: "70–89%", pct: 0, count: 0, range: [70, 89] },
    { label: "90–100%", pct: 0, count: 0, range: [90, 100] },
  ]);

  const displayLastSync = useMemo(() => fmtTime(lastSync), [lastSync]);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [coursesAdmin, curriculaAdmin, rawCurricula, usersPage1] = await Promise.all([
        fetchAdminCourses(),
        getCurriculaAdmin(),
        api.get<RawCurriculo[]>("/Curriculo"),
        fetchUsers(1, 1),
      ]);

      const courses = coursesAdmin.length;
      const users = usersPage1.totalItems;
      const curricula = curriculaAdmin.length;

      let admins = 0;
      try {
        const usersAll = await fetchUsers(1, Math.min(500, usersPage1.totalItems || 1));
        admins = usersAll.items.filter((u) =>
          String(u.type || "").toLowerCase().includes("admin")
        ).length;

        if (usersPage1.totalItems > usersAll.items.length) {
          const pagesToScan = Math.ceil(usersPage1.totalItems / usersAll.pageSize);
          for (let p = 2; p <= pagesToScan; p += 1) {
            const page = await fetchUsers(p, usersAll.pageSize);
            admins += page.items.filter((u) =>
              String(u.type || "").toLowerCase().includes("admin")
            ).length;
          }
        }
      } catch {
        admins = 0;
      }

      const cutoff = daysAgo(7);

      const newCurricula7d = rawCurricula.data.filter((c: any) => {
        const iso = c?.ultimaAtualizacao || c?.lastUpdated || c?.updatedAt || c?.updated_at;
        if (!iso) return false;
        const ms = new Date(iso).getTime();
        return !Number.isNaN(ms) && ms >= cutoff;
      }).length;

      const completenessList = curriculaAdmin.map((c) => c.completeness);
      const avgCompleteness =
        completenessList.length === 0
          ? 0
          : Math.round(completenessList.reduce((a, b) => a + b, 0) / completenessList.length);

      const counts = [
        completenessList.filter((p) => p <= 39).length,
        completenessList.filter((p) => p >= 40 && p <= 69).length,
        completenessList.filter((p) => p >= 70 && p <= 89).length,
        completenessList.filter((p) => p >= 90).length,
      ];
      const totalB = completenessList.length || 1;

      setBuckets((prev) =>
        prev.map((b, i) => ({
          ...b,
          count: counts[i],
          pct: Math.round((counts[i] / totalB) * 100),
        }))
      );

      setStats({
        courses,
        users,
        curricula,
        admins,
        avgCompleteness,
        newCurricula7d,
      });

      setLastSync(new Date());
    } catch {
      setError("Falha ao carregar dados do painel.");
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  }, [loadDashboard]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const MetricCard = ({
    label,
    value,
    sub,
    icon,
    accent,
  }: {
    label: string;
    value: number | string;
    sub?: string;
    icon: React.ReactNode;
    accent: string;
  }) => (
    <View
      style={{
        flex: 1,
        minWidth: 0,
        backgroundColor: t.colors.glass,
        borderRadius: t.radius.xl,
        padding: t.spacing.lg,
        borderWidth: 1,
        borderColor: t.colors.border,
        gap: 8,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: accent,
            borderWidth: 1,
            borderColor: t.colors.border,
          }}
        >
          {icon}
        </View>
        <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>{label}</Text>
      </View>

      <Text style={{ color: t.colors.text, fontSize: 28, fontWeight: "900" }}>
        {loading ? "…" : value}
      </Text>

      {sub ? (
        <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>{sub}</Text>
      ) : null}
    </View>
  );

  const Shortcut = ({
    title,
    subtitle,
    icon,
    onPress,
  }: {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        flex: 1,
        backgroundColor: t.colors.surfaceAlt,
        borderRadius: t.radius.lg,
        padding: t.spacing.lg,
        borderWidth: 1,
        borderColor: t.colors.border,
        gap: 10,
      }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: t.colors.glass,
          borderWidth: 1,
          borderColor: t.colors.border,
        }}
      >
        {icon}
      </View>

      <View style={{ gap: 2 }}>
        <Text style={{ color: t.colors.text, fontWeight: "900" }}>{title}</Text>
        <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>{subtitle}</Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Text style={{ color: t.colors.textMuted, fontSize: 12, fontWeight: "800" }}>
          Abrir gestão
        </Text>
        <ArrowRight color={t.colors.textMuted} size={14} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={t.colors.primary}
          />
        }
        contentContainerStyle={{
          padding: t.spacing.lg,
          gap: t.spacing.lg,
          paddingBottom: 120,
          maxWidth: 1200,
          alignSelf: "center",
          width: "100%",
        }}
      >
        <View
          style={{
            backgroundColor: t.colors.surface,
            borderRadius: t.radius.xl,
            padding: t.spacing.lg,
            borderWidth: 1,
            borderColor: t.colors.border,
            gap: 12,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ gap: 4, flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <LayoutDashboard color={t.colors.primary} size={16} />
                <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                  Painel Admin
                </Text>
              </View>

              <Text style={{ color: t.colors.text, fontSize: 22, fontWeight: "900" }}>
                {user?.name ? `Olá, ${user.name}` : "Olá, Admin"}
              </Text>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <ShieldCheck color={t.colors.primary} size={14} />
                <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                  Sessão protegida
                </Text>
                {displayLastSync ? (
                  <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                    • {displayLastSync}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={{ gap: 8, alignItems: "flex-end" }}>
              <TouchableOpacity
                onPress={loadDashboard}
                disabled={loading}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  backgroundColor: t.colors.glass,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <ActivityIndicator color={t.colors.primary} size="small" />
                ) : (
                  <RefreshCw color={t.colors.textMuted} size={14} />
                )}
                <Text style={{ color: t.colors.textMuted, fontSize: 12, fontWeight: "800" }}>
                  {loading ? "Sincronizando..." : "Sincronizar"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={signOut}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <SettingsIcon color={t.colors.textMuted} size={16} />
                <Text style={{ color: t.colors.textMuted, fontSize: 12, fontWeight: "800" }}>
                  Sair
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {error ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                backgroundColor: "rgba(255,107,107,0.08)",
                borderRadius: t.radius.md,
                padding: 10,
                borderWidth: 1,
                borderColor: "rgba(255,107,107,0.25)",
              }}
            >
              <AlertCircle color="#ff6b6b" size={16} />
              <Text style={{ color: "#ff6b6b", fontSize: 12, fontWeight: "800" }}>
                {error}
              </Text>
            </View>
          ) : null}
        </View>

        <View
          style={{
            flexDirection: isWide ? "row" : "column",
            gap: t.spacing.md,
          }}
        >
          <MetricCard
            label="Cursos ativos"
            value={stats.courses}
            sub="Catalogados no app"
            icon={<GraduationCap color={t.colors.primary} size={18} />}
            accent="rgba(78,242,195,0.12)"
          />

          <MetricCard
            label="Usuários cadastrados"
            value={stats.users}
            sub="Total geral de usuários"
            icon={<Users color={t.colors.primary} size={18} />}
            accent="rgba(110,168,255,0.12)"
          />
        </View>

        <View
          style={{
            flexDirection: isWide ? "row" : "column",
            gap: t.spacing.md,
          }}
        >
          <MetricCard
            label="Currículos gerados"
            value={stats.curricula}
            sub={stats.newCurricula7d ? `+${stats.newCurricula7d} nos últimos 7 dias` : "Sem novos currículos em 7 dias"}
            icon={<FileText color={t.colors.accent} size={18} />}
            accent="rgba(255,180,84,0.12)"
          />

          <MetricCard
            label="Completude média"
            value={`${stats.avgCompleteness}%`}
            sub={`${stats.admins} administradores ativos`}
            icon={<Sparkles color={t.colors.accent} size={18} />}
            accent="rgba(160,120,255,0.12)"
          />
        </View>

        <View
          style={{
            backgroundColor: t.colors.glass,
            borderRadius: t.radius.xl,
            padding: t.spacing.lg,
            borderWidth: 1,
            borderColor: t.colors.border,
            gap: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <BarChart3 color={t.colors.primary} size={18} />
              <Text style={{ color: t.colors.text, fontWeight: "900", fontSize: 16 }}>
                Distribuição de completude
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Sparkles color={t.colors.accent} size={14} />
              <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                Média {stats.avgCompleteness}%
              </Text>
            </View>
          </View>

          <View style={{ gap: 10 }}>
            {buckets.map((b) => (
              <View key={b.label} style={{ gap: 6 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                    {b.label}
                  </Text>
                  <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                    {loading ? "…" : `${b.count} (${b.pct}%)`}
                  </Text>
                </View>
                <View
                  style={{
                    height: 8,
                    backgroundColor: t.colors.surfaceAlt,
                    borderRadius: 999,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: t.colors.border,
                  }}
                >
                  <View
                    style={{
                      width: `${loading ? 5 : b.pct}%`,
                      height: "100%",
                      backgroundColor: t.colors.primary,
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View
          style={{
            backgroundColor: t.colors.surfaceAlt,
            borderRadius: t.radius.xl,
            padding: t.spacing.lg,
            borderWidth: 1,
            borderColor: t.colors.border,
            gap: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ color: t.colors.text, fontWeight: "900", fontSize: 16 }}>
              Gestão
            </Text>
            <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
              Atalhos principais
            </Text>
          </View>

          <View
            style={{
              flexDirection: isWide ? "row" : "column",
              gap: t.spacing.md,
            }}
          >
            <Shortcut
              title="Gerenciar cursos"
              subtitle="Criar, editar e desativar cursos"
              icon={<GraduationCap color={t.colors.primary} size={20} />}
              onPress={() => nav.navigate("AdminCourses")}
            />
            <Shortcut
              title="Gerenciar usuários"
              subtitle="Permissões, status e contas"
              icon={<Users color={t.colors.primary} size={20} />}
              onPress={() => nav.navigate("AdminUsers")}
            />
            <Shortcut
              title="Gerenciar currículos"
              subtitle="Auditar completude e conteúdo"
              icon={<FileText color={t.colors.accent} size={20} />}
              onPress={() => nav.navigate("AdminCurricula")}
            />
          </View>
        </View>

        <View style={{ alignItems: "center", marginTop: 2 }}>
          <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
            R.I.S.E. • Admin
          </Text>
          <Text style={{ color: t.colors.textMuted, fontSize: 11, marginTop: 4 }}>
            {Platform.OS === "web" ? "Web" : "Mobile"} • v1
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
