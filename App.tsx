import React, {Suspense, useEffect, useState} from 'react';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from "@react-navigation/native";
import { AppStackNavigation } from "./src/navigations";
import "./global.css";
import * as Notifications from "expo-notifications";
import {ActivityIndicator, Alert, Platform} from "react-native";
import { useSettingsStore } from "./src/store/settingsStore";
import { useGoalsStore } from "./src/store/goalsStore";
import { useStatisticsStore } from "./src/store/statisticsStore";
import { usePomodoroStore } from "./src/store/pomodoroStore";
import { useThemeStore } from "./src/store/themeStore";
import { ThemeProvider } from "./src/providers/ThemeProvider";
import { initializeDatabase } from "./src/services/database";
import { backgroundTimerService } from "./src/services/backgroundTimer";
import { notificationService } from "./src/services/notificationService";
import { errorHandler } from "./src/services/errorHandler";
import { OnboardingFlow, shouldShowOnboarding } from "./src/components/OnboardingFlow";
import * as SplashScreen from 'expo-splash-screen';
import {useMigrations} from "drizzle-orm/op-sqlite/migrator";
import { DB_NAME, db, expoDB} from "./src/db";
import migrations from "./src/db/migrations/migrations";
import {useDrizzleStudio} from "expo-drizzle-studio-plugin";
import {SQLiteProvider} from "expo-sqlite";
import flowTimerScreen from "./src/screens/FlowTimerScreen";

// Enable screens before any navigation components are rendered
enableScreens();

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const AppContent = () => {
  const { updateNotification, initializeStore: initializeSettings } = useSettingsStore();
  const { initializeStore: initializeGoals } = useGoalsStore();
  const { initializeStore: initializeStatistics } = useStatisticsStore();
  const { initializeStore: initializePomodoro } = usePomodoroStore();
  const { initializeStore: initializeTheme } = useThemeStore();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize error handler first
        await errorHandler.initialize();

        // Initialize database
        await initializeDatabase();

        // Initialize all stores in parallel
        await Promise.all([
          initializeSettings(),
          initializeGoals(),
          initializeStatistics(),
          initializePomodoro(),
          initializeTheme(),
        ]);

        // Initialize background services
        if (Platform.OS !== 'web') {
          await Promise.all([
            backgroundTimerService.initialize(),
            notificationService.initialize(),
          ]);
        }

        // Check if onboarding should be shown
        const shouldShow = await shouldShowOnboarding();
        setShowOnboarding(shouldShow);

        // Request notification permissions
        if (Platform.OS !== 'web') {
          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;

          if (existingStatus !== "granted") {
            const { status: requestedStatus } = await Notifications.requestPermissionsAsync();
            finalStatus = requestedStatus;
          }

          updateNotification(finalStatus);

          if (finalStatus !== "granted") {
            Alert.alert(
              "Notifications Disabled",
              "Enable notifications in settings to get timer alerts and reminders."
            );
          }
        }

        console.log('App initialized successfully');
        setIsAppReady(true);

        // Hide splash screen
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('Failed to initialize app:', error);
        errorHandler.logError(error as Error, {
          context: 'App Initialization',
          severity: 'critical',
        });

        Alert.alert(
          'Initialization Error',
          'Some features may not work properly. Please restart the app.'
        );

        setIsAppReady(true);
        await SplashScreen.hideAsync();
      }
    };

    initializeApp();
  }, []);

  // Handle notification responses
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;

      if (data?.type === 'session_complete' || data?.type === 'break_complete') {
        // Navigate to timer screen or show completion modal
        console.log('Timer notification received:', data);
      } else if (data?.type === 'daily_reminder') {
        // Navigate to timer screen
        console.log('Daily reminder received');
      } else if (data?.type === 'goal_achievement') {
        // Show achievement celebration
        console.log('Goal achievement notification:', data);
      }
    });

    return () => subscription.remove();
  }, []);

  // Handle app state changes for background timer
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' && Platform.OS !== 'web') {
        // App is going to background - background timer will handle timing
        console.log('App backgrounded - background timer active');
      } else if (nextAppState === 'active' && Platform.OS !== 'web') {
        // App is coming to foreground - sync with background timer
        console.log('App foregrounded - syncing with background timer');
        // Here you would sync the timer state with the background timer
      }
    };

    // Note: AppState would be imported and used here in a real implementation
    // AppState.addEventListener('change', handleAppStateChange);
    // return () => AppState.removeEventListener('change', handleAppStateChange);
  }, []);

  if (!isAppReady) {
    return null; // Splash screen is still showing
  }

  return (
    <>
      <NavigationContainer>
        <AppStackNavigation />
      </NavigationContainer>

      {/* Onboarding Flow */}
      {/* <OnboardingFlow
        visible={showOnboarding}
        onComplete={() => setShowOnboarding(false)}
      /> */}
    </>
  );
};

export default function App() {
  // Configure notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });


  useDrizzleStudio(expoDB)

  const { success, error } = useMigrations(db, migrations);
  useEffect(() => {
    if (success) {
      console.log('Database migrations successful');
    } else if (error) {
      console.error('Database migrations failed:', error);
    }
  }, []);

  return (
      <Suspense fallback={<ActivityIndicator  size={"large"}/>}>
<SQLiteProvider databaseName={DB_NAME} options={{
  enableChangeListener:true
}} useSuspense={true}>

    <ThemeProvider>
      <AppContent />
    </ThemeProvider>

</SQLiteProvider>
        </Suspense>
  );

}
