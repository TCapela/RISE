import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { useTheme } from "../../theme/theme";
import {
  Info,
  Globe,
  School,
  Target,
  HeartHandshake,
  Sparkles,
  GitCommitHorizontal,
  ArrowLeft,
} from "lucide-react-native";

export default function ConfigScreen({ navigation }: any) {
  const t = useTheme();
  const ins = useSafeAreaInsets();
  const open = (url: string) => Linking.openURL(url);

  const commitHash =
    (Constants.expoConfig as any)?.extra?.commitHash ??
    (Constants.manifest as any)?.extra?.commitHash ??
    "dev";
  const shortHash = commitHash === "dev" ? "dev" : commitHash.slice(0, 7);

  const Card = ({ children }: { children: React.ReactNode }) => (
    <View
      style={{
        backgroundColor: t.colors.glass,
        borderRadius: t.radius.lg,
        padding: t.spacing.lg,
        borderWidth: 1,
        borderColor: t.colors.border,
        gap: 8,
      }}
    >
      {children}
    </View>
  );

  const Tag = ({ label }: { label: string }) => (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: "#1A2035",
        borderWidth: 1,
        borderColor: t.colors.border,
      }}
    >
      <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: t.spacing.lg,
          gap: t.spacing.lg,
          paddingBottom: ins.bottom + 100,
          maxWidth: 940,
          alignSelf: "center",
          width: "100%",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginBottom: 6,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: t.colors.surfaceAlt,
              borderWidth: 1,
              borderColor: t.colors.border,
            }}
          >
            <ArrowLeft color={t.colors.text} size={20} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: t.colors.text,
                fontSize: 22,
                fontWeight: "900",
              }}
            >
              Sobre o R.I.S.E.
            </Text>
            <Text
              style={{
                color: t.colors.textMuted,
                fontSize: 12,
                marginTop: 2,
              }}
            >
              Requalificação • Inclusão • Sustentabilidade • Empregabilidade
            </Text>
          </View>
        </View>

        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Sparkles color={t.colors.primary} />
            <Text style={{ color: t.colors.text, fontWeight: "900" }}>Visão</Text>
          </View>
          <Text style={{ color: t.colors.textMuted }}>
            Tornar a reintegração profissional acessível, inteligente e focada no futuro.
          </Text>
        </Card>

        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Target color={t.colors.primary} />
            <Text style={{ color: t.colors.text, fontWeight: "900" }}>
              O que você encontra
            </Text>
          </View>

          <Text style={{ color: t.colors.textMuted }}>
            Trilhas, bem-estar, IA aplicada, currículo inteligente e conexão com oportunidades.
          </Text>

          <View
            style={{
              flexDirection: "row",
              gap: 6,
              flexWrap: "wrap",
              marginTop: 8,
            }}
          >
            {["Trilhas", "Bem-estar", "Empregabilidade", "Currículo IA"].map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </View>
        </Card>

        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <School color={t.colors.primary} />
            <Text style={{ color: t.colors.text, fontWeight: "900" }}>
              Conexão FIAP
            </Text>
          </View>

          <Text style={{ color: t.colors.textMuted }}>
            Conteúdos alinhados com o ecossistema de inovação e educação FIAP.
          </Text>

          <TouchableOpacity
            onPress={() => open("https://www.fiap.com.br/")}
            style={{
              marginTop: 8,
              alignSelf: "flex-start",
              backgroundColor: t.colors.primary,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: t.radius.md,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Globe color="#0B0D13" size={16} />
            <Text style={{ color: "#0B0D13", fontWeight: "900" }}>Visitar FIAP</Text>
          </TouchableOpacity>
        </Card>

        <Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <HeartHandshake color={t.colors.primary} />
            <Text style={{ color: t.colors.text, fontWeight: "900" }}>
              ODS e impacto
            </Text>
          </View>

          <Text style={{ color: t.colors.textMuted }}>
            Alinhado às ODS 4, 8, 9 e 10 para impacto social real.
          </Text>

          <View
            style={{
              flexDirection: "row",
              gap: 6,
              flexWrap: "wrap",
              marginTop: 8,
            }}
          >
            {["ODS 4", "ODS 8", "ODS 9", "ODS 10"].map((o) => (
              <Tag key={o} label={o} />
            ))}
          </View>
        </Card>

        <Card>
          <Text style={{ color: t.colors.text, fontWeight: "900" }}>
            Versão & Créditos
          </Text>

          <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
            Design e desenvolvimento:
          </Text>
          <Text style={{ color: t.colors.text, fontWeight: "800" }}>
            Tiago Capela • RM 558021
          </Text>
          <Text style={{ color: t.colors.text, fontWeight: "800" }}>
            Raphaella Tatto • RM 554983
          </Text>

          <View
            style={{
              marginTop: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <GitCommitHorizontal color={t.colors.textMuted} size={14} />
            <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
              Commit: {shortHash}
            </Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
