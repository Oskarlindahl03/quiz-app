import apiClient from './api';
import { Platform } from 'react-native';

export const getAllQuizzes = async () => {
  try {
    const response = await apiClient.get('/quizzes');
    return response.data; 
  } catch (error) {
    console.error("Error fetching quizzes:", error.response?.data || error.message);
    throw error; 
  }
};

export const createQuiz = async (quizData) => {
  try {
    console.log('Sending quiz data to API:', quizData); 
    const response = await apiClient.post('/quizzes', quizData);
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating quiz:", error.response?.data || error.message);
    throw error;
  }
};
export const getQuizById = async (quizId) => {
    try {
        const response = await apiClient.get(`/quizzes/${quizId}`);
        return response.data; 
    } catch (error) {
        console.error("Error fetching quiz by ID:", error.response?.data || error.message);
        throw error; 
    }
};
export const uploadQuestionImage = async (localImageUri) => {
  if (!localImageUri) { throw new Error("No image URI provided."); }

  const filename = localImageUri.split('/').pop() || 'upload.jpg';
  let match = /\.(\w+)$/.exec(filename);
  let ext = match ? match[1].toLowerCase() : 'jpeg';
  let type = `image/${ext}`;
  if (type === 'image/jpg') type = 'image/jpeg';
  if (!type.startsWith('image/')) { type = 'image/jpeg'; console.warn(`uploadQI: Invalid type for ${filename}, using default: ${type}`); }

  const fileDataForNative = { uri: localImageUri, name: filename, type: type };
  console.log("Prepared fileData:", JSON.stringify(fileDataForNative, null, 2));
  if (!fileDataForNative.uri || !fileDataForNative.name || !fileDataForNative.type) { console.error("uploadQI: Invalid fileData object!", fileDataForNative); throw new Error("Cannot upload: Invalid file details."); }


  const formData = new FormData();
  let fileToAppend = fileDataForNative; // Default for native

  // --- <<< START WEB PLATFORM CHECK & BLOB CONVERSION >>> ---
  if (Platform.OS === 'web') {
    console.log("Web platform detected, attempting Blob conversion...");
    try {
      // Fetch the image data (works for file://, data:, http://)
      const response = await fetch(localImageUri);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const blob = await response.blob();

      // Use the File constructor which takes a Blob
      fileToAppend = new File([blob], filename, { type: type });
      console.log("Blob/File created for web:", fileToAppend); // Logs File object
    } catch (fetchError) {
      console.error("Error converting URI to Blob/File for web:", fetchError);
      // Optional: Decide if you want to throw or proceed with potentially failing object
      throw new Error(`Could not prepare file for web upload: ${fetchError.message}`);
      // fileToAppend = fileDataForNative; // Fallback? Less likely to work
    }
  }
  // --- <<< END WEB PLATFORM CHECK & BLOB CONVERSION >>> ---


  formData.append('questionImage', fileToAppend); // Append Blob/File (web) or {uri,...} (native)

  console.log("--- Attempting to log FormData Entries (Web behavior differs) ---");
  try { /* ... formData logging attempt (may show Blob/File differently) ... */
    for (let pair of formData.entries()) {
      console.log(` Key: ${pair[0]}, Value:`, pair[1]); // Simpler log for web compatibility
    }
  } catch(e){ console.warn("Could not log FormData"); }
  console.log("---------------------------------------");


  console.log("Uploading image via Axios POST to /quizzes/upload with Content-Type header...");
  try {
    const response = await apiClient.post('/quizzes/upload', formData, {
      headers: {
        // <<< Keep Explicit Header - Crucial for Axios+FormData >>>
        'Content-Type': 'multipart/form-data',
      }, timeout: 60000
    });
    console.log("Upload successful! Server Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Axios upload error object:", error);
    // ... Enhanced error logging ...
    if (error.code === 'ECONNABORTED') { // Specific check for timeout
      console.error("Upload timed out!");
      throw new Error("Image upload timed out. Please try again.");
  }
    if (error.response) { console.error("Axios error response data:", error.response.data); console.error("Axios error response status:", error.response.status); /*...*/ }
    else if (error.request) { console.error("Axios error request:", error.request); }
    else { console.error('Axios error message:', error.message); }
    const backendMessage = error.response?.data?.message;
    throw new Error(backendMessage || error.message || 'Image upload failed in service');
  }
};