
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

export const useApiKeyTest = () => {
  const [isTestingKey, setIsTestingKey] = useState(false);
  const { toast } = useToast();

  const testApiKey = async () => {
    const apiKey = localStorage.getItem("openai_api_key")?.trim() || null;
    
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set your OpenAI API key in the Settings page to use this feature.",
        variant: "destructive",
      });
      return;
    }
    
    const trimmedKey = apiKey.trim();
    
    if (!trimmedKey.startsWith('sk-') || trimmedKey.length < 20) {
      toast({
        title: "Invalid API Key Format",
        description: "Your API key format is invalid. OpenAI API keys should start with 'sk-'",
        variant: "destructive",
      });
      return;
    }
    
    setIsTestingKey(true);
    
    try {
      const response = await axios.get("https://api.openai.com/v1/models", {
        headers: {
          "Authorization": `Bearer ${apiKey}`
        }
      });
      
      if (response.status === 200) {
        toast({
          title: "API Key Valid",
          description: "Your OpenAI API key is valid and working correctly.",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error("Error testing API key:", error);
      
      if (error.response?.status === 401) {
        toast({
          title: "Invalid API Key",
          description: "Authentication failed. Please check your API key.",
          variant: "destructive",
        });
      } else if (error.response?.status === 403) {
        toast({
          title: "Permission Denied",
          description: "Your API key doesn't have the necessary permissions.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "API Key Test Failed",
          description: error.message || "Unknown error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setIsTestingKey(false);
    }
  };

  return {
    isTestingKey,
    testApiKey
  };
};
