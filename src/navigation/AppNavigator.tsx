import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import { RootStackParamList, TabParamList } from "../types";

// Import screens
import OnboardingScreen from "../screens/OnboardingScreen";
import HomeScreen from "../screens/HomeScreen";
import LibraryScreen from "../screens/LibraryScreen";
import PracticeScreen from "../screens/PracticeScreen";
import AlphabetScreen from "../screens/AlphabetScreen";
import ProfileScreen from "../screens/ProfileScreen";
import GrammarScreen from "../screens/GrammarScreen";
import WordDetailsScreen from "../screens/WordDetailsScreen";
import AddWordScreen from "../screens/AddWordScreen";
import SettingsScreen from "../screens/SettingsScreen";
import AchievementsScreen from "../screens/AchievementsScreen";
import StatisticsScreen from "../screens/StatisticsScreen";
import AboutApp from "../screens/AboutApp";
import LibraryFiltersScreen from "../screens/LibraryFilterSceen";
import ErrorSceen from "../screens/ErrorSceen";
import LoadingScreen from "../screens/LoadingScreen";

import { useApp } from "../contexts/AppContext";
import LessonDetailsScreen from "../screens/LessonDetailsScree";

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
          } else if (route.name === "Library") {
            iconName = focused ? "library" : "library-outline";
          } else if (route.name === "Grammar") {
            iconName = focused ? "book" : "book-outline";
          } else if (route.name === "Practice") {
            iconName = focused ? "game-controller" : "game-controller-outline";
          } else if (route.name === "Japanese") {
            iconName = focused ? "text" : "text-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
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
          paddingBottom: insets.bottom > 0 ? insets.bottom : 5,
          paddingTop: 8,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 8),
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
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{ title: "Library" }}
      />
      <Tab.Screen
        name="Grammar"
        component={GrammarScreen}
        options={{ title: "Grammar" }}
      />
      <Tab.Screen
        name="Practice"
        component={PracticeScreen}
        options={{ title: "Practice" }}
      />
      <Tab.Screen
        name="Japanese"
        component={AlphabetScreen}
        options={{ title: "Japanese" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { theme } = useTheme();
  const { state } = useApp();

  // Show loading screen while app is initializing
  if (state.isLoading) {
    return <LoadingScreen />;
  }

  // Check if there's an explicit error state
  if (state.error) {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Error"
            component={ErrorSceen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // Handle case where user data is not available (but not an error)
  // This could be a first-time user or authentication issue
  if (!state.user) {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // Safely determine initial route with fallback
  const isFirstTimeUser = state.user?.preferences?.firstTimeUser ?? true;
  const initialRoute = isFirstTimeUser ? "Onboarding" : "Main";

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
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="WordDetails"
          component={WordDetailsScreen}
          options={{
            title: "Word Details",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AddWord"
          component={AddWordScreen}
          options={{
            title: "Add Word",
            headerShown: false,
          }}
        />

      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
          headerShown: false,
        }}
      />
        <Stack.Screen
          name="Achievements"
          component={AchievementsScreen}
          options={{
            title: "Achievements",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Statistics"
          component={StatisticsScreen}
          options={{
            title: "Statistics",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AboutApp"
          component={AboutApp}
          options={{
            title: "About App",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="LibraryFilters"
          component={LibraryFiltersScreen}
          options={{
            title: "Library Filters",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="LessonDetails"
          component={LessonDetailsScreen}
          options={{
            title: "Lesson Details",
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="LessonPlayer"
          component={LessonDetailsScreen}
          options={{
            title: "Lesson Player",
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}