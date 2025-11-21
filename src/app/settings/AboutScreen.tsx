import { View, Text, TouchableOpacity, Linking, ScrollView } from "react-native";
import { useTheme } from "../../theme/theme";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Info,
  Globe,
  School,
  Target,
  HeartHandshake,
  Sparkles,
} from "lucide-react-native";

export default function AboutScreen() {
  const t = useTheme();
  const ins = useSafeAreaInsets();

  const open = (url: string) => Linking.openURL(url);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: t.spacing.lg,
          gap: t.spacing.lg,
          paddingBottom: ins.bottom + t.spacing.xxl + 80,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Info color={t.colors.primary} />
          <View>
            <Text
              style={{
                color: t.colors.text,
                fontSize: 20,
                fontWeight: "800",
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
              Sua bússola para requalificação e bem-estar
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
            gap: 6,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Sparkles color={t.colors.primary} />
            <Text
              style={{
                color: t.colors.text,
                fontWeight: "800",
              }}
            >
              Visão
            </Text>
          </View>
          <Text
            style={{
              color: t.colors.textMuted,
              marginTop: 2,
            }}
          >
            Preparar pessoas para o futuro do trabalho com educação
            personalizada, bem-estar e conexão com oportunidades reais.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: t.colors.glass,
            borderRadius: t.radius.lg,
            padding: t.spacing.lg,
            borderWidth: 1,
            borderColor: t.colors.border,
            gap: 10,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Target color={t.colors.primary} />
            <Text
              style={{
                color: t.colors.text,
                fontWeight: "800",
              }}
            >
              O que você encontra
            </Text>
          </View>
          <Text style={{ color: t.colors.textMuted }}>
            Recomendações de cursos FIAP, trilhas de requalificação, índice de
            empregabilidade, painel de bem-estar e um roadmap claro da sua
            jornada.
          </Text>

          <View
            style={{
              marginTop: 6,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            {["Trilhas de estudo", "Bem-estar", "Empregabilidade", "Currículo inteligente"].map(
              (tag) => (
                <View
                  key={tag}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: "#1A2035",
                    borderWidth: 1,
                    borderColor: t.colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: t.colors.textMuted,
                      fontSize: 11,
                    }}
                  >
                    {tag}
                  </Text>
                </View>
              )
            )}
          </View>
        </View>

        <View
          style={{
            backgroundColor: t.colors.glass,
            borderRadius: t.radius.lg,
            padding: t.spacing.lg,
            borderWidth: 1,
            borderColor: t.colors.border,
            gap: 10,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <School color={t.colors.primary} />
            <Text
              style={{
                color: t.colors.text,
                fontWeight: "800",
              }}
            >
              Conexão FIAP
            </Text>
          </View>
          <Text style={{ color: t.colors.textMuted }}>
            Integração com cursos reais de Graduação, Pós e Extensão. Os links
            direcionam para as páginas oficiais da FIAP.
          </Text>
          <TouchableOpacity
            onPress={() => open("https://www.fiap.com.br/")}
            style={{
              alignSelf: "flex-start",
              backgroundColor: t.colors.primary,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: t.radius.md,
              marginTop: 6,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Globe color="#0B0D13" size={16} />
            <Text
              style={{
                color: "#0B0D13",
                fontWeight: "800",
              }}
            >
              Visitar FIAP
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            backgroundColor: t.colors.surfaceAlt,
            borderRadius: t.radius.lg,
            padding: t.spacing.lg,
            borderWidth: 1,
            borderColor: t.colors.border,
            gap: 10,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <HeartHandshake color={t.colors.primary} />
            <Text
              style={{
                color: t.colors.text,
                fontWeight: "800",
              }}
            >
              ODS e impacto
            </Text>
          </View>
          <Text style={{ color: t.colors.textMuted }}>
            ODS 4, 8, 9 e 10 guiando o desenvolvimento: educação de qualidade,
            trabalho decente, inovação e redução de desigualdades.
          </Text>

          <View
            style={{
              marginTop: 6,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            {["ODS 4", "ODS 8", "ODS 9", "ODS 10"].map((item) => (
              <View
                key={item}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  backgroundColor: "#1A2035",
                  borderWidth: 1,
                  borderColor: t.colors.border,
                }}
              >
                <Text
                  style={{
                    color: t.colors.textMuted,
                    fontSize: 11,
                  }}
                >
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>

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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Globe color={t.colors.primary} />
            <Text
              style={{
                color: t.colors.text,
                fontWeight: "800",
              }}
            >
              Versão e créditos
            </Text>
          </View>
          <Text
            style={{
              color: t.colors.textMuted,
              fontSize: 12,
            }}
          >
            Versão 0.1.0 • GS Mobile
          </Text>
          <Text
            style={{
              color: t.colors.textMuted,
              fontSize: 12,
            }}
          >
            Design e desenvolvimento: você + equipe FIAP, construindo um
            protótipo que poderia virar produto real.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
