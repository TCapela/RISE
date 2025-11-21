import { useEffect, useState } from "react";
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
  MapPin,
} from "lucide-react-native";
import ConfirmDialog from "../components/ConfirmDialog";

export default function ProfileScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, setField, addSkill, removeSkill, load, save, loading, saving, error } =
    useProfile();
  const { signOut } = useAuth() as any;

  const [editing, setEditing] = useState(false);
  const [skill, setSkill] = useState("");
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  const initials = (profile.name || "")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleToggleEditing = async () => {
    if (editing) {
      try {
        await save();
      } catch (err: any) {
        Alert.alert("Erro", err?.message || "Não foi possível salvar o perfil.");
      }
    }
    setEditing((v) => !v);
  };

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
        <View style={{ alignItems: "center", gap: t.spacing.sm }}>
          <View
            style={{
              width: 96,
              height: 96,
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
                fontSize: 28,
                fontWeight: "900",
              }}
            >
              {initials || "?"}
            </Text>
          </View>
          <Text
            style={{
              color: t.colors.text,
              fontSize: 20,
              fontWeight: "800",
            }}
          >
            {profile.name || "Usuário R.I.S.E."}
          </Text>
          <Text style={{ color: t.colors.textMuted }}>
            {profile.role || "Defina sua ocupação"}
          </Text>

          <TouchableOpacity
            onPress={handleToggleEditing}
            style={{
              marginTop: t.spacing.sm,
              backgroundColor: t.colors.glass,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: t.radius.pill,
              borderWidth: 1,
              borderColor: t.colors.border,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
            disabled={loading || saving}
          >
            <Pencil color={t.colors.text} size={16} />
            <Text style={{ color: t.colors.text, fontWeight: "700" }}>
              {editing ? (saving ? "Salvando..." : "Concluído") : "Editar"}
            </Text>
          </TouchableOpacity>

          {loading && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginTop: 6,
              }}
            >
              <ActivityIndicator color={t.colors.primary} />
              <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>
                Carregando dados do perfil...
              </Text>
            </View>
          )}

          {!!error && (
            <Text style={{ color: "#FF6B6B", fontSize: 12, marginTop: 4 }}>
              {error}
            </Text>
          )}
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
          <Text
            style={{
              color: t.colors.text,
              fontSize: 16,
              fontWeight: "800",
            }}
          >
            Informações
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
                style={{ flex: 1, color: t.colors.text }}
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
              <Mail color={t.colors.primary} />
              <TextInput
                editable={editing}
                value={profile.email}
                onChangeText={(v) => setField("email", v)}
                keyboardType="email-address"
                placeholder="Email"
                placeholderTextColor={t.colors.tabInactive}
                style={{ flex: 1, color: t.colors.text }}
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
                value={profile.phone || ""}
                onChangeText={(v) => setField("phone", v)}
                keyboardType="phone-pad"
                placeholder="Telefone"
                placeholderTextColor={t.colors.tabInactive}
                style={{ flex: 1, color: t.colors.text }}
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
              <MapPin color={t.colors.primary} />
              <TextInput
                editable={editing}
                value={profile.location || ""}
                onChangeText={(v) => setField("location", v)}
                placeholder="Localização (cidade, estado)"
                placeholderTextColor={t.colors.tabInactive}
                style={{ flex: 1, color: t.colors.text }}
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
                placeholder="Ocupação"
                placeholderTextColor={t.colors.tabInactive}
                style={{ flex: 1, color: t.colors.text }}
              />
            </View>

            <TextInput
              editable={editing}
              value={profile.bio ?? ""}
              onChangeText={(v) => setField("bio", v)}
              placeholder="Bio"
              placeholderTextColor={t.colors.tabInactive}
              multiline
              style={{
                backgroundColor: t.colors.glass,
                color: t.colors.text,
                borderRadius: t.radius.md,
                borderWidth: 1,
                borderColor: t.colors.border,
                padding: t.spacing.md,
              }}
            />
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                color: t.colors.text,
                fontSize: 16,
                fontWeight: "800",
              }}
            >
              Habilidades
            </Text>

            {editing && (
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TextInput
                  value={skill}
                  onChangeText={setSkill}
                  placeholder="Adicionar habilidade"
                  placeholderTextColor={t.colors.tabInactive}
                  style={{
                    width: 180,
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
            ItemSeparatorComponent={() => (
              <View style={{ height: t.spacing.sm }} />
            )}
            renderItem={({ item }) => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#1A2035",
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  borderRadius: t.radius.pill,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                  marginRight: t.spacing.sm,
                  marginBottom: t.spacing.sm,
                }}
              >
                <Text style={{ color: t.colors.text }}>{item}</Text>
                {editing && (
                  <TouchableOpacity
                    onPress={() => removeSkill(item)}
                    style={{ marginLeft: 8 }}
                  >
                    <X color={t.colors.tabInactive} size={16} />
                  </TouchableOpacity>
                )}
              </View>
            )}
            ListEmptyComponent={
              <Text style={{ color: t.colors.textMuted }}>
                Adicione suas habilidades
              </Text>
            }
          />
        </View>

        <TouchableOpacity
          onPress={() => setShowLogout(true)}
          style={{
            alignSelf: "center",
            backgroundColor: t.colors.primary,
            paddingHorizontal: 18,
            paddingVertical: 12,
            borderRadius: t.radius.pill,
          }}
        >
          <View
            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          >
            <LogOut color="#0B0D13" />
            <Text style={{ color: "#0B0D13", fontWeight: "800" }}>Sair</Text>
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
