import React from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import { RootStackParamList, TabParamList } from "../types";

// Import screens
import HomeScreen from "../screens/HomeScreen";
import PracticeScreen from "../screens/PracticeScreen";
import AlphabetScreen from "../screens/AlphabetScreen";
import AboutApp from "../screens/AboutApp";
import SettingsScreen from "../screens/SettingsScreen";

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Practice") {
            iconName = focused ? "game-controller" : "game-controller-outline";
          } else if (route.name === "Japanese") {
            iconName = focused ? "text" : "text-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          } else {
            iconName = "help-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.tabBarActive,
        tabBarInactiveTintColor: theme.colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
          height: 75 + (insets.bottom > 0 ? insets.bottom : 8),
          shadowColor: theme.isDark ? "#000" : "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: theme.isDark ? 0.3 : 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 2,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ 
          title: "Home",
          tabBarLabel: ({ focused: _focused, color }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color, marginBottom: 1 }}>Home</Text>
              <Text style={{ fontSize: 9, opacity: 0.8, color }}>ホーム</Text>
            </View>
          )
        }}
      />
      <Tab.Screen
        name="Practice"
        component={PracticeScreen}
        options={{ 
          title: "Practice",
          tabBarLabel: ({color }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color, marginBottom: 1 }}>Practice</Text>
              <Text style={{ fontSize: 9, opacity: 0.8, color }}>練習</Text>
            </View>
          )
        }}
      />
      <Tab.Screen
        name="Japanese"
        component={AlphabetScreen}
        options={{ 
          title: "Japanese",
          tabBarLabel: ({ color }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color, marginBottom: 1 }}>Japanese</Text>
              <Text style={{ fontSize: 9, opacity: 0.8, color }}>日本語</Text>
            </View>
          )
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ 
          title: "Settings",
          tabBarLabel: ({ color }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color, marginBottom: 1 }}>Settings</Text>
              <Text style={{ fontSize: 9, opacity: 0.8, color }}>設定</Text>
            </View>
          )
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { theme } = useTheme();


  const initialRoute = "Main"

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: "600",
            fontSize: 18,
            color: theme.colors.text,
          },
          cardStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="AboutApp"
          component={AboutApp}
          options={{
            title: "About App",
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}