import React from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  type LinkingOptions,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { Home, Compass, Library, UserRound } from "lucide-react-native";
import { CormorantGaramond_500Medium } from "@expo-google-fonts/cormorant-garamond/500Medium";
import { NotoSerifDevanagari_400Regular } from "@expo-google-fonts/noto-serif-devanagari/400Regular";
import { NotoNastaliqUrdu_400Regular } from "@expo-google-fonts/noto-nastaliq-urdu/400Regular";
import { Manrope_500Medium } from "@expo-google-fonts/manrope/500Medium";
import { AppProvider, useApp } from "./src/state/AppProvider";
import { BrandHeader, Txt, Button, IconButton } from "./src/components/ui";
import type { RootRoutes, TabRoutes } from "./src/navigation/types";
import HomeScreen from "./src/screens/HomeScreen";
import DiscoverScreen from "./src/screens/DiscoverScreen";
import LibraryScreen from "./src/screens/LibraryScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import PoetScreen from "./src/screens/PoetScreen";
import ReaderScreen from "./src/screens/ReaderScreen";
import CollectionScreen from "./src/screens/CollectionScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { GradientWash } from "./src/components/ThemeBackdrop";
const Stack = createNativeStackNavigator<RootRoutes>(),
  Tabs = createBottomTabNavigator<TabRoutes>();
const linking: LinkingOptions<RootRoutes> = {
  prefixes: ["kavyavani://"],
  config: {
    screens: {
      Tabs: {
        screens: {
          Home: "",
          Discover: "discover",
          Library: "library",
          Profile: "profile",
        },
      },
      Poet: "poet/:id",
      Reader: "poem/:id",
      Collection: "collection/:id",
      Settings: "settings",
    },
  },
};
function MainTabs() {
  const { theme, t } = useApp();
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        header: () => <BrandHeader />,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.muted,
        tabBarBackground: () => (
          <GradientWash from={theme.surface} to={theme.soft} />
        ),
        tabBarStyle: {
          backgroundColor: theme.bg,
          borderTopColor: theme.border,
          height: Platform.OS === "web" ? 74 : undefined,
          paddingTop: 7,
          paddingBottom: Platform.OS === "web" ? 12 : undefined,
        },
        tabBarLabelStyle: { fontFamily: "Interface", fontSize: 11 },
        tabBarIcon: ({ color, size }) => {
          const Icon = { Home, Discover: Compass, Library, Profile: UserRound }[
            route.name
          ];
          return <Icon size={size - 2} color={color} strokeWidth={1.5} />;
        },
      })}
    >
      <Tabs.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: t("Home", "मुखपृष्ठ") }}
      />
      <Tabs.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{ title: t("Discover", "खोजें") }}
      />
      <Tabs.Screen
        name="Library"
        component={LibraryScreen}
        options={{ title: t("Library", "लाइब्रेरी") }}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t("Profile", "प्रोफ़ाइल") }}
      />
    </Tabs.Navigator>
  );
}
function AppContent() {
  const { theme, ready, storageError, retrySave, t } = useApp();
  const [fontsLoaded, fontError] = useFonts({
    Literary: CormorantGaramond_500Medium,
    Devanagari: NotoSerifDevanagari_400Regular,
    Nastaliq: NotoNastaliqUrdu_400Regular,
    Interface: Manrope_500Medium,
  });
  if (!ready || (!fontsLoaded && !fontError))
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.bg,
          alignItems: "center",
          justifyContent: "center",
          gap: 15,
        }}
      >
        <Text style={{ fontSize: 27, color: theme.primary }}>Kavyavani</Text>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.bg }}
      edges={["top", "left", "right"]}
    >
      <StatusBar style={theme.dark ? "light" : "dark"} />
      {!!storageError && (
        <View
          style={{
            padding: 12,
            backgroundColor: theme.soft,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Txt style={{ flex: 1, fontSize: 12 }} accessibilityRole="alert">
            {storageError}
          </Txt>
          <Button
            subtle
            label={t("Retry save", "फिर सहेजें")}
            onPress={retrySave}
          />
        </View>
      )}
      {!!fontError && (
        <Txt accessibilityRole="alert">
          {t(
            "Custom fonts could not load. Using your device fonts.",
            "विशेष फ़ॉन्ट लोड नहीं हुए। डिवाइस फ़ॉन्ट उपयोग हो रहे हैं।",
          )}
        </Txt>
      )}
      <NavigationContainer
        linking={linking}
        theme={{
          ...(theme.dark ? DarkTheme : DefaultTheme),
          colors: {
            ...(theme.dark ? DarkTheme : DefaultTheme).colors,
            primary: theme.primary,
            background: theme.bg,
            card: theme.bg,
            text: theme.text,
            border: theme.border,
            notification: theme.primary,
          },
        }}
        documentTitle={{
          formatter: () => "Kavyavani · A little room for poetry",
        }}
      >
        <Stack.Navigator
          screenOptions={({ navigation }) => ({
            headerStyle: { backgroundColor: theme.bg },
            headerBackground: () => (
              <GradientWash from={theme.surface} to={theme.soft} />
            ),
            headerTintColor: theme.primary,
            headerTitleStyle: { fontFamily: "Interface", fontSize: 15 },
            contentStyle: { backgroundColor: theme.bg },
            animation: "none",
            headerBackButtonDisplayMode: "minimal",
            headerLeft: navigation.canGoBack()
              ? undefined
              : () => (
                  <IconButton
                    label={t("Go home", "मुखपृष्ठ पर जाएँ")}
                    onPress={() =>
                      navigation.navigate("Tabs", { screen: "Home" })
                    }
                  >
                    <Home size={20} color={theme.primary} />
                  </IconButton>
                ),
          })}
        >
          <Stack.Screen
            name="Tabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Poet"
            component={PoetScreen}
            options={{
              title: t("The poet & their words", "कवि और उनकी रचनाएँ"),
            }}
          />
          <Stack.Screen
            name="Reader"
            component={ReaderScreen}
            options={{
              title: t("A moment with poetry", "कविता के साथ कुछ पल"),
            }}
          />
          <Stack.Screen
            name="Collection"
            component={CollectionScreen}
            options={{ title: t("Your collection", "आपका संग्रह") }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: t("Settings", "सेटिंग") }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 30,
            backgroundColor: "#F7F2E8",
            gap: 20,
          }}
        >
          <Text style={{ fontSize: 24, color: "#342B27" }}>
            Kavyavani needs a fresh start.
          </Text>
          <Text style={{ color: "#342B27" }}>
            Your saved library has not been deleted.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => this.setState({ failed: false })}
            style={{ padding: 18, backgroundColor: "#743A40", borderRadius: 8 }}
          >
            <Text style={{ color: "#FFFFFF" }}>Try again</Text>
          </Pressable>
        </View>
      );
    return this.props.children;
  }
}
export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
