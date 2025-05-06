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
    
    // Debug image URLs in questions
    if (quizData.questions && Array.isArray(quizData.questions)) {
      quizData.questions.forEach((q, i) => {
        if (q.imageUrl) {
          console.log(`DEBUG - Question ${i+1} sending imageUrl: ${q.imageUrl}`);
        }
      });
    }
    
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
 * Delete a quiz by ID
 * @param {string} quizId - Quiz ID to delete
 * @returns {Promise<Object>} Success message
 */
export const deleteQuiz = async (quizId) => {
  try {
    const response = await apiClient.delete(`/quizzes/${quizId}`);
    console.log('Quiz deleted successfully:', quizId);
    return response.data;
  } catch (error) {
    console.error("Error deleting quiz:", error.response?.data || error.message);
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

  console.log(`Starting image upload process for ${localImageUri.substring(0, 50)}...`);

  // Additional validation for iOS image URLs
  if (localImageUri.startsWith('ph://')) {
    console.log("Converting iOS photo library URI to file URI...");
    try {
      // For iOS photo library URIs, we need to ensure we have a file URI
      // This could involve additional processing depending on what's available
      // in your project dependencies (e.g., expo-file-system)
      console.warn("iOS photo library URI detected. If upload fails, consider adding expo-file-system to convert photo URIs to file URIs.");
    } catch (error) {
      console.error("Error processing iOS photo URI:", error);
    }
  }

  // Extract filename and type from URI
  const filename = localImageUri.split('/').pop() || `upload_${Date.now()}.jpg`;
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

  console.log(`Uploading image ${filename} to server...`);
  try {
    const response = await apiClient.post('/quizzes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }, 
      timeout: 60000 // 60 second timeout for uploads
    });
    
    console.log("Image uploaded successfully - response data:", JSON.stringify(response.data));
    
    // Standardize response format
    let result = {
      success: true,
      imageUrl: null
    };
    
    // Extract image URL from various possible response formats
    const data = response.data;
    let rawImageUrl = null;

    if (typeof data === 'object' && data !== null) {
      if (data.imageUrl) {
        rawImageUrl = data.imageUrl;
        console.log("Found imageUrl in response:", data.imageUrl);
      }
      else if (data.filePath) {
        rawImageUrl = data.filePath;
        console.log("Found filePath in response:", data.filePath);
      }
      else if (data.url) {
        rawImageUrl = data.url;
        console.log("Found url in response:", data.url);
      }
      else if (data.path) {
        rawImageUrl = data.path;
        console.log("Found path in response:", data.path);
      }
      else {
        console.log("No recognized URL field found in response object. Keys:", Object.keys(data));
      }
    } else if (typeof data === 'string') {
      rawImageUrl = data;
      console.log("Response is a string - using as imageUrl:", data);
    }
    
    // Process the imageUrl if it exists
    if (rawImageUrl) {
      // Check if this is an absolute Windows path or URL containing Windows path
      if (rawImageUrl.includes('C:') || rawImageUrl.includes('c:')) {
        console.log("Detected Windows path in URL:", rawImageUrl);
        
        // Extract just the filename from the path
        const parts = rawImageUrl.split(/[\/\\]/);
        const extractedFilename = parts[parts.length - 1];
        console.log("Extracted filename:", extractedFilename);
        
        // Get the server URL part if it exists in the response
        let serverUrl = '';
        if (rawImageUrl.startsWith('http')) {
          const serverMatch = rawImageUrl.match(/(https?:\/\/[^\/]+)/i);
          if (serverMatch) {
            serverUrl = serverMatch[1];
          }
        }
        
        // If we couldn't extract a server URL, use the API base URL without /api
        if (!serverUrl) {
          serverUrl = apiClient.defaults.baseURL.replace('/api', '');
        }
        
        // Build the final URL with the correct format
        result.imageUrl = `${serverUrl}/uploads/${extractedFilename}`;
        console.log("Converted to web URL:", result.imageUrl);
      } else {
        // If it's not a Windows path, use as-is
        result.imageUrl = rawImageUrl;
      }
    }
    
    // Validate the result
    if (!result.imageUrl) {
      console.warn("Upload succeeded but no image URL found in response:", data);
      // Use a placeholder for tests or debugging only
      result.imageUrl = `https://via.placeholder.com/300?text=Image+${Date.now()}`;
      console.log("Using placeholder image URL:", result.imageUrl);
    }
    
    console.log("Final image upload result:", result);
    return result;
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