import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../theme/theme";
import { useNavigation } from "@react-navigation/native";
import {
  GraduationCap,
  Users,
  FileText,
  Settings as SettingsIcon,
  RefreshCw,
} from "lucide-react-native";
import { useAuth } from "../../store/auth.store";

const API_BASE = "http://localhost:5106/api/v1";

type DashboardStats = {
  courses: number;
  users: number;
  curricula: number;
};

async function fetchCount(url: string): Promise<number> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  if (Array.isArray(data)) return data.length;
  if (data && typeof data === "object") {
    if (Array.isArray((data as any).items)) return (data as any).items.length;
    if (Array.isArray((data as any).data)) return (data as any).data.length;
    if (typeof (data as any).totalCount === "number") return (data as any).totalCount;
    if (typeof (data as any).total === "number") return (data as any).total;
  }

  return 0;
}

export default function AdminHomeScreen() {
  const t = useTheme();
  const nav = useNavigation<any>();
  const { user, signOut } = useAuth();

  const [stats, setStats] = useState<DashboardStats>({
    courses: 0,
    users: 0,
    curricula: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const displayLastSync = useMemo(() => {
    if (!lastSync) return "";
    return lastSync.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [lastSync]);

  async function loadStats() {
    try {
      setLoadingStats(true);
      setStatsError(null);

      const [courses, users, curricula] = await Promise.all([
        fetchCount(`${API_BASE}/Curso`),
        fetchCount(`${API_BASE}/Usuario?pageNumber=1&pageSize=1000`),
        fetchCount(`${API_BASE}/Curriculo`),
      ]);

      setStats({ courses, users, curricula });
      setLastSync(new Date());
    } catch (err: any) {
      setStatsError("Não foi possível sincronizar os dados agora.");
    } finally {
      setLoadingStats(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <View style={{ flex: 1, padding: t.spacing.lg, gap: t.spacing.lg }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
              Painel administrativo
            </Text>
            <Text
              style={{
                color: t.colors.text,
                fontSize: 22,
                fontWeight: "800",
              }}
            >
              Olá, {user?.name || "Admin"}
            </Text>
            {displayLastSync ? (
              <Text
                style={{
                  color: t.colors.textMuted,
                  fontSize: 11,
                  marginTop: 2,
                }}
              >
                Atualizado às {displayLastSync}
              </Text>
            ) : null}
          </View>

          <View style={{ gap: 8 }}>
            <TouchableOpacity
              onPress={loadStats}
              disabled={loadingStats}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: t.colors.border,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: t.colors.glass,
              }}
            >
              {loadingStats ? (
                <ActivityIndicator color={t.colors.primary} size="small" />
              ) : (
                <RefreshCw color={t.colors.textMuted} size={14} />
              )}
              <Text
                style={{ color: t.colors.textMuted, fontSize: 11, fontWeight: "600" }}
              >
                {loadingStats ? "Sincronizando..." : "Atualizar"}
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
              <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>Sair</Text>
            </TouchableOpacity>
          </View>
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
            Visão geral
          </Text>
          <Text style={{ color: t.colors.textMuted, fontSize: 13 }}>
            Gerencie cursos, usuários cadastrados e currículos gerados pelo R.I.S.E.
          </Text>
          {statsError ? (
            <Text
              style={{
                color: "#ff6b6b",
                fontSize: 11,
                marginTop: 4,
              }}
            >
              {statsError}
            </Text>
          ) : null}
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: t.spacing.md,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "#111627",
              borderRadius: t.radius.lg,
              padding: t.spacing.md,
              borderWidth: 1,
              borderColor: t.colors.border,
              gap: 4,
            }}
          >
            <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>
              Cursos ativos
            </Text>
            <Text
              style={{
                color: t.colors.text,
                fontSize: 22,
                fontWeight: "800",
              }}
            >
              {loadingStats ? "…" : stats.courses}
            </Text>
            <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>
              Catalogados no app
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: "#111627",
              borderRadius: t.radius.lg,
              padding: t.spacing.md,
              borderWidth: 1,
              borderColor: t.colors.border,
              gap: 4,
            }}
          >
            <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>
              Usuários
            </Text>
            <Text
              style={{
                color: t.colors.text,
                fontSize: 22,
                fontWeight: "800",
              }}
            >
              {loadingStats ? "…" : stats.users}
            </Text>
            <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>
              Contas cadastradas
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: "#111627",
            borderRadius: t.radius.lg,
            padding: t.spacing.md,
            borderWidth: 1,
            borderColor: t.colors.border,
            gap: 4,
          }}
        >
          <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>
            Currículos gerados
          </Text>
          <Text
            style={{
              color: t.colors.text,
              fontSize: 22,
              fontWeight: "800",
            }}
          >
            {loadingStats ? "…" : stats.curricula}
          </Text>
          <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>
            PDFs criados pelos participantes
          </Text>
        </View>

        <View style={{ gap: t.spacing.md, marginTop: t.spacing.md }}>
          <TouchableOpacity
            onPress={() => nav.navigate("AdminCourses")}
            style={{
              backgroundColor: "#1A2035",
              borderRadius: t.radius.lg,
              padding: t.spacing.lg,
              borderWidth: 1,
              borderColor: t.colors.border,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <GraduationCap color={t.colors.primary} size={22} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: t.colors.text,
                  fontWeight: "800",
                  fontSize: 15,
                }}
              >
                Gerenciar cursos
              </Text>
              <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                Adicione, edite ou desative cursos que aparecem no app.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => nav.navigate("AdminUsers")}
            style={{
              backgroundColor: "#1A2035",
              borderRadius: t.radius.lg,
              padding: t.spacing.lg,
              borderWidth: 1,
              borderColor: t.colors.border,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <Users color={t.colors.primary} size={22} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: t.colors.text,
                  fontWeight: "800",
                  fontSize: 15,
                }}
              >
                Usuários cadastrados
              </Text>
              <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                Visualize quem está usando a plataforma e seus tipos de acesso.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => nav.navigate("AdminCurricula")}
            style={{
              backgroundColor: "#1A2035",
              borderRadius: t.radius.lg,
              padding: t.spacing.lg,
              borderWidth: 1,
              borderColor: t.colors.border,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <FileText color={t.colors.primary} size={22} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: t.colors.text,
                  fontWeight: "800",
                  fontSize: 15,
                }}
              >
                Currículos gerados
              </Text>
              <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                Acompanhe currículos criados e nível médio de completude.
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
