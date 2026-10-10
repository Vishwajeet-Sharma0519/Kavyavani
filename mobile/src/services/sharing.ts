import { Platform, Share } from "react-native";
import * as Clipboard from "expo-clipboard";
export async function shareText(title: string, text: string) {
  if (Platform.OS === "web") {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text });
        return "shared";
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return "cancelled";
      }
    }
    await Clipboard.setStringAsync(text);
    return "copied";
  }
  const result = await Share.share({ title, message: text });
  return result.action === Share.dismissedAction ? "cancelled" : "shared";
}
