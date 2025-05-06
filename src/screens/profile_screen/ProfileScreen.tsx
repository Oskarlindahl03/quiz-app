import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@/src/context/AuthContext';

/**
 * ProfileScreen Component
 * 
 * Displays user profile information and settings.
 * This is a placeholder implementation that can be expanded
 * with additional features as needed.
 */

// Temporary type for user data - expand based on your backend model
type UserData = {
  quizzesTaken: number;
  quizzesCreated: number;
  averageScore: number;
};

const ProfileScreen: React.FC = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData>({
    quizzesTaken: 0,
    quizzesCreated: 0,
    averageScore: 0,
  });

  // Fetch user data when component mounts
  useEffect(() => {
    // TODO: Implement actual user data fetching
    // This is placeholder data
    setUserData({
      quizzesTaken: 15,
      quizzesCreated: 5,
      averageScore: 85,
    });
  }, []);

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.profileSection}>
        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImagePlaceholder}>
            <Ionicons name="person" size={40} color="#666" />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userData.quizzesTaken}</Text>
            <Text style={styles.statLabel}>Quizzes Taken</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userData.quizzesCreated}</Text>
            <Text style={styles.statLabel}>Created</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userData.averageScore}%</Text>
            <Text style={styles.statLabel}>Avg. Score</Text>
          </View>
        </View>

        {/* Recent Activity Section */}
        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {/* Add your recent activity list here */}
          <View style={styles.activityPlaceholder}>
            <Text style={styles.placeholderText}>No recent activity</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  profileSection: {
    padding: 16,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  recentActivity: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  activityPlaceholder: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
  },
});

export default ProfileScreen; 