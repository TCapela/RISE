import { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../theme/theme";
import { FileText } from "lucide-react-native";
import { getCurriculaAdmin, AdminCurriculumSummary } from "../../services/admin.curricula.service";

export default function AdminCurriculaScreen() {
  const t = useTheme();
  const [list, setList] = useState<AdminCurriculumSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await getCurriculaAdmin();
      setList(data.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <View style={{ flex: 1, padding: t.spacing.lg, gap: t.spacing.lg }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <FileText color={t.colors.primary} />
          <View>
            <Text style={{ color: t.colors.text, fontSize: 18, fontWeight: "800" }}>
              Currículos gerados
            </Text>
            <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
              Lista baseada nos currículos salvos pelos usuários.
            </Text>
          </View>
        </View>

        {loading && (
          <View style={{ paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <ActivityIndicator color={t.colors.primary} />
            <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
              Carregando currículos...
            </Text>
          </View>
        )}

        <FlatList
          data={list}
          keyExtractor={(i) => i.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: t.colors.glass,
                borderRadius: t.radius.md,
                borderWidth: 1,
                borderColor: t.colors.border,
                padding: t.spacing.md,
                gap: 4,
              }}
            >
              <Text style={{ color: t.colors.text, fontWeight: "700" }}>
                {item.ownerName}
              </Text>
              {!!item.ownerEmail && (
                <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                  {item.ownerEmail}
                </Text>
              )}
              <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                Usuário #{item.ownerId}
              </Text>
              {item.updatedAt ? (
                <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                  Atualizado em {item.updatedAt}
                </Text>
              ) : null}
              <View
                style={{
                  marginTop: 6,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: "#1A1E31",
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      width: `${item.completeness}%`,
                      height: "100%",
                      backgroundColor: t.colors.primary,
                    }}
                  />
                </View>
                <Text
                  style={{
                    color: t.colors.text,
                    fontSize: 12,
                    fontWeight: "700",
                    width: 40,
                    textAlign: "right",
                  }}
                >
                  {item.completeness}%
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            !loading ? (
              <View style={{ padding: 24, alignItems: "center" }}>
                <Text style={{ color: t.colors.textMuted, fontSize: 13 }}>
                  Nenhum currículo registrado ainda.
                </Text>
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}
