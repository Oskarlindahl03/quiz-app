import React, { createContext, useState, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the shape of our profile context
interface ProfileContextData {
  userTags: string[];
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  setTags: (tags: string[]) => void;
}

// Create the context with a default value
const ProfileContext = createContext<ProfileContextData>({} as ProfileContextData);

// Create a provider component
export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userTags, setUserTags] = useState<string[]>([]);

  // Add a tag to user profile
  const addTag = async (tag: string) => {
    try {
      if (!tag.trim() || userTags.includes(tag.trim())) return;
      
      const newTags = [...userTags, tag.trim()];
      setUserTags(newTags);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('@QuizApp:userTags', JSON.stringify(newTags));
    } catch (error) {
      console.error('Error adding tag:', error);
    }
  };

  // Remove a tag from user profile
  const removeTag = async (tagToRemove: string) => {
    try {
      const newTags = userTags.filter(tag => tag !== tagToRemove);
      setUserTags(newTags);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('@QuizApp:userTags', JSON.stringify(newTags));
    } catch (error) {
      console.error('Error removing tag:', error);
    }
  };

  // Set all tags at once
  const setTags = async (tags: string[]) => {
    try {
      setUserTags(tags);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('@QuizApp:userTags', JSON.stringify(tags));
    } catch (error) {
      console.error('Error setting tags:', error);
    }
  };

  // Load tags from AsyncStorage when app starts
  React.useEffect(() => {
    const loadTags = async () => {
      try {
        const storedTags = await AsyncStorage.getItem('@QuizApp:userTags');
        if (storedTags) {
          setUserTags(JSON.parse(storedTags));
        }
      } catch (error) {
        console.error('Error loading tags from storage:', error);
      }
    };

    loadTags();
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        userTags,
        addTag,
        removeTag,
        setTags,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

// Custom hook to use the profile context
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export default ProfileContext; 