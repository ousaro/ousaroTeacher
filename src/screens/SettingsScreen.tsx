import React, { useState } from "react";
import {
  View,
  Text,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { handleExportData, handleImportData, handleResetProgress } from "../utils";
import { useApp } from "../contexts/AppContext";
import { useAlert } from "../contexts/AlertContext";

interface Props {
  navigation: any;
}

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  theme: any;
}

interface SettingsItem {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  rightElement, // Optional right element like a switch
  theme,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.settingItem,
      {
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.card,
      },
    ]}
  >
    <View
      style={[styles.iconContainer, { backgroundColor: theme.colors.surface }]}
    >
      <Ionicons name={icon as any} size={20} color={theme.colors.primary} />
    </View>
    <View style={styles.textContainer}>
      <Text style={[styles.itemTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      {subtitle && (
        <Text
          style={[styles.itemSubtitle, { color: theme.colors.textSecondary }]}
        >
          {subtitle}
        </Text>
      )}
    </View>
    {rightElement || (
      <Ionicons
        name="chevron-forward"
        size={20}
        color={theme.colors.textSecondary}
      />
    )}
  </TouchableOpacity>
);


export default function SettingsScreen({ navigation }: Props) {
  const { theme, toggleTheme, isDark } = useTheme();
  const {actions, state} = useApp();
  const {user}  = state;
  const alert = useAlert();
  const [dailyGoal, setDailyGoal] = useState(user?.dailyGoal || 0);
  const [dailyGoalModalVisible, setDailyGoalModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState(new Date());
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);


  const settingsSections: Array<{
    title: string;
    items: SettingsItem[];
  }> = [
    {
      title: "Appearance",
      items: [
        {
          icon: "moon",
          title: "Dark Mode",
          subtitle: "Switch between light and dark theme",
          rightElement: (
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={isDark ? "#ffffff" : "#f4f3f4"}
            />
          ),
        },
      ],
    },
    {
      title: "Learning",
      items: [
        {
          icon: "flag",
          title: "Daily Goal",
          subtitle: "Set your daily learning target",
          onPress: () => {
            setDailyGoalModalVisible(true);
          },
        },
        {
          icon: "notifications",
          title: "Notifications",
          subtitle: "Manage your learning reminders",
          onPress: () => {
            setNotificationsModalVisible(true);
          },
        },
      ],
    },
    {
      title: "Data",
      items: [
        {
          icon: "download",
          title: "Export Data",
          subtitle: "Export your words and progress",
          onPress: async () => {
            await handleExportData();
          },
        },
        {
          icon: "cloud-upload-outline",
          title: "Import Data",
          subtitle: "Restore from a backup file",
          onPress: async () => {
            await handleImportData();
            actions.loadInitialData();
          },
        },
        {
          icon: "trash",
          title: "Reset Progress",
          subtitle: "Clear all learning data",
          onPress: () => {
            alert({
              type: "confirm",
              title: "Confirm Reset",
              message: "Are you sure you want to permanently delete all your learning data? This cannot be undone.",
              confirmText: "Reset",
              cancelText: "Cancel",
              onConfirm: async () => {
                await handleResetProgress();
                actions.loadInitialData();
              },
              onCancel: () => {},
            })
          },
        },
      ],
    },
    {
      title: "About",
      items: [
        {
          icon: "information-circle",
          title: "About OusaroTeacher",
          subtitle: "Version 1.0.0",
          onPress: () => {
            navigation.navigate("AboutApp");
          },
        },
      ],
    },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.background}
      />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Settings
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            {/* Section Header */}
            <Text
              style={[
                styles.sectionHeader,
                { color: theme.colors.textSecondary },
              ]}
            >
              {section.title}
            </Text>

            {/* Section Items */}
            <View
              style={[
                styles.sectionContent,
                { backgroundColor: theme.colors.card },
              ]}
            >
              {section.items.map((item, itemIndex) => (
                <SettingItem
                  key={itemIndex}
                  icon={item.icon}
                  title={item.title}
                  subtitle={item.subtitle}
                  onPress={item.onPress}
                  rightElement={item.rightElement}
                  theme={theme}
                />
              ))}
            </View>
          </View>
        ))}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>


      {/* Daily Goal Modal */}
      {dailyGoalModalVisible && (
        <View style={[styles.modalContainer]}>
          <View style={[styles.modalContent,
           {borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.card, }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Set Daily Goal</Text>
            <TextInput
              style={[styles.modalInput, { color: theme.colors.text }]}
              keyboardType="numeric"
              placeholder="Enter your daily goal"
              value={dailyGoal.toString()}
              onChangeText={(text) => setDailyGoal(Number(text))}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setDailyGoalModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  // TODO: Save the daily goal

                  setDailyGoalModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}  

      {/* Notifications Modal */}
      {notificationsModalVisible && (
        <View style={[styles.modalContainer]}>
          <View style={[styles.modalContent,
           {borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.card, }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Notifications</Text>
             <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={notificationsEnabled ? "#ffffff" : "#f4f3f4"}
            />
            { /* Time picker can be added here for selecting notification time */ }
            <TextInput
              style={[styles.modalInput, { color: theme.colors.text }]}
              placeholder="Set notification time"
              value={notificationTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
              onChangeText={(text) => {
                const [hours, minutes] = text.split(':').map(Number);
                const newTime = new Date(notificationTime);
                newTime.setHours(hours, minutes, 0);
                setNotificationTime(newTime);
              }}
            />
           

            <Text style={[styles.itemSubtitle, { color: theme.colors.textSecondary }]}>
              Enable notifications for learning reminders
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setNotificationsModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  // TODO: Save the notifications settings

                  setNotificationsModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSpacer: {
    width: 24,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 16,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  sectionContent: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  bottomSpacing: {
    height: 32,
  },
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalInput: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    backgroundColor: "#007bff",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },  
});
