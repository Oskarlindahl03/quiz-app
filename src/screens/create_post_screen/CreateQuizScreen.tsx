import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    TextInput,
    Button,
    StyleSheet,
    Text,
    ScrollView,
    Alert,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    SafeAreaView,
    FlatList,
    Modal,
    Platform,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    StatusBar
} from 'react-native';
import { createQuiz, uploadQuestionImage } from '../../services/quiz_service'; 
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker'; 
import Ionicons from '@expo/vector-icons/Ionicons';
import { apiBaseUrl } from '../../services/api';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

// Use the API URL from the api module instead of hardcoding it
const API_BASE_URL = apiBaseUrl;

// Remove /api from the base URL to get the root server URL for images
const IMAGE_SERVER_URL = API_BASE_URL.replace('/api', '');

/**
 * Helper function to ensure image URLs are properly formatted
 */
const getImageUrl = (path: string | null): string | null => {
    if (!path) return null;
    
    console.log("Processing image URL:", path);
    
    // Special case for the specific pattern we're receiving from the server
    // Example: http://192.168.0.28:3001/C:/Users/oskar/OneDrive/Desktop/Quiz/backend/uploads/filename.png
    if (path.includes('/backend/uploads/')) {
        // Extract just the filename
        const filenamePart = path.split('/backend/uploads/')[1];
        
        // Extract the server part (everything before the Windows path)
        const serverMatch = path.match(/(https?:\/\/[^\/]+)/i);
        const serverUrl = serverMatch ? serverMatch[1] : IMAGE_SERVER_URL;
        
        const fixedUrl = `${serverUrl}/uploads/${filenamePart}`;
        console.log("Fixed URL:", fixedUrl);
        return fixedUrl;
    }
    
    // If it's already a full URL to the uploads directory, use it
    if (path.includes('/uploads/') && path.startsWith('http')) {
        return path;
    }
    
    // Handle Windows paths in URLs (like http://server/C:/path/to/file.jpg)
    if (path.includes("/C:/") || path.includes("/c:/")) {
        // Extract the filename from the path
        const parts = path.split(/[\/\\]/);
        const filename = parts[parts.length - 1];
        
        // Get the server part of the URL
        const serverUrlMatch = path.match(/(https?:\/\/[^\/]+)/i);
        const serverUrl = serverUrlMatch ? serverUrlMatch[1] : IMAGE_SERVER_URL;
        
        return `${serverUrl}/uploads/${filename}`;
    }
    
    // If it's a relative path, make sure it starts with a slash
    if (!path.startsWith('http')) {
        const relativePath = path.startsWith('/') ? path : `/${path}`;
        return `${IMAGE_SERVER_URL}${relativePath}`;
    }
    
    // Default case - return the path unchanged
    return path;
};

const POPULAR_TAGS = [
    "History", "Science", "Math", "Literature", "Sports", 
    "Entertainment", "Geography", "Technology", "Art", "Music",
    "Movies", "TV Shows", "Animals", "Food", "Travel",
    "Languages", "Physics", "Chemistry", "Biology", "Astronomy",
    "Politics", "Economics", "Psychology", "Philosophy", "Medicine",
    "Fashion", "Celebrities", "Fitness", "Nature", "Space"
];

interface QuestionDraft {
    id: string;
    question: string;
    options: string[];
    correctAnswerIndex: number | null;
    imageUri?: string | null;
    imageUrl?: string | null;
}

interface QuestionPayload {
    text: string;
    options: {
        text: string;
        isCorrect: boolean;
    }[];
    imageUrl?: string;
}

interface ImageUploadResponse {
    success: boolean;
    imageUrl: string;
}

let questionIdCounter = 0;

const createNewQuestion = (): QuestionDraft => ({
    id: String(questionIdCounter++),
    question: '',
    options: ['', '', '', ''],
    correctAnswerIndex: null,
    imageUri: null,
    imageUrl: null,
});

// Define interface for SafeImage props
interface SafeImageProps {
    uri: string | null;
    style: any; // Or use a more specific type like ImageStyle from react-native
    fallback?: React.ReactNode;
}

// Safe Image component that handles errors gracefully
const SafeImage: React.FC<SafeImageProps> = ({ uri, style, fallback = null }) => {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUri, setCurrentUri] = useState<string | null>(null);
    
    // Format the URI using our helper
    const formattedUri = uri ? getImageUrl(uri) : null;
    
    // Set the formatted URI as the current URI initially
    useEffect(() => {
        if (formattedUri) {
            setCurrentUri(formattedUri);
            setHasError(false);
        } else {
            setCurrentUri(null);
        }
    }, [formattedUri]);
    
    // Debug log for tracking image URLs
    useEffect(() => {
        if (uri) {
            console.log(`Raw URI: ${uri}`);
            console.log(`Formatted URI: ${formattedUri}`);
            
            // Test if the server is reachable
            if (formattedUri) {
                fetch(formattedUri, { method: 'HEAD' })
                    .then(response => {
                        console.log(`Image URL test: ${formattedUri} - Status: ${response.status}`);
                    })
                    .catch(error => {
                        console.error(`Image URL test failed: ${formattedUri}`, error.message);
                        
                        // On fetch error, try the fallback immediately
                        const placeholderUrl = `https://via.placeholder.com/300?text=Image`;
                        setCurrentUri(placeholderUrl);
                        console.log(`Switched to placeholder: ${placeholderUrl}`);
                    });
            }
        }
    }, [uri, formattedUri]);
    
    if (!currentUri || hasError) {
        return fallback || <View style={[style, { backgroundColor: '#E5E5EA' }]} />;
    }
    
    return (
        <View style={{ position: 'relative' }}>
            {isLoading && (
                <View style={[style, { position: 'absolute', justifyContent: 'center', alignItems: 'center', backgroundColor: '#E5E5EA' }]}>
                    <ActivityIndicator size="small" color="#007AFF" />
                </View>
            )}
            <Image
                source={{ uri: currentUri }}
                style={style}
                onLoadStart={() => setIsLoading(true)}
                onLoadEnd={() => setIsLoading(false)}
                onError={(error) => {
                    console.log(`Image load error for: ${currentUri}`);
                    
                    // If we're already using a placeholder, just show the error state
                    if (currentUri.includes('placeholder.com')) {
                        setHasError(true);
                        setIsLoading(false);
                        return;
                    }
                    
                    // Try a direct placeholder as fallback
                    const placeholderUrl = `https://via.placeholder.com/300?text=Image`;
                    console.log(`Attempting fallback to placeholder: ${placeholderUrl}`);
                    
                    // Update the component to use the placeholder
                    setCurrentUri(placeholderUrl);
                    setIsLoading(true); // Will trigger loading again
                }}
            />
        </View>
    );
};

