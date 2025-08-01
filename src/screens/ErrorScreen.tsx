import React, { useState } from "react";
import {
  View,
  Text,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useApp } from "../contexts/AppContext";
import { ErrorType } from "../contexts/AppContext";

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
  const { state, actions } = useApp();
  const [isRetrying, setIsRetrying] = useState(false);
  
  const error = state.error;
  const fallbackMessage = route?.params?.message || "Something went wrong. Please try again.";

  const getErrorIcon = (errorType?: ErrorType): keyof typeof Ionicons.glyphMap => {
    switch (errorType) {
      case ErrorType.STORAGE_INIT:
        return "server-outline";
      case ErrorType.DATA_LOAD:
        return "download-outline";
      case ErrorType.DATA_SAVE:
        return "save-outline";
      case ErrorType.NETWORK:
        return "wifi-outline";
      case ErrorType.USER_CREATE:
        return "person-outline";
      default:
        return "alert-circle-outline";
    }
  };

  const getErrorTitle = (errorType?: ErrorType): string => {
    switch (errorType) {
      case ErrorType.STORAGE_INIT:
        return "Database Error";
      case ErrorType.DATA_LOAD:
        return "Loading Error";
      case ErrorType.DATA_SAVE:
        return "Save Error";
      case ErrorType.NETWORK:
        return "Connection Error";
      case ErrorType.USER_CREATE:
        return "User Creation Error";
      default:
        return "Application Error";
    }
  };

  const getErrorTitleJP = (errorType?: ErrorType): string => {
    switch (errorType) {
      case ErrorType.STORAGE_INIT:
        return "データベースエラー";
      case ErrorType.DATA_LOAD:
        return "読み込みエラー";
      case ErrorType.DATA_SAVE:
        return "保存エラー";
      case ErrorType.NETWORK:
        return "接続エラー";
      case ErrorType.USER_CREATE:
        return "ユーザー作成エラー";
      default:
        return "アプリケーションエラー";
    }
  };

  const getErrorSuggestion = (errorType?: ErrorType): string => {
    switch (errorType) {
      case ErrorType.STORAGE_INIT:
        return "Try restarting the app or clearing app data if the problem persists.";
      case ErrorType.DATA_LOAD:
        return "Check your device storage and try again.";
      case ErrorType.DATA_SAVE:
        return "Ensure you have enough storage space and try again.";
      case ErrorType.NETWORK:
        return "Check your internet connection and try again.";
      case ErrorType.USER_CREATE:
        return "Try restarting the app or contact support if the issue continues.";
      default:
        return "Try restarting the app or contact support if the problem persists.";
    }
  };

  const handleRetry = async () => {
    if (isRetrying) return;
    
    try {
      setIsRetrying(true);
      actions.clearError();
      
      if (error?.canRetry && state.retryAttempts < 3) {
        await actions.retryLastAction();
      } else {
        await actions.forceReload();
      }
      
      // Navigate back to home if successful
      if (!state.error) {
        navigation.navigate('Home');
      }
    } catch (retryError) {
      console.error("Error during retry:", retryError);
      Alert.alert(
        "Retry Failed",
        "The retry attempt failed. You can try again or restart the app.",
        [
          { text: "Try Again", onPress: () => setIsRetrying(false) },
          { text: "Restart App", onPress: handleForceRestart }
        ]
      );
    } finally {
      setIsRetrying(false);
    }
  };

  const handleForceRestart = () => {
    Alert.alert(
      "Restart App",
      "This will restart the application and reset all data. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restart",
          style: "destructive",
          onPress: async () => {
            try {
              setIsRetrying(true);
              await actions.forceReload();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            } catch (error) {
              console.error("Force restart failed:", error);
            } finally {
              setIsRetrying(false);
            }
          },
        },
      ]
    );
  };

  const handleGoHome = () => {
    actions.clearError();
    navigation.navigate('Home');
  };

  const handleShowDetails = () => {
    Alert.alert(
      "Error Details",
      `Type: ${error?.type || 'Unknown'}\nTime: ${error?.timestamp ? new Date(error.timestamp).toLocaleString() : 'Unknown'}\nDetails: ${error?.details || 'No additional details'}`,
      [{ text: "OK" }]
    );
  };

  const canRetry = error?.canRetry !== false && state.retryAttempts < 3;
  const showRetryCount = state.retryAttempts > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={theme.colors.background} 
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name={getErrorIcon(error?.type)}
            size={80}
            color={theme.colors.error}
          />
        </View>

        <Text style={[styles.title, { color: theme.colors.text }]}>
          {error ? getErrorTitle(error.type) : "Error"}
        </Text>
        <Text style={[styles.jpTitle, { color: theme.colors.textSecondary }]}>
          {error ? getErrorTitleJP(error.type) : "エラー"}
        </Text>

        <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
          {error?.message || fallbackMessage}
        </Text>

        <Text style={[styles.suggestion, { color: theme.colors.textSecondary }]}>
          {getErrorSuggestion(error?.type)}
        </Text>

        {showRetryCount && (
          <Text style={[styles.retryCount, { color: theme.colors.textSecondary }]}>
            Retry attempts: {state.retryAttempts}/3
          </Text>
        )}

        <View style={styles.buttonContainer}>
          {canRetry && (
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                { backgroundColor: theme.colors.primary },
                isRetrying && styles.disabledButton,
              ]}
              onPress={handleRetry}
              disabled={isRetrying}
            >
              <Ionicons
                name={isRetrying ? "reload" : "refresh"}
                size={20}
                color={theme.colors.background}
                style={styles.buttonIcon}
              />
              <Text style={[styles.buttonText, { color: theme.colors.background }]}>
                {isRetrying ? "Retrying..." : "Try Again"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              styles.secondaryButton,
              { borderColor: theme.colors.primary },
            ]}
            onPress={handleForceRestart}
            disabled={isRetrying}
          >
            <Ionicons
              name="refresh-circle"
              size={20}
              color={theme.colors.primary}
              style={styles.buttonIcon}
            />
            <Text style={[styles.buttonText, { color: theme.colors.primary }]}>
              Force Restart
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.secondaryButton,
              { borderColor: theme.colors.textSecondary },
            ]}
            onPress={handleGoHome}
            disabled={isRetrying}
          >
            <Ionicons
              name="home"
              size={20}
              color={theme.colors.textSecondary}
              style={styles.buttonIcon}
            />
            <Text style={[styles.buttonText, { color: theme.colors.textSecondary }]}>
              Go Home
            </Text>
          </TouchableOpacity>

          {error && (
            <TouchableOpacity
              style={[
                styles.button,
                styles.tertiaryButton,
              ]}
              onPress={handleShowDetails}
              disabled={isRetrying}
            >
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={theme.colors.textSecondary}
                style={styles.buttonIcon}
              />
              <Text style={[styles.detailsText, { color: theme.colors.textSecondary }]}>
                Show Details
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  suggestion: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
    fontStyle: "italic",
  },
  retryCount: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 30,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    minHeight: 50,
  },
  primaryButton: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  secondaryButton: {
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  tertiaryButton: {
    backgroundColor: "transparent",
    paddingVertical: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  detailsText: {
    fontSize: 14,
    fontWeight: "400",
  },
  jpTitle: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 8,
  },
});
