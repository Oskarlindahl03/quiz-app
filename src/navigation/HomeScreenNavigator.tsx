import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import screen components - Assuming they are now .tsx or correctly handle types
import HomeScreen from "../screens/home_screen/homeScreen"; // Adjusted path might be needed
import InQuizGameScreen from "../screens/quiz_screen/InQuizGameScreen"; // Adjusted path might be needed
// import QuizResultsScreen from "../screens/quiz/QuizResultsScreen"; // For later

// --- DEFINE THE PARAM LIST TYPE ---
// Keys are the route names, values are objects describing route params, or undefined if no params
export type HomeStackParamList = {
  HomeMain: undefined; // Route name for HomeScreen, no params expected
  QuizList: undefined; // Route name for QuizListScreen, no params expected (adjust if needed)
  InQuizGame: { quizId: string }; // Example: Route name for InQuizGame, expects a quizId param
  // QuizResults: { score: number; totalQuestions: number }; // Example for later results screen
};

// --- CREATE TYPED STACK NAVIGATOR ---
const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeScreenNavigator = () => {
  return (
    <Stack.Navigator
      // Use consistent screen names defined in HomeStackParamList
      initialRouteName="HomeMain"
      id = {undefined} // <<< Add this line to avoid type errors
      screenOptions={{
        headerShown: false, // Keep header hidden if nested
      }}
    >
      {/* Define screens known to THIS navigator */}
      <Stack.Screen
        name="HomeMain" // <<< MUST MATCH key in HomeStackParamList
        component={HomeScreen}
      />
      <Stack.Screen
        name="InQuizGame" // <<< MUST MATCH key in HomeStackParamList
        component={InQuizGameScreen}
        // Example: If InQuizGameScreen expects options, you can add them
        // options={({ route }) => ({ title: `Quiz ${route.params.quizId}` })}
      />
      {/* Add Results screen later
      <Stack.Screen
        name="QuizResults"
        component={QuizResultsScreen}
      />
       */}
    </Stack.Navigator>
  );
};

export default HomeScreenNavigator;