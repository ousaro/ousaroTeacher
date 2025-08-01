
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useApp } from "../contexts/AppContext";

export default function LoadingScreen() {
  const { theme } = useTheme();
  const { state } = useApp();
  const [loadingMessage, setLoadingMessage] = useState("Initializing...");

  useEffect(() => {
    const messages = [
      { en: "Initializing database...", jp: "データベースを初期化中..." },
      { en: "Loading user data...", jp: "ユーザーデータを読み込み中..." },
      { en: "Setting up the app...", jp: "アプリを設定中..." },
      { en: "Almost ready...", jp: "もうすぐ準備完了..." },
    ];

    let messageIndex = 0;
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex].en);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const getProgressMessage = () => {
    if (!state.isInitialized) {
      return { en: "Initializing database...", jp: "データベースを初期化中..." };
    }
    if (state.isLoading) {
      return { en: "Loading your data...", jp: "データを読み込み中..." };
    }
    return { en: loadingMessage, jp: "読み込み中..." };
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.text, { color: theme.colors.text }]}>
        {getProgressMessage().en}
      </Text>
      <Text style={[styles.jpText, { color: theme.colors.textSecondary }]}>
        {getProgressMessage().jp}
      </Text>
      {state.retryAttempts > 0 && (
        <>
          <Text style={[styles.retryText, { color: theme.colors.textSecondary }]}>
            Retrying... ({state.retryAttempts}/3)
          </Text>
          <Text style={[styles.jpRetryText, { color: theme.colors.textSecondary }]}>
            再試行中... ({state.retryAttempts}/3)
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  jpText: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    opacity: 0.8,
  },
  retryText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
  },
  jpRetryText: {
    marginTop: 2,
    fontSize: 12,
    textAlign: "center",
    opacity: 0.8,
  },
});
