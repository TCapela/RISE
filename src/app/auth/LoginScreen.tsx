import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, Image } from "react-native";
import { useTheme } from "../../theme/theme";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../store/auth.store";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Mail, Lock, LogIn } from "lucide-react-native";

const logo = require("../../../assets/logo.png");

export default function LoginScreen() {
  const t = useTheme();
  const ins = useSafeAreaInsets();
  const nav = useNavigation<any>();
  const { signIn, signInAdmin } = useAuth() as any;
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const can = email.length > 3 && pass.length >= 4;

const onLogin = async () => {
  if (!can) return;

  if (email.trim().toLowerCase() === "admin" && pass === "123456") {
    await signInAdmin("admin@rise.local", pass);
    return;
  }

  await signIn(email.trim(), pass);
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
          <Image source={logo} style={{ width: 120, height: 120 }} resizeMode="contain" />
          <View style={{ width: "100%", gap: 6 }}>
            <Text style={{ color: t.colors.textMuted }}>Bem-vindo ao</Text>
            <Text style={{ color: t.colors.text, fontSize: 28, fontWeight: "900" }}>R.I.S.E.</Text>
            <Text style={{ color: t.colors.textMuted }}>Sua jornada de requalificação começa aqui</Text>
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
              <Mail color={t.colors.tabInactive} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor={t.colors.tabInactive}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{ flex: 1, color: t.colors.text, height: 48, marginLeft: 8 }}
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
                style={{ flex: 1, color: t.colors.text, height: 48, marginLeft: 8 }}
              />
            </View>
            <TouchableOpacity style={{ alignSelf: "flex-end", paddingVertical: 6 }}>
              <Text style={{ color: t.colors.accent, fontWeight: "700" }}>Esqueci a senha</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={onLogin}
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
            }}
          >
            <LogIn color="#0B0D13" />
            <Text style={{ color: "#0B0D13", fontWeight: "900" }}>Entrar</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
            <Text style={{ color: t.colors.textMuted }}>Novo por aqui?</Text>
            <TouchableOpacity onPress={() => nav.navigate("Signup")}>
              <Text style={{ color: t.colors.primary, fontWeight: "800" }}>Criar conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
