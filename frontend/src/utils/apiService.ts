import { API_URL } from "../constants";

// Create a consistent API service that handles the correct URL paths for Databutton
const apiService = {
  /**
   * Make a POST request to an API endpoint
   * @param endpoint The endpoint path (without leading slash)
   * @param data The data to send
   * @returns A promise resolving to the response
   */
  async post(endpoint: string, data: any) {
    // For Databutton apps, request must include credentials
    const url = `${window.location.origin}/${endpoint}`;
    
    console.log(`Making API request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}): ${errorText}`);
      throw new Error(errorText || `Failed to ${endpoint}`);
    }
    
    return response.json();
  },
  
  /**
   * Make a GET request to an API endpoint
   * @param endpoint The endpoint path (without leading slash)
   * @returns A promise resolving to the response
   */
  async get(endpoint: string) {
    // For Databutton apps, request must include credentials
    const url = `${window.location.origin}/${endpoint}`;
    
    console.log(`Making API request to: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}): ${errorText}`);
      throw new Error(errorText || `Failed to ${endpoint}`);
    }
    
    return response.json();
  }
};

export default apiService;