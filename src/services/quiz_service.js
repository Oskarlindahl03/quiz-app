import apiClient from './api';
import { Platform } from 'react-native';

/**
 * Get all quizzes from the API
 * @returns {Promise<Array>} Array of quizzes
 */
export const getAllQuizzes = async () => {
  try {
    const response = await apiClient.get('/quizzes');
    console.log('Quizzes fetched successfully:', response.data.length);
    return response.data; 
  } catch (error) {
    console.error("Error fetching quizzes:", error.response?.data || error.message);
    throw error; 
  }
};

/**
 * Create a new quiz
 * @param {Object} quizData - Quiz data object
 * @returns {Promise<Object>} Created quiz data
 */
export const createQuiz = async (quizData) => {
  try {
    console.log('Sending quiz data to API:', JSON.stringify(quizData, null, 2)); 
    const response = await apiClient.post('/quizzes', quizData);
    console.log('Quiz created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating quiz:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get a quiz by its ID
 * @param {string} quizId - Quiz ID
 * @returns {Promise<Object>} Quiz data
 */
export const getQuizById = async (quizId) => {
  try {
    const response = await apiClient.get(`/quizzes/${quizId}`);
    console.log('Quiz fetched successfully:', response.data._id);
    return response.data; 
  } catch (error) {
    console.error("Error fetching quiz by ID:", error.response?.data || error.message);
    throw error; 
  }
};

/**
 * Upload an image for a quiz question
 * @param {string} localImageUri - Local image URI
 * @returns {Promise<Object>} Upload response with image URL
 */
export const uploadQuestionImage = async (localImageUri) => {
  if (!localImageUri) { 
    throw new Error("No image URI provided."); 
  }

  const filename = localImageUri.split('/').pop() || 'upload.jpg';
  let match = /\.(\w+)$/.exec(filename);
  let ext = match ? match[1].toLowerCase() : 'jpeg';
  let type = `image/${ext}`;
  if (type === 'image/jpg') type = 'image/jpeg';
  if (!type.startsWith('image/')) { 
    type = 'image/jpeg'; 
    console.warn(`Invalid type for ${filename}, using default: ${type}`); 
  }

  const fileDataForNative = { uri: localImageUri, name: filename, type: type };
  console.log("Prepared fileData:", JSON.stringify(fileDataForNative, null, 2));
  
  if (!fileDataForNative.uri || !fileDataForNative.name || !fileDataForNative.type) { 
    console.error("Invalid fileData object!", fileDataForNative); 
    throw new Error("Cannot upload: Invalid file details."); 
  }

  const formData = new FormData();
  let fileToAppend = fileDataForNative; // Default for native

  // Handle web platform differently
  if (Platform.OS === 'web') {
    console.log("Web platform detected, attempting Blob conversion...");
    try {
      // Fetch the image data
      const response = await fetch(localImageUri);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const blob = await response.blob();

      // Use the File constructor which takes a Blob
      fileToAppend = new File([blob], filename, { type: type });
      console.log("Blob/File created for web:", fileToAppend);
    } catch (fetchError) {
      console.error("Error converting URI to Blob/File for web:", fetchError);
      throw new Error(`Could not prepare file for web upload: ${fetchError.message}`);
    }
  }

  formData.append('questionImage', fileToAppend);

  console.log("Uploading image to server...");
  try {
    const response = await apiClient.post('/quizzes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }, 
      timeout: 60000 // 60 second timeout for uploads
    });
    
    console.log("Image uploaded successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Upload error:", error);
    
    if (error.code === 'ECONNABORTED') {
      console.error("Upload timed out!");
      throw new Error("Image upload timed out. Please try again.");
    }
    
    const errorMessage = error.response?.data?.message || error.message || 'Image upload failed';
    throw new Error(errorMessage);
  }
};