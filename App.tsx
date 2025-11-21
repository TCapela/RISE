import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer, DefaultTheme as NavLight, DarkTheme as NavDark } from "@react-navigation/native";
import { RootNavigator } from "./src/app/navigator";
import { useTheme } from "./src/theme/theme";
import { View } from "react-native";
import { navigationRef } from "./src/app/navigationRef";

export default function App() {
  const t = useTheme();
  const nav = { ...NavDark, colors: { ...NavDark.colors, background: t.colors.background, card: t.colors.surfaceAlt, text: t.colors.text, primary: t.colors.primary, border: t.colors.border, notification: t.colors.accent } };
  return (
    <View style={{ flex: 1, backgroundColor: t.colors.background }}>
      <StatusBar style="light" />
      <NavigationContainer ref={navigationRef} theme={nav}>
        <RootNavigator />
      </NavigationContainer>
    </View>
  );
}
