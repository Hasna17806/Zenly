import axios from 'axios';

export const completeChallenge = async (challenge, token) => {
  try {
    if (!challenge) {
      throw new Error("No challenge data provided");
    }

    if (!token) {
      throw new Error("No authentication token found");
    }

    // Try to find the challenge ID
    const challengeId = challenge.id || challenge._id;
    
    if (!challengeId) {
      console.warn("Challenge ID not found, using title as identifier");
      // If no ID, we'll just mark as completed in UI
      return { success: true, offline: true };
    }

    const response = await axios.post(
      "http://localhost:5000/api/completed-challenges",
      { 
        challengeId: challengeId,
        challengeTitle: challenge.title 
      },
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { success: true, data: response.data };
    
  } catch (error) {
    console.error("Error in completeChallenge:", error);
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
};