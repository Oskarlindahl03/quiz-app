import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import creatPostScreen from "../screens/create_post_screen/CreateQuizScreen";

export type RootStackParamList = {
    createPostScreen: undefined; // Define the parameter list for the stack navigator
    // Add other screens here if needed
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const CreatePostScreenNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="createPostScreen"
      id={undefined}
    >
      <Stack.Screen name="createPostScreen" component={creatPostScreen} options={{ title: "Create Post" }} />
    </Stack.Navigator>
  );
};
export default CreatePostScreenNavigator; // Export the navigator