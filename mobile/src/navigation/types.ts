import type { NavigatorScreenParams } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
export type TabRoutes = {
  Home: undefined;
  Discover:
    | {
        query?: string;
        genre?: string;
        tab?: "Poems" | "Poets" | "Collections";
      }
    | undefined;
  Library: undefined;
  Profile: undefined;
};
export type RootRoutes = {
  Tabs: NavigatorScreenParams<TabRoutes> | undefined;
  Poet: { id: string };
  Reader: { id: string };
  Collection: { id: string };
  Settings: undefined;
};
export const useNav = () =>
  useNavigation<NativeStackNavigationProp<RootRoutes>>();
