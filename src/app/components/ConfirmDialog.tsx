import { Modal, View, Text, TouchableOpacity, Pressable, Animated, Easing } from "react-native";
import { useRef, useEffect } from "react";
import { useTheme } from "../../theme/theme";

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  visible,
  title = "Confirmar",
  message = "",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
}: Props) {
  const t = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 8, tension: 80 }),
      ]).start();
    } else {
      opacity.setValue(0);
      scale.setValue(0.95);
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onCancel}>
      <Pressable onPress={onCancel} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Animated.View style={{ width: "100%", maxWidth: 420, transform: [{ scale }], opacity }}>
          <View style={{ backgroundColor: t.colors.surfaceAlt, borderRadius: t.radius.lg, borderWidth: 1, borderColor: t.colors.border, padding: t.spacing.lg, gap: t.spacing.md }}>
            <Text style={{ color: t.colors.text, fontSize: 18, fontWeight: "800" }}>{title}</Text>
            {!!message && <Text style={{ color: t.colors.textMuted }}>{message}</Text>}
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
              <TouchableOpacity onPress={onCancel} style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: t.radius.md, backgroundColor: "#1A2035", borderWidth: 1, borderColor: t.colors.border }}>
                <Text style={{ color: t.colors.text }}>{cancelText}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onConfirm} style={{ paddingVertical: 10, paddingHorizontal: 14, borderRadius: t.radius.md, backgroundColor: t.colors.primary }}>
                <Text style={{ color: "#0B0D13", fontWeight: "800" }}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
