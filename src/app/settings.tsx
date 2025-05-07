import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const router = useRouter();
  const { logout } = useAuth();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Log Out", 
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)');
            } catch (err) {
              console.error('Logout failed:', err);
              Alert.alert("Error", "Failed to log out. Please try again.");
            }
          }
        }
      ]
    );
  };

  function handleBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView style={[styles.container, { backgroundColor: theme.surface }]}>
        <View style={[styles.header, { backgroundColor: theme.headerBackground }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="arrow-back" size={22} color={theme.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>App Preferences</Text>
          
          <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Notifications</Text>
              <Text style={[styles.settingDescription, { color: theme.secondaryText }]}>Receive quiz reminders and updates</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: '#b3daff' }}
              thumbColor={notificationsEnabled ? theme.primary : '#f4f3f4'}
            />
          </View>
          
          <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Dark Mode</Text>
              <Text style={[styles.settingDescription, { color: theme.secondaryText }]}>Use dark theme throughout the app</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: '#b3daff' }}
              thumbColor={isDarkMode ? theme.primary : '#f4f3f4'}
            />
          </View>
          
          <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Sound Effects</Text>
              <Text style={[styles.settingDescription, { color: theme.secondaryText }]}>Play sounds during quizzes</Text>
            </View>
            <Switch
              value={soundEffects}
              onValueChange={setSoundEffects}
              trackColor={{ false: '#767577', true: '#b3daff' }}
              thumbColor={soundEffects ? theme.primary : '#f4f3f4'}
            />
          </View>
        </View>
        
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>Account</Text>
          
          <TouchableOpacity style={[styles.linkRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.linkText, { color: theme.primary }]}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.linkRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.linkText, { color: theme.primary }]}>Privacy Settings</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.linkRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.linkText, { color: theme.primary }]}>Data & Storage</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.logoutButton, { borderBottomColor: theme.border }]} onPress={handleLogout}>
            <View style={styles.logoutTextContainer}>
              <Ionicons name="log-out-outline" size={24} color="#FF3B30" style={styles.logoutIcon} />
              <Text style={styles.logoutText}>Log Out</Text>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.secondaryText }]}>About</Text>
          
          <TouchableOpacity style={[styles.linkRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.linkText, { color: theme.primary }]}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.linkRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.linkText, { color: theme.primary }]}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.secondaryText} />
          </TouchableOpacity>
          
          <View style={styles.versionContainer}>
            <Text style={[styles.versionText, { color: theme.secondaryText }]}>Version 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 0,
    marginRight: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  section: {
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    padding: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  linkText: {
    fontSize: 16,
  },
  logoutButton: {
    padding: 16,
    borderBottomWidth: 1,
  },
  logoutTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '500',
  },
  versionContainer: {
    padding: 16,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
  },
}); 