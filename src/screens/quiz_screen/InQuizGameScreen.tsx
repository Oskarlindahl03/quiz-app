import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ActivityIndicator, Button, Alert,
    TouchableOpacity, Image, SafeAreaView, Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { getQuizById } from '../../services/quiz_service';
import Ionicons from '@expo/vector-icons/Ionicons';
import { apiBaseUrl } from '@/src/services/api.js';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/HomeScreenNavigator';

// --- Constants ---
const { width } = Dimensions.get('window');
const optionPaddingHorizontal = 10;
const optionMargin = 6;
const columns = 2;
const optionWidth = (width - (optionMargin * (columns + 1)) * 2) / columns;

// --- Type Definitions ---
interface QuizQuestion {
    _id: string;
    question: string;
    options: string[];
    correctAnswerIndex: number;
    image?: string;
}

interface QuizData {
    _id: string;
    title: string;
    questions: QuizQuestion[];
    timePerQuestion?: number;
}

// Use type from React Navigation
type InQuizGameScreenProps = NativeStackScreenProps<HomeStackParamList, 'InQuizGame'>;

// --- Component ---
const InQuizGameScreen = ({ route }: InQuizGameScreenProps) => {
    const { quizId } = route.params;
    const router = useRouter();

    // --- State Variables with Types ---
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [quizData, setQuizData] = useState<QuizData | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [score, setScore] = useState<number>(0);
    const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
    const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(15);
    const [questionResults, setQuestionResults] = useState<boolean[]>([]);
    const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
    const [showAnswerConfirmation, setShowAnswerConfirmation] = useState<boolean>(false);
    const [lastSelectedAnswer, setLastSelectedAnswer] = useState<number | null>(null);
    const [lastCorrectAnswer, setLastCorrectAnswer] = useState<number | null>(null);
    const [lastQuestionText, setLastQuestionText] = useState<string>('');
    const [lastQuestionOptions, setLastQuestionOptions] = useState<string[]>([]);
    const [countdownTimer, setCountdownTimer] = useState<number>(3);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchQuiz = async () => {
            if (!quizId) { 
                setError("Error: Missing Quiz ID."); 
                setLoading(false); 
                Alert.alert("Error", "Cannot load quiz."); 
                return; 
            }
            setLoading(true); 
            setError(null);
            try {
                const data = await getQuizById(quizId);
                if (!data?.questions?.length) { 
                    throw new Error("Invalid quiz data or no questions found."); 
                }
                if(data.questions[0]) {
                    console.log(`[FRONTEND InGame] Image path for Q1 from fetched data: ${data.questions[0].image}`);
                }
                setQuizData(data);
                setTimeLeft(data.timePerQuestion || 15);
                setQuestionResults(new Array(data.questions.length).fill(false));
                console.log(`[DEBUG] Initialized question results array with length: ${data.questions.length}`);
            } catch (err) {
                let errorMessage = 'Failed to load quiz data.';
                if (err instanceof Error) errorMessage = err.message;
                else if (typeof err === 'string') errorMessage = err;
                console.error("Fetch quiz error:", err);
                setError(errorMessage);
                Alert.alert("Error", "Could not load quiz data.");
            } finally { 
                setLoading(false); 
            }
        };
        fetchQuiz();
    }, [quizId]);

    // --- Timer Logic ---
    useEffect(() => {
        const answered = selectedAnswerIndex !== null;
        if (loading || !quizData || answered || timeLeft <= 0) return;
        const intervalId = setInterval(() => { 
            setTimeLeft((prevTime) => prevTime - 1); 
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft, loading, quizData, selectedAnswerIndex]);

    // --- Time Up Handling ---
    useEffect(() => {
        const answered = selectedAnswerIndex !== null;
        if (timeLeft === 0 && !answered && !loading && quizData) {
            setIsAnswerCorrect(false); 
            setTimeout(() => { 
                goToNextQuestion(); 
            }, 1000);
        }
    }, [timeLeft, selectedAnswerIndex, loading, quizData]);

    // --- Helper: Get Current Question ---
    const currentQuestion: QuizQuestion | undefined = quizData?.questions?.[currentQuestionIndex];
    const totalQuestions: number = quizData?.questions?.length || 0;

    // Add debug logging for current question
    useEffect(() => {
        if (currentQuestion) {
            console.log(`[DEBUG] Current question: ${currentQuestion.question}`);
            console.log(`[DEBUG] Correct answer index: ${currentQuestion.correctAnswerIndex}`);
            console.log(`[DEBUG] Options: ${JSON.stringify(currentQuestion.options)}`);
            
            if (currentQuestion.correctAnswerIndex === undefined || currentQuestion.correctAnswerIndex === null) {
                console.warn(`[WARNING] correctAnswerIndex is ${currentQuestion.correctAnswerIndex} for question: ${currentQuestion.question}`);
                console.warn(`[WARNING] Setting default correctAnswerIndex to 0 for this question`);
                
                if (quizData && quizData.questions) {
                    const updatedQuestions = [...quizData.questions];
                    updatedQuestions[currentQuestionIndex] = {
                        ...currentQuestion,
                        correctAnswerIndex: 0
                    };
                    setQuizData({
                        ...quizData,
                        questions: updatedQuestions
                    });
                }
            }
        }
    }, [currentQuestion, currentQuestionIndex, quizData]);

    useEffect(() => {
        console.log('apiBaseUrl:', apiBaseUrl);
        if (currentQuestion?.image) {
            console.log('Full image URL:', `${apiBaseUrl}${currentQuestion.image}`);
        }
    }, [currentQuestion]);

    const goToNextQuestion = useCallback(() => {
        const nextIndex = currentQuestionIndex + 1;
        console.log(`[DEBUG] Going to next question. Current index: ${currentQuestionIndex}, next index: ${nextIndex}, total questions: ${totalQuestions}`);
        console.log(`[DEBUG] Current score: ${score}, question results: ${JSON.stringify(questionResults)}`);
        
        if (quizData && nextIndex < totalQuestions) {
            setCurrentQuestionIndex(nextIndex);
            setSelectedAnswerIndex(null);
            setIsAnswerCorrect(null);
            setTimeLeft(quizData.timePerQuestion || 15);
        } else {
            const finalScore = questionResults.filter(result => result === true).length;
            console.log(`[DEBUG] Quiz finished. Final score: ${finalScore}/${totalQuestions}`);
            console.log(`[DEBUG] Question results: ${JSON.stringify(questionResults)}`);
            Alert.alert("Quiz Finished", `Your score: ${finalScore}/${totalQuestions}`);
            router.back();
        }
    }, [currentQuestionIndex, quizData, totalQuestions, questionResults, router]);

    const handleContinueToNextQuestion = useCallback(() => {
        setShowAnswerConfirmation(false);
        goToNextQuestion();
    }, [goToNextQuestion]);

    useEffect(() => {
        if (showAnswerConfirmation && countdownTimer > 0) {
            const timer = setTimeout(() => {
                setCountdownTimer(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (showAnswerConfirmation && countdownTimer === 0) {
            handleContinueToNextQuestion();
        }
    }, [showAnswerConfirmation, countdownTimer, handleContinueToNextQuestion]);

    const handleAnswerSelect = useCallback((index: number) => {
        const answered = selectedAnswerIndex !== null;
        if (answered || !currentQuestion) return;
    
        setSelectedAnswerIndex(index);
        setLastSelectedAnswer(index);
        setLastQuestionText(currentQuestion.question);
        setLastQuestionOptions(currentQuestion.options);
        
        const correctAnswerIndex = currentQuestion.correctAnswerIndex;
        if (correctAnswerIndex === undefined || correctAnswerIndex === null) {
            console.error(`[ERROR] correctAnswerIndex is ${correctAnswerIndex} for question: ${currentQuestion.question}`);
            setIsAnswerCorrect(false);
            setLastCorrectAnswer(0);
            setQuestionResults(prev => {
                const newResults = [...prev];
                newResults[currentQuestionIndex] = false;
                console.log(`[DEBUG] Updated question results (error case): ${JSON.stringify(newResults)}`);
                return newResults;
            });
        } else {
            const correct = index === correctAnswerIndex;
            console.log(`[DEBUG] Answer selected: ${index}, correct answer: ${correctAnswerIndex}, is correct: ${correct}`);
            setIsAnswerCorrect(correct);
            setLastCorrectAnswer(correctAnswerIndex);
            
            setQuestionResults(prev => {
                const newResults = [...prev];
                newResults[currentQuestionIndex] = correct;
                console.log(`[DEBUG] Updated question results: ${JSON.stringify(newResults)}`);
                
                const newScore = newResults.filter(result => result === true).length;
                console.log(`[DEBUG] Updating score to ${newScore} based on question results`);
                setScore(newScore);
                
                return newResults;
            });
        }
        
        setShowAnswerConfirmation(true);
        setCountdownTimer(3);
    }, [selectedAnswerIndex, currentQuestion, currentQuestionIndex]);

    const handleQuit = () => {
        Alert.alert("Quit Quiz", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Quit", style: "destructive", onPress: () => router.back() },
        ]);
    };

    if (loading) { 
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
                <Text>Loading Quiz...</Text>
            </View>
        ); 
    }
    
    if (error) { 
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>{error}</Text>
                <Button title="Go Back" onPress={() => router.back()} />
            </View>
        ); 
    }
    
    if (!quizData || !currentQuestion) { 
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Quiz data unavailable or error finding question.</Text>
                <Button title="Go Back" onPress={() => router.back()} />
            </View>
        ); 
    }

    // --- Dynamic Styling Function ---
    const getOptionStyle = (index: number) => {
        const isSelected = selectedAnswerIndex === index;
        const isCorrect = currentQuestion.correctAnswerIndex === index;
        const answered = selectedAnswerIndex !== null;
        let buttonStyle: any[] = [styles.optionButton, { width: optionWidth }];

        const baseColors = ['#9B5DE5', '#F15BB5', '#00BBF9', '#00F5D4'];
        buttonStyle.push({ backgroundColor: baseColors[index % baseColors.length] });

        if (answered) {
            if (isCorrect) buttonStyle.push(styles.correctAnswer);
            if (isSelected && !isCorrect) buttonStyle.push(styles.incorrectAnswer);
            if (!isSelected && !isCorrect) buttonStyle.push({ opacity: 0.6 });
        }
        return buttonStyle;
    };

    // Render the answer confirmation screen if needed
    if (showAnswerConfirmation) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Answer Feedback</Text>
                    </View>
                    
                    <View style={styles.feedbackContainer}>
                        <Text style={styles.questionText}>{lastQuestionText}</Text>
                        
                        <View style={styles.feedbackResult}>
                            <Text style={[
                                styles.feedbackText, 
                                isAnswerCorrect ? styles.correctFeedbackText : styles.incorrectFeedbackText
                            ]}>
                                {isAnswerCorrect ? "Correct!" : "Incorrect"}
                            </Text>
                        </View>
                        
                        <View style={styles.answerExplanation}>
                            <Text style={styles.explanationTitle}>Your answer:</Text>
                            <Text style={[
                                styles.answerText,
                                isAnswerCorrect ? styles.correctAnswerText : styles.incorrectAnswerText
                            ]}>
                                {lastSelectedAnswer !== null ? lastQuestionOptions[lastSelectedAnswer] : "No answer selected"}
                            </Text>
                            
                            {!isAnswerCorrect && (
                                <>
                                    <Text style={styles.explanationTitle}>Correct answer:</Text>
                                    <Text style={styles.correctAnswerText}>
                                        {lastCorrectAnswer !== null ? lastQuestionOptions[lastCorrectAnswer] : "Unknown"}
                                    </Text>
                                </>
                            )}
                        </View>
                        
                        <View style={styles.scoreContainer}>
                            <Text style={styles.scoreText}>Current Score: {score}/{currentQuestionIndex + 1}</Text>
                        </View>
                        
                        <View style={styles.countdownContainer}>
                            <Text style={styles.countdownText}>Next question in: {countdownTimer}</Text>
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.continueButton}
                            onPress={handleContinueToNextQuestion}
                        >
                            <Text style={styles.continueButtonText}>
                                {currentQuestionIndex + 1 < totalQuestions ? "Continue to Next Question" : "Finish Quiz"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Medias</Text>
                    <TouchableOpacity onPress={handleQuit} style={styles.quitButton}>
                        <Text style={styles.quitButtonText}>Quit</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.statsContainer}>
                    <Text style={styles.statsText}>Time remaining: {timeLeft}s</Text>
                    <Text style={styles.statsText}>{currentQuestionIndex + 1}/{totalQuestions} questions</Text>
                </View>
                <View style={styles.imagePlaceholder}>
                    {currentQuestion?.image ? (() => {
                        const imageUrl = `${apiBaseUrl}${currentQuestion.image}`;
                        console.log(`[FRONTEND InGame] Setting Image source.uri to: ${imageUrl}`);
                        return (
                            <Image 
                                source={{ uri: `${apiBaseUrl.replace(/\/api$/, '')}${currentQuestion.image}` }} 
                                style={styles.image}
                                resizeMode='cover'
                                onError={(e) => console.error('Image failed to load:', e.nativeEvent.error)}
                            />
                        );
                    })() : (
                        <Text style={styles.imagePlaceholderText}>Picture</Text>
                    )}
                </View>

                <View style={styles.questionContainer}>
                    <Text style={styles.questionText}>{currentQuestion.question}</Text>
                </View>
                <View style={styles.optionsContainer}>
                    {currentQuestion.options.map((option, index) => (
                        <TouchableOpacity
                            key={`${currentQuestion._id}-${index}`}
                            style={getOptionStyle(index)}
                            onPress={() => handleAnswerSelect(index)}
                            disabled={selectedAnswerIndex !== null}>
                            <Text style={styles.optionText}>{option.replace(/^[A-D]\.\s*/,'')}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={{height:20}}/>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#FFFDE7' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    container: { flex: 1, padding: optionPaddingHorizontal },
    errorText: { color: 'red', fontSize: 16, textAlign: 'center', marginBottom: 15 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 5 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#F15BB5' },
    quitButton: { backgroundColor: '#F15BB5', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
    quitButtonText: { color: 'white', fontWeight: 'bold' },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, paddingHorizontal: 5 },
    statsText: { fontSize: 14, color: '#555' },
    imagePlaceholder: { width: '100%', height: 160, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderRadius: 8 },
    imagePlaceholderText: { color: '#7f8c8d', fontSize: 18 },
    image: { width: '100%', height: 160, borderRadius: 8, resizeMode: 'cover' },
    questionContainer: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 15, minHeight: 70, justifyContent: 'center', alignItems: 'center' },
    questionText: { fontSize: 17, fontWeight: '500', textAlign: 'center' },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        marginHorizontal: -optionMargin
    },
    optionButton: {
        width: optionWidth,
        paddingVertical: 20,
        paddingHorizontal: 10,
        borderRadius: 12,
        margin: optionMargin,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 60,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
    },
    optionText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
        textAlign: 'center'
    },
    correctAnswer: {
        borderWidth: 3,
        borderColor: '#2ecc71AA'
    },
    incorrectAnswer: {
        borderWidth: 3,
        borderColor: '#e74c3CAA'
    },
    feedbackContainer: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    feedbackResult: {
        marginVertical: 20,
        padding: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
    },
    feedbackText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    correctFeedbackText: {
        color: '#2ecc71',
    },
    incorrectFeedbackText: {
        color: '#e74c3c',
    },
    answerExplanation: {
        width: '100%',
        marginVertical: 20,
    },
    explanationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        color: '#555',
    },
    answerText: {
        fontSize: 18,
        marginTop: 5,
        marginBottom: 15,
    },
    correctAnswerText: {
        color: '#2ecc71',
        fontWeight: 'bold',
    },
    incorrectAnswerText: {
        color: '#e74c3c',
    },
    scoreContainer: {
        marginVertical: 20,
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    scoreText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    continueButton: {
        backgroundColor: '#F15BB5',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        marginTop: 20,
    },
    continueButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    countdownContainer: {
        marginVertical: 10,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    countdownText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
});

export default InQuizGameScreen;