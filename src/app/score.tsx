import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function ScoreScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { score = 0, total = 0, quizTitle = '', quizId = '' } = useLocalSearchParams();

  function handleHome() {
    if (quizId) {
      router.replace(`/quiz/preview/${quizId}`);
    } else {
      router.replace('/');
    }
  }

  function handleTryAgain() {
    if (quizId) {
      router.replace(`/quiz/${quizId}?key=${Date.now()}`);
    } else {
      router.back();
    }
  }

  return (
    <View style={[styles.bg, { backgroundColor: theme.surface }]}>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Ionicons name="trophy" size={56} color="#FFD700" style={styles.icon} />
        <Text style={[styles.title, { color: theme.text }]}>Quiz Complete!</Text>
        {quizTitle ? <Text style={[styles.quizTitle, { color: theme.secondaryText }]}>{quizTitle}</Text> : null}
        <Text style={styles.score}>
          <Text style={[styles.scoreNumber, { color: theme.primary }]}>{score}</Text>
          <Text style={[styles.scoreTotal, { color: theme.secondaryText }]}> / {total}</Text>
        </Text>
        <Text style={[styles.message, { color: theme.text }]}>
          {Number(score) / Number(total) >= 0.8
            ? 'Excellent!'
            : Number(score) / Number(total) >= 0.5
            ? 'Good job!'
            : 'Keep practicing!'}
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleTryAgain}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.button, 
              styles.secondaryButton, 
              { 
                backgroundColor: theme.surface,
                borderColor: theme.primary 
              }
            ]} 
            onPress={handleHome}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText, { color: theme.primary }]}>
              {quizId ? 'Finish' : 'Go Home'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  icon: {
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  quizTitle: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  score: {
    fontSize: 44,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  scoreNumber: {
    fontSize: 56,
    fontWeight: 'bold',
  },
  scoreTotal: {
    fontSize: 28,
    fontWeight: '400',
  },
  message: {
    fontSize: 18,
    marginBottom: 28,
    marginTop: 2,
    textAlign: 'center',
  },
  buttonRow: {
    width: '100%',
    gap: 14,
  },
  button: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 17,
  },
  secondaryButton: {
    borderWidth: 1,
    marginBottom: 0,
  },
  secondaryButtonText: {
    // Color will be set dynamically
  },
}); 