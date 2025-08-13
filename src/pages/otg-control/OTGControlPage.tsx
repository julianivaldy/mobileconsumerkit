import React, { useState, useEffect } from 'react';
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AutomationControl from './components/AutomationControl';
import { useToast } from '@/hooks/use-toast';
import { farmAPI } from './services/farmAPI';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import FeatureAlert from '@/components/common/FeatureAlert';

/**
 * OTG Control page component
 * Provides interface for controlling and automating OTG farm operations
 */
const OTGControlPage = () => {
  useScrollToTop();
  
  const navigate = useNavigate();
  const [devices, setDevices] = useState({});
  const [groups, setGroups] = useState({});
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isToolSelected, setIsToolSelected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if OpenAI API key is set up
    const apiKey = localStorage.getItem('openai_api_key');
    setHasApiKey(!!apiKey?.trim());

    // Check if OTG Control tool is selected
    const selectedTools = localStorage.getItem('selected_tools');
    if (selectedTools) {
      const tools = JSON.parse(selectedTools);
      setIsToolSelected(tools.includes('otg-control'));
    }

    if (apiKey?.trim()) {
      loadDevices();
      loadGroups();
    }
  }, []);

  const canUseFeature = hasApiKey && isToolSelected;

  /**
   * Loads available devices from the OTG Control API
   */
  const loadDevices = async () => {
    try {
      const response = await farmAPI.getDeviceList();
      if (response.status === 0) {
        setDevices(response.data);
        setIsConnected(true);

        // If the selected devices have been removed, clear the selection
        const deviceIds = Object.keys(response.data);
        setSelectedDevices((prevSelected) =>
          prevSelected.filter((id) => deviceIds.includes(id))
        );
        toast({
          title: "Connected",
          description: "Successfully connected to OTG Control API",
        });
      }
    } catch (error) {
      setIsConnected(false);
      toast({
        title: "Connection Error",
        description: "Failed to connect to OTG Control API. Make sure the service is running on port 9912.",
        variant: "destructive",
      });
    }
  };

  /**
   * Loads available device groups from the OTG Control API
   */
  const loadGroups = async () => {
    try {
      const response = await farmAPI.getGroupList();
      if (response.status === 0) {
        setGroups(response.data);
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  };

  // Clear selection on page reload for fresh session
  useEffect(() => {
    setSelectedDevices([]);
  }, []);

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
            <h1 className="text-4xl font-bold tracking-tight">OTG Control</h1>
            <p className="text-xl text-muted-foreground">
              Easily control and automate your OTG farm
            </p>
          </div>

          <FeatureAlert 
            isToolSelected={isToolSelected}
            hasApiKey={hasApiKey}
            toolName="OTG Control"
            apiKeyName="OpenAI API key"
          />

          <Card>
            <CardContent className={`${!canUseFeature ? "opacity-50 cursor-not-allowed" : ""}`}>
              <AutomationControl
                selectedDevices={selectedDevices}
                onSelectionChange={setSelectedDevices}
                devices={devices}
                groups={groups}
                onDevicesRefresh={loadDevices}
                onGroupsRefresh={loadGroups}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OTGControlPage;