import { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../theme/theme";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";

const logo = require("../../../assets/logo.png");

export default function AuthSplashScreen() {
  const t = useTheme();
  const nav = useNavigation<any>();

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.92);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) });
    scale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.cubic) });

    const id = setTimeout(() => {
      nav.replace("App");
    }, 1100);

    return () => clearTimeout(id);
  }, []);

  const animStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      <LinearGradient
        colors={["#0D1323", "#16213E", "#0B0D13"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.center}>
        <Animated.View style={animStyle}>
          <Image source={logo} style={{ width: 160, height: 160 }} resizeMode="contain" />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
