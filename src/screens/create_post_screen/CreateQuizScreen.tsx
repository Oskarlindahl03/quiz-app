import React, { useState, useCallback } from 'react';
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
    ActivityIndicator 
} from 'react-native';
import { createQuiz, uploadQuestionImage } from '../../services/quiz_service'; 
import { useNavigation } from '@react-navigation/native';
import uuid from 'react-native-uuid'; 
import * as ImagePicker from 'expo-image-picker'; 
import Ionicons from '@expo/vector-icons/Ionicons';



const API_BASE_URL = 'http://192.168.0.28:3000'; 

interface QuestionDraft {
    id: string;
    question: string;
    options: string[];
    correctAnswerIndex: number | null;
    imageUri?: string | null;
    imageUrl?: string | null;
}

interface QuestionPayload {
    question: string;
    options: string[];
    correctAnswerIndex: number;
    image?: string | null; 
}

const PLACEHOLDER_USER_ID = '65dd20b9f358f48b97cf575a'; 

const createNewQuestion = (): QuestionDraft => ({
    id: uuid.v4() as string,
    question: '',
    options: ['', '', '', ''],
    correctAnswerIndex: null,
    imageUri: null,
    imageUrl: null,
});

const CreateQuizScreenMVP = () => {
    const navigation = useNavigation();
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [questions, setQuestions] = useState<QuestionDraft[]>([createNewQuestion()]);
    const [isLoading, setIsLoading] = useState<boolean>(false); // For create quiz API call
    const [isUploading, setIsUploading] = useState<string | null>(null); // ID of question whose image is uploading

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

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [4, 3], quality: 0.7,
        });

        if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets[0]) {
             const pickedImageUri = pickerResult.assets[0].uri;
             if (!pickedImageUri) { Alert.alert("Error", "Could not get image URI."); return; }
             console.log(`Image picked for Q ${questionId}, URI: ${pickedImageUri}`);
             setQuestions(prevQs => prevQs.map(q => q.id === questionId ? { ...q, imageUri: pickedImageUri, imageUrl: null } : q ));
             uploadImage(questionId, pickedImageUri);
        }
    };

    const uploadImage = async (questionId: string, localImageUri: string) => {
         setIsUploading(questionId);
         try {
             const uploadResponse = await uploadQuestionImage(localImageUri);
             if (!uploadResponse?.filePath) throw new Error("Upload did not return filePath.");

             const serverImageUrl = uploadResponse.filePath;
             console.log(`[FRONTEND Create] Image Upload Success. Path: ${serverImageUrl}`);
             setQuestions(prevQs => prevQs.map(q => q.id === questionId ? { ...q, imageUri: null, imageUrl: serverImageUrl } : q ));

         } catch (uploadError: any) {
              console.error(`[FRONTEND Create] Image upload failed for Q ${questionId}:`, uploadError);
              Alert.alert("Upload Failed", `Could not upload image: ${uploadError?.message || 'Unknown error'}`);
              setQuestions(prevQs => prevQs.map(q => q.id === questionId ? { ...q, imageUri: null, imageUrl: null } : q )); // Clear preview on error
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

        // Prepare payload for quiz creation
        const questionsPayload: QuestionPayload[] = questions.map(
            ({ id, question, options, correctAnswerIndex, imageUrl }) => {
                console.log(`[DEBUG] Preparing question payload: id=${id}, correctAnswerIndex=${correctAnswerIndex}`);
                return {
                    question, 
                    options, 
                    image: imageUrl ?? undefined,
                    correctAnswerIndex: correctAnswerIndex!,
                };
            }
        );
        const quizData = { title, description, questions: questionsPayload, createdBy: PLACEHOLDER_USER_ID};

        // API Call
        setIsLoading(true);
        try {
            console.log("[FRONTEND Create] Sending quiz data to API:", JSON.stringify(quizData, null, 2));
            const newQuiz = await createQuiz(quizData);
            Alert.alert('Success', `Quiz "${newQuiz?.title || 'Quiz'}" created!`);
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Error', `Failed to create quiz: ${error?.message || 'Unknown error'}`);
            console.error("Create quiz API failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- UI ---
    return (
        <ScrollView style={styles.container} keyboardShouldPersistTaps="handled" >
            <Text style={styles.label}>Quiz Title</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Enter quiz title"/>

            <Text style={styles.label}>Description</Text>
            <TextInput style={styles.input} value={description} onChangeText={setDescription} multiline placeholder="Enter description (optional)"/>

            <View style={styles.separator} />
            {questions.map((question, index) => (
                <View key={question.id} style={styles.questionBox}>
                    {/* Question Header & Remove Button */}
                    <View style={styles.questionBoxHeader}>
                       <Text style={styles.questionHeader}>Question {index + 1}</Text>
                       {questions.length > 1 && (
                           <TouchableOpacity onPress={() => removeQuestionField(question.id)} style={styles.removeButton}>
                                <Text style={styles.removeButtonText}>Remove</Text>
                                <Text><Ionicons name="trash-outline" size={20} color="#E74C3C"/></Text>
                           </TouchableOpacity>
                        )}
                    </View>
                    <TextInput style={styles.input} value={question.question} onChangeText={(text) => handleQuestionDataChange(question.id, 'question', text)} placeholder={`Question ${index + 1} text`} multiline />
                    <View style={styles.imageArea}>
                       { (question.imageUrl || question.imageUri) &&
                           <Image
                               source={{ uri: question.imageUrl ? `${API_BASE_URL}${question.imageUrl}` : question.imageUri! }}
                               style={styles.previewImage}
                               onError={(e) => console.error(`Image load error (Q${index+1}): ${e.nativeEvent.error}`)}
                           />
                       }
                       {isUploading === question.id && <ActivityIndicator size="small" style={styles.uploadIndicator}/>}
                       <Button title={question.imageUrl ? "Change Image" : "Add Image"} onPress={() => handleImagePick(question.id)} disabled={isUploading !== null}/>
                   </View>
                    <Text style={styles.labelSmall}>Answer Options (Mark Correct)</Text>
                    {question.options.map((optionText, optionIndex) => (
                       <View key={optionIndex} style={styles.optionContainer}>
                          <TextInput style={styles.optionInput} value={optionText} onChangeText={(text) => handleQuestionDataChange(question.id, 'option', text, optionIndex)} placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}/>
                          <TouchableOpacity 
                            style={[styles.radio, question.correctAnswerIndex === optionIndex && styles.radioSelected]} 
                            onPress={() => {
                              console.log(`[DEBUG] Setting correct answer for question ${index+1} to option ${optionIndex}`);
                              handleCorrectAnswerChange(question.id, optionIndex);
                            }} 
                          />
                        </View>
                     ))}
                </View>
            ))}
            <Button title="Add Another Question" onPress={addQuestionField} disabled={isUploading !== null} />
            <View style={styles.separator} />
            <Button title={(isLoading || isUploading) ? "Saving..." : "Create Quiz"} onPress={handleCreateQuiz} disabled={isLoading || (isUploading !== null)} color="#4CAF50"/>
            <View style={{ height: 50 }} />

        </ScrollView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, padding: 15, backgroundColor: '#f9f9f9' },
    label: { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
    labelSmall: { fontSize: 14, fontWeight: 'bold', marginTop: 10, marginBottom: 5, color: '#333' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5, backgroundColor: 'white' },
    separator: { height: 1, backgroundColor: '#eee', marginVertical: 25 },
    questionBox: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 15, marginBottom: 20, backgroundColor: '#fff' },
    questionBoxHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
    questionHeader: { fontSize: 16, fontWeight: '600', color: '#555' },
    removeButton: { paddingHorizontal: 10, paddingVertical: 5 },
    removeButtonText: { color: '#E74C3C', fontWeight: '500' },
    imageArea: { flexDirection: 'row', alignItems: 'center', marginVertical: 10, },
    previewImage: { width: 80, height: 60, borderRadius: 4, marginRight: 10, backgroundColor: '#eee' },
    uploadIndicator: { marginRight: 10, },
    optionContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    optionInput: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginRight: 10, backgroundColor: 'white'},
    radio: { height: 24, width: 24, borderRadius: 12, borderWidth: 2, borderColor: '#007AFF', alignItems: 'center', justifyContent: 'center', marginLeft: 5 },
    radioSelected: { backgroundColor: '#007AFF' },
});

export default CreateQuizScreenMVP;