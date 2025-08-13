import React, { useEffect, useState } from 'react';
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import VoiceControlManager from "./components/VoiceControlManager";
import FeatureAlert from "@/components/common/FeatureAlert";

const VoiceControlPage = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isToolSelected, setIsToolSelected] = useState(false);

  useEffect(() => {
    // Check if OpenAI API key is set up
    const apiKey = localStorage.getItem('openai_api_key');
    setHasApiKey(!!apiKey?.trim());

    const selectedTools = localStorage.getItem('selected_tools');
    if (selectedTools) {
      const tools = JSON.parse(selectedTools);
      setIsToolSelected(tools.includes('voice-control'));
    }
  }, []);

  const canUseFeature = hasApiKey && isToolSelected;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="flex items-center text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          <div className="text-left space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Voice Control</h1>
            <p className="text-xl text-muted-foreground">
              Control your devices with your voice in real time
            </p>
          </div>

          <FeatureAlert 
            isToolSelected={isToolSelected}
            hasApiKey={hasApiKey}
            toolName="Voice Control"
            apiKeyName="OpenAI API key"
          />

          {/* Voice Control Manager */}
          <div className={`${!canUseFeature ? "opacity-50 cursor-not-allowed" : ""}`}>
            <VoiceControlManager />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceControlPage;