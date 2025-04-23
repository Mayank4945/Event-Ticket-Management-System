import axios from 'axios';

export const checkApiHealth = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/health', {
      timeout: 5000 // 5 second timeout
    });
    return {
      status: 'online',
      details: response.data
    };
  } catch (error) {
    console.error('API health check failed:', error);
    return {
      status: 'offline',
      error: error.message,
      details: error.response ? error.response.data : 'No response'
    };
  }
};