const CreateQuizScreenMVP = () => {
    const router = useRouter();
    const { theme } = useTheme();
    const { user } = useAuth();
    const [title, setTitle] = useState<string>('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagModalVisible, setTagModalVisible] = useState<boolean>(false);
    const [tagSearch, setTagSearch] = useState<string>('');
    const [questions, setQuestions] = useState<QuestionDraft[]>([createNewQuestion()]);
    const [isLoading, setIsLoading] = useState<boolean>(false); // For create quiz API call
    const [isUploading, setIsUploading] = useState<string | null>(null); // ID of question whose image is uploading

    // Handle navigation back to quiz options
    const handleGoBack = () => {
        router.push('/create-quiz-options');
    };

    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert(
                        'Permission Required',
                        'We need access to your photo library to upload images.'
                    );
                }
            }
        })();
    }, []);

    const addQuestionField = () => {
        setQuestions(prevQuestions => [...prevQuestions, createNewQuestion()]);
    };

    const removeQuestionField = (idToRemove: string) => {
        if (questions.length <= 1) {
            Alert.alert("Cannot Remove", "You must have at least one question.");
            return;
        }
        Alert.alert("Remove Question", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Remove", style: "destructive", onPress: () => { setQuestions(prevQs => prevQs.filter(q => q.id !== idToRemove)); }}
        ]);
    };
    const handleImagePick = async (questionId: string) => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) { Alert.alert("Permission Denied", "Gallery access is required!"); return; }

        try {
            // Launch picker without cropping for reliability
            const pickerResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.7,
                // Ensure we get the actual file info on iOS
                exif: false
            });
            console.log('[handleImagePick] pickerResult:', pickerResult);

            if (!pickerResult.canceled && pickerResult.assets?.length) {
                const pickedImageUri = pickerResult.assets[0].uri;
                // Validate URI before using it
                if (!pickedImageUri || typeof pickedImageUri !== 'string') { 
                    Alert.alert("Error", "Could not get valid image URI."); 
                    return; 
                }
                console.log(`Image picked for Q ${questionId}, URI: ${pickedImageUri}`);
                setQuestions(prevQs => prevQs.map(q => q.id === questionId ? { ...q, imageUri: pickedImageUri, imageUrl: null } : q ));
                uploadImage(questionId, pickedImageUri);
            }
        } catch (error) {
            console.error("Image picker error:", error);
            Alert.alert("Error", "Failed to pick image. Please try again.");
        }
    };

    const uploadImage = async (questionId: string, localImageUri: string) => {
         setIsUploading(questionId);
         console.log(`[uploadImage] questionId: ${questionId}, localImageUri:`, localImageUri);
         try {
             // Ensure URI is valid before upload
             if (!localImageUri || typeof localImageUri !== 'string') {
                 throw new Error("Invalid image URI");
             }
             
             const response = await uploadQuestionImage(localImageUri) as ImageUploadResponse;
             console.log('[uploadImage] Response:', response);
             
             // The service now returns a standardized format with imageUrl
             if (!response.imageUrl) {
                 throw new Error("Upload did not return a valid image URL");
             }
             
             // Format the URL correctly with our helper
             const finalImageUrl = response.imageUrl;
             console.log(`[FRONTEND Create] Image Upload Success. Raw URL: ${finalImageUrl}`);
             
             // Store the original URL - we'll format it at display time
             setQuestions(prevQs => prevQs.map(q => 
                 q.id === questionId ? { ...q, imageUri: null, imageUrl: finalImageUrl } : q
             ));

         } catch (uploadError: any) {
             console.error(`[FRONTEND Create] Image upload failed for Q ${questionId}:`, uploadError);
             Alert.alert("Upload Failed", `Could not upload image: ${uploadError?.message || 'Unknown error'}`);
             // Clear image references on error
             setQuestions(prevQs => prevQs.map(q => q.id === questionId ? { ...q, imageUri: null, imageUrl: null } : q ));
         } finally {
             console.log(`[FRONTEND Create] Clearing upload indicator for ${questionId}`);
             setIsUploading(null);
         }
     };

    // --- Form Field Handlers ---
    const handleQuestionDataChange = (id: string, field: 'question' | 'option', value: string, optionIndex: number | null = null) => {
        setQuestions(prevQuestions => prevQuestions.map(q => {
            if (q.id === id) {
                if (field === 'question') return { ...q, question: value };
                if (field === 'option' && optionIndex !== null) { const newOptions = [...q.options]; newOptions[optionIndex] = value; return { ...q, options: newOptions }; }
            } return q; })
        );
    };

    const handleCorrectAnswerChange = (id: string, answerIndex: number) => {
        console.log(`[DEBUG] handleCorrectAnswerChange called with id: ${id}, answerIndex: ${answerIndex}`);
        setQuestions(prevQuestions => {
            const updatedQuestions = prevQuestions.map(q => 
                q.id === id ? { ...q, correctAnswerIndex: answerIndex } : q
            );
            console.log(`[DEBUG] Updated questions: ${JSON.stringify(updatedQuestions.map(q => ({ id: q.id, correctAnswerIndex: q.correctAnswerIndex })))}`);
            return updatedQuestions;
        });
    };

    const handleAddTag = (tag: string) => {
        const trimmed = tag.trim();
        if (!trimmed) return;
        if (tags.includes(trimmed)) return;
        setTags(prev => [...prev, trimmed]);
        setTagSearch('');
    };
    
    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    // Filter tags for modal suggestions
    const filteredTags = tagSearch.trim()
      ? POPULAR_TAGS.filter(t => t.toLowerCase().includes(tagSearch.toLowerCase()) && !tags.includes(t))
      : POPULAR_TAGS.filter(t => !tags.includes(t));

    const handleCreateQuiz = async () => {
        if (!title.trim()) { Alert.alert('Error', 'Quiz title required.'); return; }
        if (questions.length === 0) { Alert.alert('Error', 'Add at least one question.'); return; }
        let firstInvalidQuestion = -1;
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question.trim() || q.options.some(opt => !opt.trim()) || q.correctAnswerIndex === null) {
                firstInvalidQuestion = i + 1; break;
            }
        }
        if(firstInvalidQuestion > 0) { Alert.alert('Incomplete', `Please fill all fields and select a correct answer for Question ${firstInvalidQuestion}.`); return;}
        if (isUploading !== null) { Alert.alert('Wait', 'An image is still uploading.'); return; }

        // Prepare payload for quiz creation matching backend schema
        const questionsPayload: QuestionPayload[] = questions.map(
            ({ question: questionText, options, correctAnswerIndex, imageUrl }) => ({
                text: questionText,
                imageUrl: imageUrl ?? undefined,
                options: options.map((optText, idx) => ({
                    text: optText,
                    isCorrect: idx === correctAnswerIndex
                })),
            })
        );
        const quizData = { 
            title, 
            tags, 
            questions: questionsPayload, 
            createdBy: user?.username || 'Anonymous'
        };

        // API Call
        setIsLoading(true);
        try {
            console.log("[FRONTEND Create] Sending quiz data to API:", JSON.stringify(quizData, null, 2));
            const newQuiz: any = await createQuiz(quizData);
            Alert.alert('Success', `Quiz "${newQuiz.title || 'Quiz'}" created!`);
            router.back();
        } catch (error: any) {
            Alert.alert('Error', `Failed to create quiz: ${error?.message || 'Unknown error'}`);
            console.error("Create quiz API failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveImage = (id: string) => {
        setQuestions(prevQuestions => 
            prevQuestions.map(q => 
                q.id === id ? { ...q, imageUri: null, imageUrl: null } : q
            )
        );
    };

    // --- UI ---
    return (
        <View style={[styles.safeArea, { backgroundColor: theme.background }]}>
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
            
            <ScrollView style={[styles.container, { backgroundColor: theme.background }]} keyboardShouldPersistTaps="handled">
                {/* Form */}
                <Text style={[styles.label, { color: theme.text }]}>Quiz Title</Text>
                <TextInput 
                    style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.card }]} 
                    value={title} 
                    onChangeText={setTitle} 
                    placeholder="Enter quiz title"
                    placeholderTextColor={theme.secondaryText}
                />

                <Text style={[styles.label, { color: theme.text }]}>Tags</Text>
                
                {/* Selected tags */}
                {tags.length > 0 && (
                    <View style={styles.selectedTagsContainer}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Selected Tags ({tags.length})</Text>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            style={styles.selectedTagsScrollView}
                        >
                            {tags.map(tag => (
                                <View key={tag} style={[styles.selectedTag, { backgroundColor: theme.primary }]}>
                                    <Text style={styles.selectedTagText}>{tag}</Text>
                                    <TouchableOpacity 
                                        style={styles.selectedTagRemove} 
                                        onPress={() => handleRemoveTag(tag)}
                                    >
                                        <Ionicons name="close-circle" size={18} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <TouchableOpacity 
                    style={[styles.addTagsButton, { borderColor: theme.primary }]} 
                    onPress={() => setTagModalVisible(true)}
                >
                    <Text style={[styles.addTagsButtonText, { color: theme.primary }]}>Add Tags</Text>
                </TouchableOpacity>

            <View style={[styles.separator, { backgroundColor: theme.border }]} />
                
            {questions.map((question, index) => {
                // Image Preview - more defensive approach
                const previewUri = (() => {
                    try {
                        // For safety, validate URIs before returning them
                        // Local image URI takes precedence if it exists
                        if (question.imageUri && 
                            typeof question.imageUri === 'string' && 
                            question.imageUri !== 'null' && 
                            question.imageUri !== 'undefined') {
                            
                            // Special handling for iOS photo library URIs
                            if (Platform.OS === 'ios' && question.imageUri.startsWith('ph://')) {
                                console.log(`iOS photo library URI detected for question ${index+1}`);
                                // On iOS, we could add special handling here
                                // For now, we'll still return the URI and let the Image component try to handle it
                            }
                            
                            return question.imageUri;
                        }
                        
                        // Then try server image URL
                        if (question.imageUrl && 
                            typeof question.imageUrl === 'string' && 
                            question.imageUrl !== 'null' && 
                            question.imageUrl !== 'undefined') {
                            
                            // Format the URL correctly using our helper
                            return getImageUrl(question.imageUrl);
                        }
                        
                        // No valid image found
                        return null;
                    } catch (error) {
                        console.error(`Error processing image URI for question ${index+1}:`, error);
                        return null;
                    }
                })();

                return (
                    <View key={question.id} style={[styles.questionBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        {/* Question Header & Remove Button */}
                        <View style={[styles.questionBoxHeader, { borderBottomColor: theme.border }]}>
                           <Text style={[styles.questionHeader, { color: theme.text }]}>Question {index + 1}</Text>
                           {questions.length > 1 && (
                               <TouchableOpacity onPress={() => removeQuestionField(question.id)} style={styles.removeButton}>
                                        <Ionicons name="trash-outline" size={22} color={theme.error}/>
                               </TouchableOpacity>
                            )}
                        </View>
                            <TextInput 
                                style={[
                                    styles.input, 
                                    styles.questionInput, 
                                    { 
                                        color: theme.text, 
                                        borderColor: theme.border, 
                                        backgroundColor: theme.background 
                                    }
                                ]} 
                                value={question.question} 
                                onChangeText={(text) => handleQuestionDataChange(question.id, 'question', text)} 
                                placeholder={`Question ${index + 1} text`} 
                                multiline 
                                placeholderTextColor={theme.secondaryText}
                            />
                        <View style={styles.imageArea}>
                            {(previewUri || isUploading === question.id) && (
                                <View style={styles.previewImageContainer}>
                                    {isUploading === question.id ? (
                                        <View style={[styles.previewImage, { backgroundColor: theme.surface, justifyContent: 'center', alignItems: 'center' }]}>
                                            <ActivityIndicator size="small" color={theme.primary} />
                                        </View>
                                    ) : (
                                        <>
                                            <SafeImage 
                                                uri={previewUri} 
                                                style={styles.previewImage} 
                                                fallback={
                                                    <View style={[styles.previewImage, { backgroundColor: theme.surface, justifyContent: 'center', alignItems: 'center' }]}>
                                                        <Ionicons name="image-outline" size={24} color={theme.secondaryText} />
                                                    </View>
                                                }
                                            />
                                            <TouchableOpacity 
                                                style={[styles.removeImageButton, { backgroundColor: theme.error }]} 
                                                onPress={() => handleRemoveImage(question.id)}
                                            >
                                                <Ionicons name="close" size={16} color="#FFFFFF" />
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            )}
                            <TouchableOpacity 
                                style={[styles.imageButton, { backgroundColor: theme.surface }]} 
                                onPress={() => handleImagePick(question.id)} 
                                disabled={isUploading !== null}
                            >
                                <Ionicons name="image-outline" size={20} color={theme.primary} style={styles.imageIcon} />
                                <Text style={[styles.imageButtonText, { color: theme.primary }]}>{question.imageUrl ? "Change Image" : "Add Image"}</Text>
                            </TouchableOpacity>
                        </View>
                            <Text style={[styles.labelSmall, { color: theme.text }]}>Answer Options (Tap circle to mark correct)</Text>
                            {question.options.map((optionText, optionIndex) => (
                               <View key={optionIndex} style={styles.optionContainer}>
                                      <View style={[styles.optionInputWrapper, { borderColor: theme.border, backgroundColor: theme.background }]}>
                                          <Text style={[styles.optionLabel, { color: theme.secondaryText }]}>{String.fromCharCode(65 + optionIndex)}</Text>
                                          <TextInput 
                                              style={[styles.optionInput, { color: theme.text }]} 
                                              value={optionText} 
                                              onChangeText={(text) => handleQuestionDataChange(question.id, 'option', text, optionIndex)} 
                                              placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                                              placeholderTextColor={theme.secondaryText}
                                          />
                                      </View>
                                  <TouchableOpacity 
                                    style={[
                                        styles.radio, 
                                        question.correctAnswerIndex === optionIndex && styles.radioSelected,
                                        { borderColor: theme.primary },
                                        question.correctAnswerIndex === optionIndex && { borderColor: theme.success }
                                    ]} 
                                    onPress={() => {
                                      handleCorrectAnswerChange(question.id, optionIndex);
                                    }} 
                                      >
                                        {question.correctAnswerIndex === optionIndex && 
                                          <View style={[styles.radioInner, { backgroundColor: theme.success }]} />
                                        }
                                      </TouchableOpacity>
                                </View>
                             ))}
                        </View>
                    );
                })}
                    
                <TouchableOpacity 
                    style={[
                        styles.addQuestionButton,
                        { backgroundColor: theme.surface }
                    ]} 
                    onPress={addQuestionField} 
                    disabled={isUploading !== null}
                >
                    <Ionicons name="add-circle-outline" size={20} color={theme.primary} style={styles.buttonIcon} />
                    <Text style={[styles.addQuestionButtonText, { color: theme.primary }]}>Add Question</Text>
                </TouchableOpacity>
            <View style={[styles.separator, { backgroundColor: theme.border }]} />
                
                <TouchableOpacity 
                    style={[
                        styles.submitButton, 
                        (isLoading || isUploading !== null) && styles.disabledButton,
                        { backgroundColor: theme.primary }
                    ]} 
                    onPress={handleCreateQuiz} 
                    disabled={isLoading || isUploading !== null}
                 >
                    {isLoading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.submitButtonText}>Create Quiz</Text>
                    )}
                </TouchableOpacity>
                
            <View style={{ height: 50 }} />
             </ScrollView>

             {/* Tags Modal */}
             <Modal 
                 visible={tagModalVisible} 
                 animationType="slide" 
                 transparent={false}
                 onRequestClose={() => setTagModalVisible(false)}
             >
                 <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
                     <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                         <TouchableOpacity onPress={() => setTagModalVisible(false)} style={styles.modalBackButton}>
                             <Ionicons name="arrow-back" size={24} color={theme.text} />
                         </TouchableOpacity>
                         <Text style={[styles.modalTitle, { color: theme.text }]}>Select Tags</Text>
                         <View style={styles.modalBackButton} />
                     </View>
                     
                     <KeyboardAvoidingView 
                         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                         style={styles.modalContent}
                         keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
                     >
                         <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                             <View style={styles.modalInnerContent}>
                                 <View style={[styles.modalSearchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                     <Ionicons name="search" size={20} color={theme.secondaryText} style={styles.modalSearchIcon} />
                                     <TextInput
                                         style={[styles.modalSearchInput, { color: theme.text }]}
                                         value={tagSearch}
                                         onChangeText={setTagSearch}
                                         placeholder="Search or add tag..."
                                         placeholderTextColor={theme.secondaryText}
                                         returnKeyType="done"
                                         onSubmitEditing={() => {
                                             if (tagSearch.trim()) {
                                                 handleAddTag(tagSearch);
                                             }
                                             Keyboard.dismiss();
                                         }}
                                     />
                                     {tagSearch.length > 0 && (
                                         <TouchableOpacity onPress={() => setTagSearch('')}>
                                             <Ionicons name="close-circle" size={20} color={theme.secondaryText} />
                                         </TouchableOpacity>
                                     )}
                                 </View>
                                 
                                 {/* Add custom tag suggestion chip if not in premade or selected */}
                                 {tagSearch.trim() && !POPULAR_TAGS.includes(tagSearch.trim()) && !tags.includes(tagSearch.trim()) && (
                                     <View style={styles.modalCustomTagSuggestionContainer}>
                                         <TouchableOpacity
                                             style={[styles.modalCustomTagSuggestion, { backgroundColor: theme.primary }]}
                                             onPress={() => {
                                                 handleAddTag(tagSearch);
                                                 Keyboard.dismiss();
                                             }}
                                         >
                                             <Text style={styles.modalCustomTagSuggestionText}>Add "{tagSearch.trim()}"</Text>
                                         </TouchableOpacity>
                                     </View>
                                 )}
                                 
                                 {/* Selected Tags section */}
                                 {tags.length > 0 && (
                                     <View style={styles.modalSelectedTagsSection}>
                                         <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Selected Tags</Text>
                                         <View style={styles.modalSelectedTagsContainer}>
                                             {tags.map(tag => (
                                                 <View key={tag} style={[styles.modalSelectedTag, { backgroundColor: theme.surface }]}>
                                                     <Text style={[styles.modalSelectedTagText, { color: theme.text }]}>{tag}</Text>
                                                     <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                                                         <Ionicons name="close-circle" size={18} color={theme.primary} />
                                                     </TouchableOpacity>
                                                 </View>
                                             ))}
                                         </View>
                                     </View>
                                 )}
                                 
                                 {/* Suggested Tags section */}
                                 <View style={styles.modalSuggestedTagsSection}>
                                     {(!tagSearch.trim() || filteredTags.length > 0) && (
                                         <Text style={[styles.modalSectionTitle, { color: theme.text }]}>Suggested Tags</Text>
                                     )}
                                     <ScrollView 
                                         contentContainerStyle={styles.modalTagsList}
                                         keyboardShouldPersistTaps="handled"
                                     >
                                         {filteredTags.length > 0 ? (
                                             filteredTags.map(tag => (
                                                 <TouchableOpacity
                                                     key={tag}
                                                     style={[styles.modalTagButton, { borderColor: theme.primary, backgroundColor: theme.surface }]}
                                                     onPress={() => {
                                                         handleAddTag(tag);
                                                         Keyboard.dismiss();
                                                     }}
                                                 >
                                                     <Text style={[styles.modalTagText, { color: theme.primary }]}>{tag}</Text>
                                                 </TouchableOpacity>
                                             ))
                                         ) : (
                                             !tagSearch.trim() && (
                                                 <Text style={[styles.noTagsMessage, { color: theme.secondaryText }]}>
                                                     No more tags available
                                                 </Text>
                                             )
                                         )}
                                     </ScrollView>
                                 </View>
                             </View>
                         </TouchableWithoutFeedback>
                     </KeyboardAvoidingView>
                     
                     <TouchableOpacity 
                         style={[styles.doneButton, { backgroundColor: theme.primary }]}
                         onPress={() => setTagModalVisible(false)}
                     >
                         <Text style={styles.doneButtonText}>Done</Text>
                     </TouchableOpacity>
                 </SafeAreaView>
             </Modal>
          </View>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    safeArea: { 
        flex: 1, 
        backgroundColor: '#F2F2F7' // iOS background gray
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
    container: { 
        flex: 1, 
        padding: 16, 
        backgroundColor: '#F2F2F7' 
    },
    label: { 
        fontSize: 17, 
        fontWeight: '600', 
        marginTop: 20, 
        marginBottom: 8, 
        color: '#1C1C1E' 
    },
    multilineInput: { 
        minHeight: 80, 
        textAlignVertical: 'top',
        paddingTop: 12
    },
    questionInput: {
        minHeight: 60,
        textAlignVertical: 'top',
        paddingTop: 12
    },
    input: { 
        borderWidth: 1, 
        borderColor: '#D1D1D6', 
        padding: 12, 
        borderRadius: 10, 
        backgroundColor: '#FFFFFF', 
        fontSize: 17,
        marginBottom: 16,
        color: '#1C1C1E'
    },
    separator: { 
        height: 1, 
        backgroundColor: '#D1D1D6', 
        marginVertical: 24 
    },
    questionBox: { 
        borderRadius: 12, 
        padding: 16, 
        marginBottom: 24, 
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2
    },
    questionBoxHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 15, 
        borderBottomWidth: 1, 
        borderBottomColor: '#E5E5EA', 
        paddingBottom: 10 
    },
    questionHeader: { 
        fontSize: 18, 
        fontWeight: '600', 
        color: '#1C1C1E' 
    },
    removeButton: { 
        padding: 8 
    },
    imageArea: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 16
    },
    previewImageContainer: {
        width: 80,
        height: 60,
        borderRadius: 8,
        marginRight: 16,
        backgroundColor: '#E5E5EA',
        overflow: 'hidden'
    },
    previewImage: { 
        width: '100%', 
        height: '100%', 
        borderRadius: 8
    },
    uploadIndicator: { 
        marginRight: 16 
    },
    imageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#E5E5EA' 
    },
    imageIcon: {
        marginRight: 8
    },
    imageButtonText: {
        color: '#007AFF',
        fontWeight: '600',
        fontSize: 15
    },
    labelSmall: { 
        fontSize: 15, 
        fontWeight: '600', 
        marginTop: 16, 
        marginBottom: 12, 
        color: '#1C1C1E' 
    },
    optionContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 12 
    },
    optionInputWrapper: {
        flex: 1, 
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1, 
        borderColor: '#D1D1D6', 
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        marginRight: 12
    },
    optionLabel: {
        paddingHorizontal: 12,
        fontSize: 17,
        fontWeight: '600',
        color: '#8E8E93'
    },
    optionInput: { 
        flex: 1,
        padding: 12, 
        fontSize: 17,
        color: '#1C1C1E'
    },
    radio: { 
        height: 24, 
        width: 24, 
        borderRadius: 12, 
        borderWidth: 2, 
        borderColor: '#007AFF', 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    radioSelected: { 
        borderColor: '#007AFF'
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#007AFF'
    },
    addQuestionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#E5E5EA'
    },
    buttonIcon: {
        marginRight: 8
    },
    addQuestionButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#007AFF'
    },
    submitButton: {
        padding: 16,
        borderRadius: 10,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8
    },
    disabledButton: {
        backgroundColor: '#A2D1FF',
    },
    submitButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFFFFF'
    },
    tagInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D1D6',
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 16
    },
    tagInputIcon: {
        marginRight: 8
    },
    tagInput: {
        flex: 1,
        height: 40,
        fontSize: 17,
        color: '#1C1C1E'
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 8
    },
    suggestedTagsContainer: {
        marginBottom: 16
    },
    tagChipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    tagChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#E5E5EA',
        marginRight: 8,
        marginBottom: 8
    },
    tagChipText: {
        fontSize: 15,
        color: '#007AFF',
        fontWeight: '500'
    },
    selectedTagsContainer: {
        marginBottom: 16
    },
    selectedTagsScrollView: {
        marginBottom: 8
    },
    selectedTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        borderRadius: 16,
        paddingLeft: 12,
        paddingRight: 8,
        paddingVertical: 6,
        marginRight: 8
    },
    selectedTagText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '500',
        marginRight: 4
    },
    selectedTagRemove: {
        padding: 2
    },
    addTagsButton: {
        marginTop: 8,
        alignSelf: 'flex-start',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#007AFF',
        borderRadius: 10,
    },
    addTagsButtonText: {
        color: '#007AFF',
        fontSize: 17,
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    modalBackButton: {
        padding: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        flex: 1,
        textAlign: 'center',
    },
    modalContent: {
        flex: 1,
    },
    modalSearchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 16,
        paddingHorizontal: 12,
        height: 44,
        borderRadius: 10,
        borderWidth: 1,
    },
    modalSearchIcon: {
        marginRight: 8,
    },
    modalSearchInput: {
        flex: 1,
        height: '100%',
        fontSize: 17,
    },
    modalCustomTagSuggestionContainer: {
        marginHorizontal: 16,
        marginBottom: 12,
    },
    modalCustomTagSuggestion: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    modalCustomTagSuggestionText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    modalTagsList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
    },
    modalTagButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1,
        margin: 4,
    },
    modalTagText: {
        fontSize: 15,
    },
    modalSelectedTagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
    },
    modalSelectedTag: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 8,
    },
    modalSelectedTagText: {
        fontSize: 15,
        marginRight: 4,
    },
    modalSelectedTagsSection: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
    modalSuggestedTagsSection: {
        flex: 1,
        marginVertical: 8,
    },
    noTagsMessage: {
        fontSize: 16,
        fontWeight: '400',
        textAlign: 'center',
        padding: 20,
    },
    doneButton: {
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginVertical: 16,
    },
    doneButtonText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#FFFFFF'
    },
    tagSearchInput: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#D1D1D6',
        borderRadius: 10,
        marginBottom: 16,
    },
    popularTagsTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 8
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageButton: {
        padding: 4,
        borderRadius: 4,
        backgroundColor: '#E5E5EA',
        position: 'absolute',
        top: 4,
        right: 4,
    },
    modalSectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        paddingHorizontal: 16,
    },
    modalInnerContent: {
        flex: 1,
    },
});

export default CreateQuizScreenMVP;