import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { useTheme } from "../../theme/theme";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../store/auth.store";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { User, Mail, Lock, UserPlus } from "lucide-react-native";
import { createUser } from "../../services/user.service";

const logo = require("../../../assets/logo.png");

export default function SignupScreen() {
  const t = useTheme();
  const ins = useSafeAreaInsets();
  const nav = useNavigation<any>();
  const { signIn } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const can =
    name.trim().length >= 2 &&
    email.includes("@") &&
    pass.length >= 4 &&
    !loading;

  const onSignup = async () => {
    if (!can) return;
    try {
      setLoading(true);
      await createUser({
        name: name.trim(),
        email: email.trim(),
        password: pass,
        type: null,
      });
      if (signIn) {
        await signIn(email.trim(), pass);
      } else {
        Alert.alert("Sucesso", "Conta criada com sucesso. Faça login para continuar.");
        nav.navigate("Login");
      }
    } catch {
      Alert.alert("Erro", "Não foi possível criar sua conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <LinearGradient
        colors={["#0D1323", "#16213E", "#0B0D13"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={{
            flex: 1,
            padding: t.spacing.lg,
            justifyContent: "center",
            gap: t.spacing.lg,
            paddingBottom: ins.bottom + 40,
            alignItems: "center",
          }}
        >
          <Image
            source={logo}
            style={{ width: 120, height: 120 }}
            resizeMode="contain"
          />

          <View style={{ width: "100%" }}>
            <Text
              style={{
                color: t.colors.text,
                fontSize: 26,
                fontWeight: "900",
              }}
            >
              Criar conta
            </Text>
            <Text style={{ color: t.colors.textMuted }}>
              Leva menos de um minuto
            </Text>
          </View>

          <View style={{ width: "100%", gap: t.spacing.sm }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#10152A",
                borderWidth: 1,
                borderColor: t.colors.border,
                borderRadius: t.radius.md,
                paddingHorizontal: 12,
              }}
            >
              <User color={t.colors.tabInactive} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Nome"
                placeholderTextColor={t.colors.tabInactive}
                style={{
                  flex: 1,
                  color: t.colors.text,
                  height: 48,
                  marginLeft: 8,
                }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#10152A",
                borderWidth: 1,
                borderColor: t.colors.border,
                borderRadius: t.radius.md,
                paddingHorizontal: 12,
              }}
            >
              <Mail color={t.colors.tabInactive} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor={t.colors.tabInactive}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{
                  flex: 1,
                  color: t.colors.text,
                  height: 48,
                  marginLeft: 8,
                }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#10152A",
                borderWidth: 1,
                borderColor: t.colors.border,
                borderRadius: t.radius.md,
                paddingHorizontal: 12,
              }}
            >
              <Lock color={t.colors.tabInactive} />
              <TextInput
                value={pass}
                onChangeText={setPass}
                placeholder="Senha"
                placeholderTextColor={t.colors.tabInactive}
                secureTextEntry
                style={{
                  flex: 1,
                  color: t.colors.text,
                  height: 48,
                  marginLeft: 8,
                }}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={onSignup}
            disabled={!can}
            style={{
              width: "100%",
              height: 52,
              borderRadius: t.radius.pill,
              backgroundColor: can ? t.colors.primary : t.colors.border,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              opacity: loading ? 0.8 : 1,
            }}
          >
            <UserPlus color="#0B0D13" />
            <Text style={{ color: "#0B0D13", fontWeight: "900" }}>
              {loading ? "Cadastrando..." : "Cadastrar"}
            </Text>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Text style={{ color: t.colors.textMuted }}>Já tem conta?</Text>
            <TouchableOpacity onPress={() => nav.navigate("Login")}>
              <Text
                style={{
                  color: t.colors.primary,
                  fontWeight: "800",
                }}
              >
                Entrar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
