import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import InQuizGameScreen from "../screens/quiz_screen/InQuizGameScreen.js";

// Define the parameter list for this specific stack
export type QuizStackParamList = {
  IngameScreen: { quizId: string }; // <<< Update: Assume it needs quizId now
  QuizResults: { score: number; totalQuestions: number }; // Example future screen
  // Add QuizDetailScreen etc. if needed
};

const Stack = createNativeStackNavigator<QuizStackParamList>();

const QuizScreenNavigator = () => {
  return (
    <Stack.Navigator
        initialRouteName="IngameScreen"
        id = {undefined} // <<< Add this line to avoid type errors
        screenOptions={{
            headerShown: false // <<< Often hide header of nested stack
        }}
     >
        {/* Update IngameScreen to potentially receive quizId */}
        <Stack.Screen
            name="IngameScreen"
            component={InQuizGameScreen}
           options={{ title: "Quiz" }} 
        />
        {/* Add other screens for this stack later
        <Stack.Screen name="QuizResults" component={QuizResultsScreen} />
        */}
    </Stack.Navigator>
  );
};

// *** ADD THIS EXPORT LINE ***
export default QuizScreenNavigator;