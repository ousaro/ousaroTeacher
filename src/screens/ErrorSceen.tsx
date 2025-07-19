import React from "react";
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

interface Props {
  navigation: any;
  route?: {
    params?: {
      message?: string;
    };
  };
}

export default function ErrorScreen({ navigation, route }: Props) {
  const { theme, isDark } = useTheme();
  const message = route?.params?.message || "Something went wrong. Please try again.";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />
     
      {/* Content */}
      <View style={[styles.content]}>
        <Ionicons name="warning-outline" size={64} color={theme.colors.primary} />
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          {message}
        </Text>
        <Text style={[styles.jpErrorText, { color: theme.colors.textSecondary }]}>
          申し訳ありません。問題が発生しました。
        </Text>
        <TouchableOpacity
          onPress={() => window.location.reload()}
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTextContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 24,
  },
  jpHeaderTitle: {
    fontSize: 14,
    color: "#888",
    marginTop: 2,
    letterSpacing: 1,
    textAlign: "center",
  },
  headerSpacer: {
    width: 24,
  },
  content: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 16,
  },
  jpErrorText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
