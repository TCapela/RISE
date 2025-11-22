import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";
import { View } from "react-native";
import { Home as HomeIcon, Layers, GraduationCap, HeartPulse } from "lucide-react-native";

import LoginScreen from "./auth/LoginScreen";
import SignupScreen from "./auth/SignupScreen";

import HomeScreen from "./home/HomeScreen";
import TracksScreen from "./tracks/TracksScreen";
import CoursesScreen from "./courses/CoursesScreen";
import WellbeingScreen from "./wellbeing/WellbeingScreen";
import ProfileScreen from "./profile/ProfileScreen";
import CurriculoScreen from "./profile/CurriculoScreen";
import ConfigScreen from "./settings/ConfigScreen";
import AboutScreen from "./settings/AboutScreen";

import AdminLoginScreen from "./admin/AdminLoginScreen";
import AdminHomeScreen from "./admin/AdminHomeScreen";
import AdminCoursesScreen from "./admin/AdminCoursesScreen";
import AdminUsersScreen from "./admin/AdminUsersScreen";
import AdminCurriculaScreen from "./admin/AdminCurriculaScreen";

import { useTheme } from "../theme/theme";
import { useAuth } from "../store/auth.store";
import AuthSplashScreen from "../app/auth/AuthSplashScreen";

const AuthStack = createStackNavigator();
const Tabs = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AdminStack = createNativeStackNavigator();
const Root = createNativeStackNavigator();

function MainTabs() {
  const t = useTheme();
  const Pill =
    (Icon: any) =>
    ({ color, focused }: { color: string; focused: boolean }) =>
      (
        <View
          style={{
            height: 50,
            width: 50,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: focused ? "rgba(78,242,195,0.12)" : "transparent",
            borderWidth: focused ? 1 : 0,
            borderColor: focused ? t.colors.border : "transparent",
          }}
        >
          <Icon color={focused ? t.colors.primary : color} size={26} />
        </View>
      );

  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          left: 70,
          right: 70,
          bottom: 22,
          height: 72,
          backgroundColor: t.colors.surfaceAlt,
          borderRadius: 45,
          borderTopWidth: 0,
          elevation: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-evenly",
          paddingVertical: 10,
        },
        tabBarActiveTintColor: t.colors.primary,
        tabBarInactiveTintColor: t.colors.tabInactive,
        tabBarItemStyle: {
          alignItems: "center",
          justifyContent: "center",
          marginHorizontal: 2,
        },
      }}
    >
      <Tabs.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: Pill(HomeIcon) }} />
      <Tabs.Screen name="Trilhas" component={TracksScreen} options={{ tabBarIcon: Pill(Layers) }} />
      <Tabs.Screen name="Cursos" component={CoursesScreen} options={{ tabBarIcon: Pill(GraduationCap) }} />
      <Tabs.Screen name="Bem-Estar" component={WellbeingScreen} options={{ tabBarIcon: Pill(HeartPulse) }} />
    </Tabs.Navigator>
  );
}

function AppStack() {
  const t = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: t.colors.surface },
        headerTintColor: t.colors.text,
        contentStyle: { backgroundColor: t.colors.background },
      }}
    >
      <Stack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Perfil" component={ProfileScreen} />
      <Stack.Screen
        name="Currículo"
        component={CurriculoScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Config" component={ConfigScreen} options={{ title: "Configurações" }} />
      <Stack.Screen name="Sobre" component={AboutScreen} />
    </Stack.Navigator>
  );
}

function AdminStackNavigator() {
  const t = useTheme();
  return (
    <AdminStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: t.colors.surface },
        headerTintColor: t.colors.text,
        contentStyle: { backgroundColor: t.colors.background },
      }}
    >
      <AdminStack.Screen
        name="AdminHome"
        component={AdminHomeScreen}
        options={{ headerShown: false }}
      />
      <AdminStack.Screen
        name="AdminCourses"
        component={AdminCoursesScreen}
        options={{ title: "Cursos" }}
      />
      <AdminStack.Screen
        name="AdminUsers"
        component={AdminUsersScreen}
        options={{ title: "Usuários" }}
      />
      <AdminStack.Screen
        name="AdminCurricula"
        component={AdminCurriculaScreen}
        options={{ title: "Currículos" }}
      />
    </AdminStack.Navigator>
  );
}

function AuthNavigator() {
  const t = useTheme();
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: t.colors.background },
        gestureEnabled: true,
        gestureDirection: "horizontal",
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        transitionSpec: {
          open: { animation: "timing", config: { duration: 420 } },
          close: { animation: "timing", config: { duration: 420 } },
        },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="AdminLogin" component={AdminLoginScreen} />
    </AuthStack.Navigator>
  );
}

function UserEntryStack() {
  return (
    <Root.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade",
        animationDuration: 350,
      }}
    >
      <Root.Screen name="AuthSplash" component={AuthSplashScreen} />
      <Root.Screen name="App" component={AppStack} />
    </Root.Navigator>
  );
}

export function RootNavigator() {
  const { user } = useAuth();

  if (!user) return <AuthNavigator />;

  if (user.type === "admin") return <AdminStackNavigator />;

  return <UserEntryStack />;
}
