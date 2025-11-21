import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, Image } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../theme/theme";
import { useAuth } from "../../store/auth.store";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Mail, Lock, Shield, ArrowLeft } from "lucide-react-native";

const logo = require("../../../assets/logo.png");

export default function AdminLoginScreen() {
  const t = useTheme();
  const ins = useSafeAreaInsets();
  const nav = useNavigation<any>();
  const { signInAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const can = email.length > 3 && pass.length >= 4;

  const onLogin = async () => {
    if (!can) return;
    await signInAdmin(email, pass);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.colors.background }}>
      <LinearGradient
        colors={["#0D1323", "#311B92", "#0B0D13"]}
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
          <TouchableOpacity
            onPress={() => nav.navigate("Login")}
            style={{ position: "absolute", top: ins.top + 16, left: 16, flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <ArrowLeft color={t.colors.textMuted} size={18} />
            <Text style={{ color: t.colors.textMuted, fontSize: 12 }}>Login de estudante</Text>
          </TouchableOpacity>

          <Image source={logo} style={{ width: 110, height: 110 }} resizeMode="contain" />
          <View style={{ width: "100%", gap: 6, alignItems: "center" }}>
            <Shield color={t.colors.primary} size={26} />
            <Text style={{ color: t.colors.text, fontSize: 24, fontWeight: "900" }}>
              Acesso administrativo
            </Text>
            <Text style={{ color: t.colors.textMuted, fontSize: 13 }}>
              Restrito à equipe autorizada
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
              <Mail color={t.colors.tabInactive} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email institucional"
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
            <Shield color="#0B0D13" />
            <Text style={{ color: "#0B0D13", fontWeight: "900" }}>Entrar como admin</Text>
          </TouchableOpacity>

          <Text style={{ color: t.colors.textMuted, fontSize: 11, textAlign: "center" }}>
            Caso não reconheça esta tela, volte para o login de estudante.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
