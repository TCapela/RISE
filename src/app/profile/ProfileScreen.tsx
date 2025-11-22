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
import { useProfile } from "../../store/profile.store";
import { useAuth } from "../../store/auth.store";
import {
  User,
  Pencil,
  Plus,
  X,
  LogOut,
  Mail,
  Briefcase,
  Phone,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react-native";
import ConfirmDialog from "../components/ConfirmDialog";
import { useNavigation } from "@react-navigation/native";

function Chip({
  label,
  onRemove,
  editing,
}: {
  label: string;
  onRemove?: () => void;
  editing?: boolean;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#1A2035",
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: t.colors.border,
        gap: 6,
      }}
    >
      <Text style={{ color: t.colors.text, fontSize: 12, fontWeight: "700" }}>
        {label}
      </Text>
      {editing && onRemove && (
        <TouchableOpacity onPress={onRemove} hitSlop={6}>
          <X color={t.colors.tabInactive} size={14} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function ProfileScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const nav = useNavigation<any>();

  const {
    profile,
    setField,
    addSkill,
    removeSkill,
    load,
    save,
    loading,
    saving,
    error,
  } = useProfile();
  const { signOut, user } = useAuth() as any;

  const [editing, setEditing] = useState(false);
  const [skill, setSkill] = useState("");
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    if (user?.id) load(user.id);
  }, [user?.id]);

  const initials = useMemo(
    () =>
      (profile.name || "")
        .split(" ")
        .filter(Boolean)
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
    [profile.name]
  );

  const completeness = useMemo(() => {
    let pts = 0;
    let total = 0;
    const bump = (ok: boolean, w: number) => {
      total += w;
      if (ok) pts += w;
    };
    bump(!!profile.name.trim(), 25);
    bump(!!profile.email.trim(), 25);
    bump(!!profile.role.trim(), 15);
    bump(!!profile.phone.trim(), 10);
    bump(profile.bio.trim().length >= 20, 15);
    bump(profile.skills.length >= 3, 10);
    const pct = total ? Math.round((pts / total) * 100) : 0;
    const label =
      pct >= 85 ? "Perfil completo" : pct >= 55 ? "Bom caminho" : "Vamos preencher";
    return { pct, label };
  }, [profile]);

  const handleToggleEditing = async () => {
    if (editing) {
      try {
        await save();
        setEditing(false);
      } catch (err: any) {
        Alert.alert("Erro", err?.message || "Não foi possível salvar.");
      }
      return;
    }
    setEditing(true);
  };

  const emailInvalid = editing && !profile.email.trim();

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
        <View
          style={{
            backgroundColor: t.colors.glass,
            borderRadius: t.radius.lg,
            padding: t.spacing.lg,
            borderWidth: 1,
            borderColor: t.colors.border,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
          }}
        >
          <View
            style={{
              width: 84,
              height: 84,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(78,242,195,0.12)",
              borderWidth: 1,
              borderColor: t.colors.border,
            }}
          >
            <Text
              style={{
                color: t.colors.primary,
                fontSize: 26,
                fontWeight: "900",
              }}
            >
              {initials || "?"}
            </Text>
          </View>

          <View style={{ flex: 1, gap: 2 }}>
            <Text
              style={{
                color: t.colors.text,
                fontSize: 20,
                fontWeight: "900",
              }}
              numberOfLines={1}
            >
              {profile.name || "Usuário R.I.S.E."}
            </Text>
            <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
              {profile.role || "Defina sua ocupação"}
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
              <View
                style={{
                  height: 6,
                  flex: 1,
                  backgroundColor: "#1A1E31",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: `${completeness.pct}%`,
                    height: "100%",
                    backgroundColor: t.colors.primary,
                  }}
                />
              </View>
              <Text style={{ color: t.colors.textMuted, fontSize: 11, fontWeight: "800" }}>
                {completeness.pct}%
              </Text>
            </View>
            <Text style={{ color: t.colors.textMuted, fontSize: 11, marginTop: 2 }}>
              {completeness.label}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleToggleEditing}
            disabled={loading || saving}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 999,
              backgroundColor: editing ? t.colors.primary : "#1A2035",
              borderWidth: 1,
              borderColor: editing ? t.colors.primary : t.colors.border,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {editing ? (
              <CheckCircle2 color="#0B0D13" size={16} />
            ) : (
              <Pencil color={t.colors.text} size={16} />
            )}
            <Text
              style={{
                color: editing ? "#0B0D13" : t.colors.text,
                fontWeight: "900",
                fontSize: 12,
              }}
            >
              {editing ? (saving ? "Salvando" : "Salvar") : "Editar"}
            </Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <ActivityIndicator color={t.colors.primary} />
            <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
              Carregando perfil...
            </Text>
          </View>
        )}

        {!!error && (
          <View
            style={{
              backgroundColor: "#ff4d4d20",
              borderColor: "#ff4d4d",
              borderWidth: 1,
              padding: 10,
              borderRadius: t.radius.md,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <AlertTriangle color="#ff4d4d" size={16} />
            <Text style={{ color: "#ff4d4d", fontWeight: "800", fontSize: 12, flex: 1 }}>
              {error}
            </Text>
          </View>
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
          <Text style={{ color: t.colors.text, fontSize: 16, fontWeight: "900" }}>
            Informações básicas
          </Text>

          <View style={{ gap: t.spacing.sm }}>
            <View
              style={{
                backgroundColor: t.colors.glass,
                borderRadius: t.radius.md,
                borderWidth: 1,
                borderColor: t.colors.border,
                padding: t.spacing.md,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <User color={t.colors.primary} />
              <TextInput
                editable={editing}
                value={profile.name}
                onChangeText={(v) => setField("name", v)}
                placeholder="Nome"
                placeholderTextColor={t.colors.tabInactive}
                style={{ flex: 1, color: t.colors.text, fontWeight: "700" }}
              />
            </View>

            <View
              style={{
                backgroundColor: t.colors.glass,
                borderRadius: t.radius.md,
                borderWidth: 1,
                borderColor: emailInvalid ? "#ff4d4d" : t.colors.border,
                padding: t.spacing.md,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Mail color={t.colors.primary} />
              <TextInput
                editable={editing}
                value={profile.email}
                onChangeText={(v) => setField("email", v)}
                keyboardType="email-address"
                placeholder="Email (obrigatório)"
                placeholderTextColor={t.colors.tabInactive}
                style={{ flex: 1, color: t.colors.text, fontWeight: "700" }}
              />
            </View>

            <View
              style={{
                backgroundColor: t.colors.glass,
                borderRadius: t.radius.md,
                borderWidth: 1,
                borderColor: t.colors.border,
                padding: t.spacing.md,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Phone color={t.colors.primary} />
              <TextInput
                editable={editing}
                value={profile.phone}
                onChangeText={(v) => setField("phone", v)}
                keyboardType="phone-pad"
                placeholder="Telefone"
                placeholderTextColor={t.colors.tabInactive}
                style={{ flex: 1, color: t.colors.text, fontWeight: "700" }}
              />
            </View>

            <View
              style={{
                backgroundColor: t.colors.glass,
                borderRadius: t.radius.md,
                borderWidth: 1,
                borderColor: t.colors.border,
                padding: t.spacing.md,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Briefcase color={t.colors.primary} />
              <TextInput
                editable={editing}
                value={profile.role}
                onChangeText={(v) => setField("role", v)}
                placeholder="Tipo de usuário / ocupação"
                placeholderTextColor={t.colors.tabInactive}
                style={{ flex: 1, color: t.colors.text, fontWeight: "700" }}
              />
            </View>
          </View>
        </View>

        <View
          style={{
            backgroundColor: t.colors.surfaceAlt,
            borderRadius: t.radius.lg,
            padding: t.spacing.lg,
            borderWidth: 1,
            borderColor: t.colors.border,
            gap: t.spacing.sm,
          }}
        >
          <Text style={{ color: t.colors.text, fontSize: 16, fontWeight: "900" }}>
            Sobre você
          </Text>

          <TextInput
            editable={editing}
            value={profile.bio}
            onChangeText={(v) => setField("bio", v)}
            placeholder="Escreva um resumo curto sobre você (DESC)"
            placeholderTextColor={t.colors.tabInactive}
            multiline
            style={{
              backgroundColor: t.colors.glass,
              color: t.colors.text,
              borderRadius: t.radius.md,
              borderWidth: 1,
              borderColor: t.colors.border,
              padding: t.spacing.md,
              minHeight: 90,
              textAlignVertical: "top",
            }}
          />
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
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ color: t.colors.text, fontSize: 16, fontWeight: "900" }}>
              Habilidades
            </Text>

            {editing && (
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TextInput
                  value={skill}
                  onChangeText={setSkill}
                  placeholder="Adicionar"
                  placeholderTextColor={t.colors.tabInactive}
                  style={{
                    width: 150,
                    height: 40,
                    backgroundColor: "#10152A",
                    color: t.colors.text,
                    borderRadius: t.radius.md,
                    borderWidth: 1,
                    borderColor: t.colors.border,
                    paddingHorizontal: 10,
                  }}
                />
                <TouchableOpacity
                  onPress={() => {
                    const v = skill.trim();
                    if (!v) return;
                    addSkill(v);
                    setSkill("");
                  }}
                  style={{
                    height: 40,
                    paddingHorizontal: 12,
                    borderRadius: t.radius.md,
                    backgroundColor: t.colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Plus color="#0B0D13" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <FlatList
            data={profile.skills}
            keyExtractor={(i) => i}
            scrollEnabled={false}
            numColumns={3}
            columnWrapperStyle={{ gap: t.spacing.sm }}
            ItemSeparatorComponent={() => <View style={{ height: t.spacing.sm }} />}
            renderItem={({ item }) => (
              <Chip
                label={item}
                editing={editing}
                onRemove={() => removeSkill(item)}
              />
            )}
            ListEmptyComponent={
              <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                Sem habilidades ainda.
              </Text>
            }
          />
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
            <Sparkles color={t.colors.accent} />
            <Text style={{ color: t.colors.text, fontSize: 15, fontWeight: "900" }}>
              Currículo inteligente
            </Text>
          </View>
          <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
            Monte e atualize seu currículo com base no seu perfil.
          </Text>

          <TouchableOpacity
            onPress={() => nav.navigate("Currículo")}
            style={{
              backgroundColor: "#1A2035",
              paddingVertical: 12,
              borderRadius: t.radius.md,
              alignItems: "center",
              borderWidth: 1,
              borderColor: t.colors.border,
            }}
          >
            <Text style={{ color: t.colors.text, fontWeight: "900" }}>
              Abrir currículo
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => setShowLogout(true)}
          style={{
            alignSelf: "center",
            backgroundColor: t.colors.primary,
            paddingHorizontal: 18,
            paddingVertical: 12,
            borderRadius: 999,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <LogOut color="#0B0D13" />
            <Text style={{ color: "#0B0D13", fontWeight: "900" }}>Sair</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <ConfirmDialog
        visible={showLogout}
        title="Sair"
        message="Deseja encerrar a sessão?"
        confirmText="Sair"
        cancelText="Cancelar"
        onCancel={() => setShowLogout(false)}
        onConfirm={() => {
          setShowLogout(false);
          signOut && signOut();
        }}
      />
    </SafeAreaView>
  );
}
