import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const router = useRouter();
  const { logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
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
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholderButton} />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Preferences</Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Text style={styles.settingDescription}>Receive quiz reminders and updates</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#767577', true: '#b3daff' }}
            thumbColor={notificationsEnabled ? '#007AFF' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Text style={styles.settingDescription}>Use dark theme throughout the app</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#767577', true: '#b3daff' }}
            thumbColor={darkMode ? '#007AFF' : '#f4f3f4'}
          />
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingLabel}>Sound Effects</Text>
            <Text style={styles.settingDescription}>Play sounds during quizzes</Text>
          </View>
          <Switch
            value={soundEffects}
            onValueChange={setSoundEffects}
            trackColor={{ false: '#767577', true: '#b3daff' }}
            thumbColor={soundEffects ? '#007AFF' : '#f4f3f4'}
          />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.linkRow}>
          <Text style={styles.linkText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color="#c7c7cc" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.linkRow}>
          <Text style={styles.linkText}>Privacy Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#c7c7cc" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.linkRow}>
          <Text style={styles.linkText}>Data & Storage</Text>
          <Ionicons name="chevron-forward" size={20} color="#c7c7cc" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <View style={styles.logoutTextContainer}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Log Out</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity style={styles.linkRow}>
          <Text style={styles.linkText}>Terms of Service</Text>
          <Ionicons name="chevron-forward" size={20} color="#c7c7cc" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.linkRow}>
          <Text style={styles.linkText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={20} color="#c7c7cc" />
        </TouchableOpacity>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  placeholderButton: {
    width: 40,
  },
  section: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#8e8e93',
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
    borderBottomColor: '#e1e1e1',
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
    color: '#8e8e93',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  linkText: {
    fontSize: 16,
    color: '#007AFF',
  },
  logoutButton: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
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
    color: '#8e8e93',
  },
}); 