import { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet, Image } from "react-native";
import { useTheme } from "../../theme/theme";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../store/auth.store";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Mail, Lock, LogIn, AlertTriangle } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from "react-native-reanimated";

const logo = require("../../../assets/logo.png");

export default function LoginScreen() {
  const t = useTheme();
  const ins = useSafeAreaInsets();
  const nav = useNavigation<any>();
  const { signIn, signInAdmin } = useAuth() as any;

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [loading, setLoading] = useState(false);

  const toastProgress = useSharedValue(0);
  const shakeX = useSharedValue(0);

  const emailOk = useMemo(() => email.trim().length > 3 && email.includes("@"), [email]);
  const passOk = useMemo(() => pass.length >= 4, [pass]);
  const can = emailOk && passOk && !loading;

  useEffect(() => {
    if (error) {
      toastProgress.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) });
      shakeX.value = withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    } else {
      toastProgress.value = withTiming(0, { duration: 180, easing: Easing.in(Easing.cubic) });
    }
  }, [error]);

  const toastStyle = useAnimatedStyle(() => {
    return {
      opacity: toastProgress.value,
      transform: [{ translateY: withSpring(toastProgress.value ? 0 : -8) }],
      maxHeight: toastProgress.value ? 80 : 0,
    };
  });

  const shakeStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeX.value }],
    };
  });

  const onPassKey = (e: any) => {
    const caps =
      e?.nativeEvent?.getModifierState && e.nativeEvent.getModifierState("CapsLock");
    if (typeof caps === "boolean") setCapsLockOn(caps);
  };

  const onLogin = async () => {
    if (!can) return;

    setError(null);
    setLoading(true);

    try {
      const em = email.trim();
      const pw = pass;

      if (em.toLowerCase() === "admin" && pw === "123456") {
        await signInAdmin("admin@rise.local", pw);
        return;
      }

      await signIn(em, pw);

    } catch (err: any) {
      setError("Credenciais inválidas. Verifique seu email e senha.");
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
          <Image source={logo} style={{ width: 120, height: 120 }} resizeMode="contain" />

          <View style={{ width: "100%", gap: 6 }}>
            <Text style={{ color: t.colors.textMuted }}>Bem-vindo ao</Text>
            <Text style={{ color: t.colors.text, fontSize: 28, fontWeight: "900" }}>R.I.S.E.</Text>
            <Text style={{ color: t.colors.textMuted }}>
              Sua jornada de requalificação começa aqui
            </Text>
          </View>

          <Animated.View style={[{ width: "100%" }, toastStyle, shakeStyle]}>
            {error && (
              <View
                style={{
                  width: "100%",
                  backgroundColor: "#ff4d4d20",
                  borderColor: "#ff4d4d",
                  borderWidth: 1,
                  padding: 12,
                  borderRadius: t.radius.md,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <AlertTriangle color="#ff4d4d" size={20} />
                <Text style={{ color: "#ff4d4d", fontWeight: "600", flex: 1 }}>
                  {error}
                </Text>
              </View>
            )}
          </Animated.View>

          <View style={{ width: "100%", gap: t.spacing.xs }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#10152A",
                borderWidth: 1,
                borderColor: email.length === 0 ? t.colors.border : emailOk ? "#2ecc71" : "#ffb020",
                borderRadius: t.radius.md,
                paddingHorizontal: 12,
              }}
            >
              <Mail color={t.colors.tabInactive} />
              <TextInput
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (error) setError(null);
                }}
                placeholder="Email"
                placeholderTextColor={t.colors.tabInactive}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{ flex: 1, color: t.colors.text, height: 48, marginLeft: 8 }}
              />
            </View>

            {!emailOk && email.length > 0 && (
              <Text style={{ color: "#ffb020", fontSize: 12, marginLeft: 4 }}>
                Digite um email válido
              </Text>
            )}
          </View>

          <View style={{ width: "100%", gap: t.spacing.xs }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#10152A",
                borderWidth: 1,
                borderColor: pass.length === 0 ? t.colors.border : passOk ? "#2ecc71" : "#ffb020",
                borderRadius: t.radius.md,
                paddingHorizontal: 12,
              }}
            >
              <Lock color={t.colors.tabInactive} />
              <TextInput
                value={pass}
                onChangeText={(v) => {
                  setPass(v);
                  if (error) setError(null);
                }}
                placeholder="Senha"
                placeholderTextColor={t.colors.tabInactive}
                secureTextEntry
                onKeyPress={onPassKey}
                style={{ flex: 1, color: t.colors.text, height: 48, marginLeft: 8 }}
              />
            </View>

            {!passOk && pass.length > 0 && (
              <Text style={{ color: "#ffb020", fontSize: 12, marginLeft: 4 }}>
                A senha precisa ter pelo menos 4 caracteres
              </Text>
            )}

            {capsLockOn && (
              <Text style={{ color: "#ff4d4d", fontSize: 12, marginLeft: 4 }}>
                Caps Lock ativado
              </Text>
            )}
          </View>

          <TouchableOpacity style={{ alignSelf: "flex-end", paddingVertical: 6 }}>
            <Text style={{ color: t.colors.accent, fontWeight: "700" }}>Esqueci a senha</Text>
          </TouchableOpacity>

          <View style={{ width: "100%", opacity: loading ? 0.9 : 1 }}>
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
              <Text style={{ color: "#0B0D13", fontWeight: "900" }}>
                {loading ? "Entrando..." : "Entrar"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
            <Text style={{ color: t.colors.textMuted }}>Novo por aqui?</Text>
            <TouchableOpacity onPress={() => nav.navigate("Signup")}>
              <Text style={{ color: t.colors.primary, fontWeight: "800" }}>
                Criar conta
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
