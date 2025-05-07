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
import { useTheme } from '@/context/ThemeContext';
import { useProfile } from '@/context/ProfileContext';
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
  const { theme } = useTheme();
  const { userTags } = useProfile();
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.background }]} 
        contentContainerStyle={{ paddingBottom: 24 }}
      >
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
            <View style={[styles.avatarShadow, { 
              width: avatarSize, 
              height: avatarSize, 
              borderRadius: avatarSize / 2,
              backgroundColor: theme.card 
            }]}> 
              <Image
                source={{ uri: 'https://via.placeholder.com/100.png?text=Avatar' }}
                style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
              />
            </View>
          </View>
        </View>
        {/* Settings Icon below cover */}
        <View style={styles.settingsRow}>
          <TouchableOpacity 
            style={[styles.settingsIcon, { backgroundColor: theme.card }]} 
            onPress={() => router.push('/settings')}
          >
            <Ionicons name="settings-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        {/* User Info */}
        <View style={styles.infoSection}>
          <Text style={[styles.handle, { color: theme.text }]}>@{user?.username || 'user'}</Text>
          <View style={styles.tagRow}>
            {userTags.length > 0 ? (
              userTags.map(tag => (
                <View key={tag} style={[styles.tagChip, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.tagText, { color: theme.secondaryText }]}>#{tag}</Text>
                </View>
              ))
            ) : (
              <Text style={[styles.noTagsText, { color: theme.secondaryText }]}>
                No tags yet. Click Edit to add interests.
              </Text>
            )}
          </View>

          {/* Profile Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.primary }]}
              onPress={() => router.push('/edit-profile')}
            >
              <Ionicons name="create-outline" size={18} color="#FFFFFF" style={styles.actionButtonIcon} />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}
              onPress={() => {
                // Implement sharing profile functionality here
                alert('Share profile feature coming soon');
              }}
            >
              <Ionicons name="share-social-outline" size={18} color={theme.text} style={styles.actionButtonIcon} />
              <Text style={[styles.actionButtonText, { color: theme.text }]}>Share Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBlock}>
              <Text style={[styles.statNumber, { color: theme.text }]}>200</Text>
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>creations</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={[styles.statNumber, { color: theme.text }]}>25k</Text>
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>fans</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={[styles.statNumber, { color: theme.text }]}>500</Text>
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>connections</Text>
            </View>
          </View>
          {/* Collections Section: Quizzes */}
          <View style={[styles.collectionCard, { backgroundColor: theme.card }]}>
            <View style={styles.collectionHeader}>
              <Text style={[styles.collectionTitle, { color: theme.text }]}>Quizzes</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.text} />
            </View>
            <View style={styles.collectionGrid}>
              {[1,2,3,4].map((i, idx) => (
                <View key={idx} style={[styles.collectionImageWrap, { backgroundColor: theme.surface }]}>
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
          <View style={[styles.collectionCard, { backgroundColor: theme.card }]}>
            <View style={styles.collectionHeader}>
              <Text style={[styles.collectionTitle, { color: theme.text }]}>Tutorials</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.text} />
            </View>
            <View style={styles.collectionGrid}>
              {[1,2,3,4].map((i, idx) => (
                <View key={idx} style={[styles.collectionImageWrap, { backgroundColor: theme.surface }]}>
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
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    fontSize: 14,
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
  },
  collectionCard: {
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
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonIcon: {
    marginRight: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  noTagsText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default ProfileScreen; 