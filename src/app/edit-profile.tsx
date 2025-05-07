import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';

export default function EditProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { userTags, addTag, removeTag, setTags } = useProfile();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [name, setName] = useState(user?.username || '');
  const [username, setUsername] = useState(user?.username || '');
  const [localTags, setLocalTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [activeInput, setActiveInput] = useState<string | null>(null);
  
  // Initialize local state from global context
  useEffect(() => {
    setLocalTags([...userTags]);
  }, [userTags]);
  
  const handleGoBack = () => {
    router.back();
  };
  
  const handleSave = () => {
    // Update the global tags state
    setTags(localTags);
    Alert.alert('Success', 'Profile updated successfully!');
    router.back();
  };
  
  const handleAddTag = () => {
    if (!newTag.trim() || localTags.includes(newTag.trim())) {
      setNewTag('');
      return;
    }
    
    setLocalTags([...localTags, newTag.trim()]);
    setNewTag('');
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setLocalTags(localTags.filter(tag => tag !== tagToRemove));
  };

  // Function to scroll to the active input
  const scrollToInput = (fieldName: string) => {
    setActiveInput(fieldName);
    
    // Give time for the keyboard to appear before scrolling
    setTimeout(() => {
      if (scrollViewRef.current) {
        if (fieldName === 'instagram') {
          // For the last field, scroll to the bottom
          scrollViewRef.current.scrollToEnd({ animated: true });
        } else if (fieldName === 'tags') {
          // For tags, scroll to a specific position
          scrollViewRef.current.scrollTo({ y: 300, animated: true });
        } else if (fieldName === 'website') {
          // For website, scroll to a specific position
          scrollViewRef.current.scrollTo({ y: 450, animated: true });
        }
      }
    }, 300);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />
      
      {/* Header with back button and save button */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          onPress={handleGoBack} 
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Edit Profile</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={styles.saveButton}
        >
          <Text style={[styles.saveButtonText, { color: theme.primary }]}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.content} 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Profile Image Placeholder */}
            <View style={styles.imageContainer}>
              <View style={[styles.imageWrapper, { backgroundColor: theme.surface }]}>
                <Image 
                  source={{ uri: 'https://via.placeholder.com/150.png?text=Profile' }}
                  style={styles.profileImage}
                />
                <TouchableOpacity 
                  style={[styles.editImageButton, { backgroundColor: theme.primary }]}
                  onPress={() => Alert.alert('Coming Soon', 'Image upload feature coming soon!')}
                >
                  <Ionicons name="camera" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Form Fields */}
            <View style={styles.formContainer}>
              <Text style={[styles.label, { color: theme.text }]}>Name</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.surface, 
                  color: theme.text,
                  borderColor: theme.border 
                }]}
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor={theme.secondaryText}
                onFocus={() => scrollToInput('name')}
                returnKeyType="next"
              />
              
              <Text style={[styles.label, { color: theme.text }]}>Username</Text>
              <View style={[styles.usernameInput, { 
                backgroundColor: theme.surface, 
                borderColor: theme.border 
              }]}>
                <Text style={[styles.usernamePrefix, { color: theme.secondaryText }]}>@</Text>
                <TextInput
                  style={[styles.usernameField, { color: theme.text }]}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="username"
                  placeholderTextColor={theme.secondaryText}
                  onFocus={() => scrollToInput('username')}
                  returnKeyType="next"
                />
              </View>
              
              <Text style={[styles.label, { color: theme.text }]}>Tags</Text>
              <View style={styles.tagsContainer}>
                {localTags.length > 0 ? (
                  localTags.map(tag => (
                    <View key={tag} style={[styles.tag, { backgroundColor: theme.primary }]}>
                      <Text style={styles.tagText}>#{tag}</Text>
                      <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                        <Ionicons name="close-circle" size={16} color="#FFFFFF" style={styles.tagRemoveIcon} />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.emptyTagsMessage, { color: theme.secondaryText }]}>
                    No tags yet. Add some interests below!
                  </Text>
                )}
              </View>
              <View style={[styles.addTagContainer, { 
                backgroundColor: theme.surface, 
                borderColor: theme.border 
              }]}>
                <TextInput
                  style={[styles.addTagInput, { color: theme.text }]}
                  value={newTag}
                  onChangeText={setNewTag}
                  placeholder="Add a tag (e.g., gaming, travel, coding)"
                  placeholderTextColor={theme.secondaryText}
                  onSubmitEditing={handleAddTag}
                  returnKeyType="done"
                  onFocus={() => scrollToInput('tags')}
                />
                <TouchableOpacity 
                  onPress={handleAddTag}
                  disabled={!newTag.trim() || localTags.includes(newTag.trim())}
                  style={styles.addTagButton}
                >
                  <Ionicons 
                    name="add-circle" 
                    size={24} 
                    color={!newTag.trim() || localTags.includes(newTag.trim()) ? theme.secondaryText : theme.primary} 
                  />
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.label, { color: theme.text }]}>Links</Text>
              <View style={[styles.linkInput, { 
                backgroundColor: theme.surface, 
                borderColor: theme.border 
              }]}>
                <Ionicons name="globe-outline" size={20} color={theme.secondaryText} style={styles.linkIcon} />
                <TextInput
                  style={[styles.linkField, { color: theme.text }]}
                  value={website}
                  onChangeText={setWebsite}
                  placeholder="Website URL"
                  placeholderTextColor={theme.secondaryText}
                  onFocus={() => scrollToInput('website')}
                  returnKeyType="next"
                />
              </View>
              
              <View style={[styles.linkInput, { 
                backgroundColor: theme.surface, 
                borderColor: theme.border 
              }]}>
                <Ionicons name="logo-instagram" size={20} color={theme.secondaryText} style={styles.linkIcon} />
                <TextInput
                  style={[styles.linkField, { color: theme.text }]}
                  value={instagram}
                  onChangeText={setInstagram}
                  placeholder="Instagram username"
                  placeholderTextColor={theme.secondaryText}
                  onFocus={() => scrollToInput('instagram')}
                  returnKeyType="done"
                />
              </View>
              
              {/* Extra padding at the bottom for keyboard space */}
              <View style={styles.keyboardSpacer} />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  imageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  usernameInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  usernamePrefix: {
    fontSize: 16,
    marginRight: 4,
  },
  usernameField: {
    flex: 1,
    fontSize: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  tagRemoveIcon: {
    marginLeft: 4,
  },
  addTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  addTagInput: {
    flex: 1,
    fontSize: 16,
  },
  addTagButton: {
    padding: 4,
  },
  linkInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  linkIcon: {
    marginRight: 8,
  },
  linkField: {
    flex: 1,
    fontSize: 16,
  },
  emptyTagsMessage: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  keyboardSpacer: {
    height: 100, // Extra space at the bottom for keyboard
  },
}); 