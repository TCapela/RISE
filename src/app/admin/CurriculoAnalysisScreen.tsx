import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "../../theme/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Sparkles, CheckCircle, BookOpen, MessageSquare } from "lucide-react-native";

export default function CurriculoAnalysisScreen({ navigation, route }: any) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { analysis } = route.params;

  const Card = ({ children }: { children: React.ReactNode }) => (
    <View
      style={{
        backgroundColor: t.colors.glass,
        borderRadius: t.radius.lg,
        borderWidth: 1,
        borderColor: t.colors.border,
        padding: t.spacing.lg,
        gap: 10,
      }}
    >
      {children}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      <View
        style={{
          paddingTop: insets.top + 6,
          paddingHorizontal: t.spacing.lg,
          paddingBottom: 10,
          backgroundColor: t.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: t.colors.border,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={t.colors.text} />
        </TouchableOpacity>
        <Text style={{ color: t.colors.text, fontSize: 18, fontWeight: "900" }}>
          Análise IA
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: t.spacing.lg,
          gap: t.spacing.lg,
          paddingBottom: insets.bottom + 140,
          maxWidth: 940,
          alignSelf: "center",
          width: "100%",
        }}
      >
        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Sparkles color={t.colors.primary} />
            <Text style={{ color: t.colors.text, fontSize: 16, fontWeight: "900" }}>
              Score de empregabilidade
            </Text>
          </View>
          <Text style={{ color: t.colors.text, fontSize: 34, fontWeight: "900" }}>
            {analysis.score}%
          </Text>
          <Text style={{ color: t.colors.textMuted }}>
            Avaliação baseada no seu currículo e nível de completude.
          </Text>
        </Card>

        <Card>
          <Text style={{ color: t.colors.text, fontWeight: "900" }}>
            Resumo sugerido
          </Text>
          <Text style={{ color: t.colors.text }}>
            {analysis.summarySuggested}
          </Text>
        </Card>

        <Card>
          <Text style={{ color: t.colors.text, fontWeight: "900" }}>
            Lacunas prioritárias
          </Text>
          <View style={{ gap: 6 }}>
            {(analysis.gaps || []).map((g: string, i: number) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", gap: 6 }}>
                <CheckCircle color={t.colors.primary} size={14} style={{ marginTop: 2 }} />
                <Text style={{ color: t.colors.textMuted, flex: 1 }}>{g}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <BookOpen color={t.colors.accent} />
            <Text style={{ color: t.colors.text, fontWeight: "900" }}>
              Cursos recomendados
            </Text>
          </View>

          <View style={{ gap: 10 }}>
            {(analysis.recommendedCourses || []).map((c: any, i: number) => (
              <View key={i} style={{ gap: 4 }}>
                <Text style={{ color: t.colors.primary, fontWeight: "900" }}>
                  Curso #{c.idCurso}
                </Text>
                <Text style={{ color: t.colors.textMuted }}>{c.reason}</Text>
              </View>
            ))}
          </View>
        </Card>

        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <MessageSquare color={t.colors.primary} />
            <Text style={{ color: t.colors.text, fontWeight: "900" }}>
              Preparação para entrevista
            </Text>
          </View>

          <View style={{ gap: 10 }}>
            {(analysis.interviewPrep?.questions || []).map((q: string, i: number) => (
              <View key={i} style={{ gap: 4 }}>
                <Text style={{ color: t.colors.text, fontWeight: "900" }}>
                  {i + 1}. {q}
                </Text>
                <Text style={{ color: t.colors.textMuted }}>
                  {analysis.interviewPrep?.answersDraft?.[i] || ""}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}
