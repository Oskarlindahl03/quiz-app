import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import SearchScreen from '../../screens/search_screen/SearchScreen';

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
  const router = useRouter();
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

  const { width } = Dimensions.get('window');
  // LinkedIn cover is about 1:3 aspect ratio, avatar is centered and overlaps bottom
  const coverHeight = Math.round(width / 3);
  const avatarSize = 96;
  const avatarOverlap = Math.round(avatarSize / 2.2);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Cover/Background Image with avatar and settings overlay */}
        <View style={[styles.coverWrapper, { height: coverHeight }]}> 
          <Image
            source={{ uri: 'https://via.placeholder.com/800x300.png?text=Background' }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        </View>
        {/* LinkedIn-style avatar: left-aligned, overlapping bottom of cover */}
        <View style={{ position: 'relative', height: avatarOverlap + 8 }}>
          <View style={{
            position: 'absolute',
            left: 24,
            top: -avatarOverlap,
            zIndex: 2,
          }}>
            <View style={[styles.avatarShadow, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}> 
              <Image
                source={{ uri: 'https://via.placeholder.com/100.png?text=Avatar' }}
                style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
              />
            </View>
          </View>
        </View>
        {/* Settings Icon below cover */}
        <View style={styles.settingsRow}>
          <TouchableOpacity style={styles.settingsIcon} onPress={() => router.push('/(tabs)/settings')}>
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        {/* User Info */}
        <View style={styles.infoSection}>
          <Text style={styles.handle}>@{user?.username || 'user'}</Text>
          <View style={styles.tagRow}>
            {['#art', '#music', '#design'].map(tag => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>200</Text>
              <Text style={styles.statLabel}>creations</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>25k</Text>
              <Text style={styles.statLabel}>fans</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statNumber}>500</Text>
              <Text style={styles.statLabel}>connections</Text>
            </View>
          </View>
          {/* Collections Section: Quizzes */}
          <View style={styles.collectionCard}>
            <View style={styles.collectionHeader}>
              <Text style={styles.collectionTitle}>Quizzes</Text>
              <Ionicons name="chevron-forward" size={20} color="#333" />
            </View>
            <View style={styles.collectionGrid}>
              {[1,2,3,4].map((i, idx) => (
                <View key={idx} style={styles.collectionImageWrap}>
                  <Image
                    source={{ uri: `https://via.placeholder.com/100?text=${idx+1}` }}
                    style={styles.collectionImage}
                  />
                  {idx === 3 && (
                    <View style={styles.collectionOverlay}>
                      <Text style={styles.collectionOverlayText}>+49</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
          {/* Collections Section: Tutorials */}
          <View style={styles.collectionCard}>
            <View style={styles.collectionHeader}>
              <Text style={styles.collectionTitle}>Tutorials</Text>
              <Ionicons name="chevron-forward" size={20} color="#333" />
            </View>
            <View style={styles.collectionGrid}>
              {[1,2,3,4].map((i, idx) => (
                <View key={idx} style={styles.collectionImageWrap}>
                  <Image
                    source={{ uri: `https://via.placeholder.com/100?text=${idx+1}` }}
                    style={styles.collectionImage}
                  />
                  {idx === 3 && (
                    <View style={styles.collectionOverlay}>
                      <Text style={styles.collectionOverlayText}>+49</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  coverWrapper: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#e5e5e5',
    overflow: 'hidden',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginBottom: 0,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0.85,
  },
  avatarShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
    backgroundColor: '#fff',
    padding: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
    marginRight: 24,
    marginBottom: 8,
  },
  settingsIcon: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
    position: 'relative',
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 0,
    marginTop: -45,
  },
  handle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tagChip: {
    padding: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 14,
  },
  statBlock: {
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
  collectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 18,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
    marginTop: 0,
  },
  collectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  collectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  collectionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 6,
  },
  collectionImageWrap: {
    width: 68,
    height: 68,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#e5e5e5',
  },
  collectionImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  collectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionOverlayText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default ProfileScreen; 