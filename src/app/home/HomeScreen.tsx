import { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
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
} from "lucide-react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useProfile } from "../../store/profile.store";

const logo = require("../../../assets/logo.png");

export default function HomeScreen() {
  const t = useTheme();
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const [moodChecked, setMoodChecked] = useState(false);

  const { completenessLabel, completenessColor } = useMemo(() => {
    let pts = 0;
    let total = 0;

    const bump = (ok: boolean, weight: number) => {
      total += weight;
      if (ok) pts += weight;
    };

    bump(!!profile.name?.trim(), 20);
    bump(!!profile.email?.trim(), 20);
    bump(profile.bio && profile.bio.trim().length >= 40, 30);

    const skills = profile.skills?.length || 0;
    const skillsScore = Math.min(skills, 6) * 5;
    pts += skillsScore;
    total += 30;

    const pct = total ? Math.round((pts / total) * 100) : 0;

    if (pct >= 80) return { completenessLabel: "Pronto", completenessColor: t.colors.primary };
    if (pct >= 50) return { completenessLabel: "Quase lá", completenessColor: t.colors.accent };
    return { completenessLabel: "Em construção", completenessColor: t.colors.textMuted };
  }, [profile, t.colors.primary, t.colors.accent, t.colors.textMuted]);

  const suggestions = useMemo(() => {
    const list: string[] = [];

    if (!profile.bio || profile.bio.trim().length < 40) {
      list.push("Escreva um resumo de 2–3 frases no currículo explicando quem você é e o que busca.");
    }

    if ((profile.skills?.length || 0) < 3) {
      list.push("Adicione ao menos 3 habilidades que representem bem sua experiência.");
    }

    if (!list.length) {
      list.push("Revise seu currículo e atualize conquistas recentes.");
    }

    return list.slice(0, 3);
  }, [profile.bio, profile.skills]);

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
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: insets.top ? 0 : t.spacing.sm,
          }}
        >
          <TouchableOpacity
            onPress={() => nav.navigate("Config")}
            style={{ padding: 6 }}
          >
            <Settings color={t.colors.tabInactive} />
          </TouchableOpacity>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Image source={logo} style={{ width: 22, height: 22 }} resizeMode="contain" />
            <View>
              <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>
                Bem-vindo de volta
              </Text>
              <Text style={{ color: t.colors.text, fontSize: 18, fontWeight: "700" }}>
                {profile.name || "Minha Jornada"}
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => nav.navigate("Perfil")} style={{ padding: 6 }}>
            <User color={t.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* BLOCO DE ATAJOS */}
        <View
          style={{
            backgroundColor: t.colors.glass,
            borderRadius: t.radius.lg,
            padding: t.spacing.lg,
            borderWidth: 1,
            borderColor: t.colors.border,
            gap: t.spacing.md,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Target color={t.colors.primary} />
            <View>
              <Text style={{ color: t.colors.text, fontSize: 16, fontWeight: "800" }}>
                Sua jornada hoje
              </Text>
              <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                Atalhos para currículo e trilhas
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: t.spacing.sm }}>
            <TouchableOpacity
              onPress={() => nav.navigate("Currículo")}
              style={{
                flex: 1,
                backgroundColor: "#1A2035",
                borderRadius: t.radius.md,
                paddingVertical: 10,
                paddingHorizontal: 10,
                borderWidth: 1,
                borderColor: t.colors.border,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <FileText color={t.colors.primary} size={18} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.colors.text, fontWeight: "700", fontSize: 13 }}>
                  Currículo Inteligente
                </Text>
                <Text style={{ color: completenessColor, fontSize: 11 }}>
                  {completenessLabel}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => nav.navigate("Trilhas")}
              style={{
                flex: 1,
                backgroundColor: "#1A2035",
                borderRadius: t.radius.md,
                paddingVertical: 10,
                paddingHorizontal: 10,
                borderWidth: 1,
                borderColor: t.colors.border,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <ListChecks color={t.colors.accent} size={18} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.colors.text, fontWeight: "700", fontSize: 13 }}>
                  Trilhas de Estudo
                </Text>
                <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>
                  Organize sua jornada
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              setMoodChecked(true);
              nav.navigate("Bem-Estar");
            }}
            style={{
              marginTop: 4,
              backgroundColor: "#10152A",
              borderRadius: t.radius.md,
              paddingVertical: 10,
              paddingHorizontal: 10,
              borderWidth: 1,
              borderColor: t.colors.border,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <HeartPulse
              color={moodChecked ? t.colors.accent : t.colors.primary}
              size={18}
            />
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.colors.text, fontWeight: "700", fontSize: 13 }}>
                Bem-estar
              </Text>
              <Text style={{ color: t.colors.textMuted, fontSize: 11 }}>
                {moodChecked ? "Check-in feito hoje" : "Como você está se sentindo?"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* CURRÍCULO */}
        <View
          style={{
            backgroundColor: t.colors.surfaceAlt,
            borderRadius: t.radius.lg,
            padding: t.spacing.lg,
            gap: t.spacing.md,
            borderWidth: 1,
            borderColor: t.colors.border,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <FileText color={t.colors.primary} />
            <Text style={{ color: t.colors.text, fontSize: 16, fontWeight: "800" }}>
              Currículo Inteligente
            </Text>
          </View>

          <View style={{ gap: 4 }}>
            <Text style={{ color: t.colors.text, fontWeight: "700" }}>
              {profile.name || "Usuário R.I.S.E."}
            </Text>

            {!!profile.email && (
              <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                {profile.email}
              </Text>
            )}

            <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
              <View
                style={{
                  backgroundColor: "#1A2035",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: t.radius.pill,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                }}
              >
                <Text style={{ color: t.colors.primary, fontWeight: "800", fontSize: 11 }}>
                  {profile.skills.length} habilidades
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: "#1A2035",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: t.radius.pill,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                }}
              >
                <Text style={{ color: completenessColor, fontWeight: "800", fontSize: 11 }}>
                  {completenessLabel}
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => nav.navigate("Currículo")}
            style={{
              flex: 1,
              backgroundColor: t.colors.primary,
              paddingVertical: 12,
              borderRadius: t.radius.md,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <FileText color="#0B0D13" />
            <Text style={{ color: "#0B0D13", fontWeight: "900" }}>
              Abrir currículo
            </Text>
          </TouchableOpacity>
        </View>

        {/* SUGESTÕES */}
        <View
          style={{
            backgroundColor: t.colors.surfaceAlt,
            borderRadius: t.radius.lg,
            padding: t.spacing.lg,
            gap: t.spacing.sm,
            borderWidth: 1,
            borderColor: t.colors.border,
          }}
        >
          <Text style={{ color: t.colors.text, fontSize: 16, fontWeight: "800" }}>
            Próximos passos sugeridos
          </Text>

          {suggestions.map((s, idx) => (
            <View
              key={idx}
              style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: t.colors.primary,
                  marginTop: 6,
                }}
              />
              <Text style={{ color: t.colors.textMuted, fontSize: 13, flex: 1 }}>
                {s}
              </Text>
            </View>
          ))}
        </View>

        {/* EXPLORAR CURSOS */}
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
          <Text style={{ color: t.colors.text, fontSize: 16, fontWeight: "800" }}>
            Descubra novos cursos
          </Text>
          <Text style={{ color: t.colors.textMuted, fontSize: 13 }}>
            Explore cursos FIAP e encontre caminhos que combinam com você.
          </Text>

          <TouchableOpacity
            onPress={() => nav.navigate("Cursos")}
            style={{
              marginTop: 4,
              backgroundColor: "#1A2035",
              borderRadius: t.radius.md,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: t.colors.border,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Sparkles color={t.colors.accent} />
            <Text style={{ color: t.colors.text, fontWeight: "700" }}>
              Ver cursos
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
