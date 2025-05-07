import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView,
  StatusBar
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export default function CreateQuizOptions() {
  const router = useRouter();
  const { theme } = useTheme();

  const navigateToCreateQuiz = () => {
    router.push('/create-quiz');
  };

  const navigateToQuickQuiz = () => {
    router.push('/quick-quiz');
  };

  const handleGoBack = () => {
    router.push('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />
      
      {/* Header with back button */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          onPress={handleGoBack} 
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Create Quiz</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.contentContainer}>
          <View style={[styles.optionCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.optionTitle, { color: theme.text }]}>What type of quiz do you want to create?</Text>
            
            <TouchableOpacity 
              style={[styles.optionButton, { backgroundColor: theme.primary }]} 
              onPress={navigateToCreateQuiz}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={24} color="#FFFFFF" style={styles.optionIcon} />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionButtonText}>Create Standard Quiz</Text>
                <Text style={styles.optionButtonSubtext}>Multiple choice questions with images</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.optionButton, { backgroundColor: theme.primary }]} 
              onPress={navigateToQuickQuiz}
              activeOpacity={0.7}
            >
              <Ionicons name="flash-outline" size={24} color="#FFFFFF" style={styles.optionIcon} />
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionButtonText}>Quick Quiz</Text>
                <Text style={styles.optionButtonSubtext}>Generate a quiz using AI</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.optionButton, { backgroundColor: theme.card, borderColor: theme.border }]} 
              onPress={() => alert('Coming soon!')}
              activeOpacity={0.7}
            >
              <Ionicons name="copy-outline" size={24} color={theme.primary} style={styles.optionIcon} />
              <View style={styles.optionTextContainer}>
                <Text style={[styles.disabledOptionText, { color: theme.text }]}>Import Quiz (Coming Soon)</Text>
                <Text style={[styles.disabledOptionSubtext, { color: theme.secondaryText }]}>Import from external format</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.secondaryText} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    paddingTop: 50, // Add padding for status bar
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerPlaceholder: {
    width: 40,
  },
  contentContainer: {
    padding: 16,
  },
  optionCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionIcon: {
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  optionButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  disabledOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabledOptionSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
}); 