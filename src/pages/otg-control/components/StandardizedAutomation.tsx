import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, Activity, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DeviceSelector from './DeviceSelector';
import AutomationFlowConfig from './AutomationFlowConfig';
import { 
  standardizedAutomationEngine, 
  AutomationConfig, 
  AutomationSession 
} from '../services/standardizedAutomationEngine';

interface StandardizedAutomationProps {
  devices: any;
  groups: any;
  selectedDevices: string[];
  onSelectionChange: (devices: string[]) => void;
}

const defaultConfig: AutomationConfig = {
  skipPostsCount: 3,
  scrollIntervalMin: 2,
  scrollIntervalMax: 5,
  triggers: []
};

const STORAGE_KEY = 'standardized_automation_config';

const StandardizedAutomation: React.FC<StandardizedAutomationProps> = ({
  devices,
  groups,
  selectedDevices,
  onSelectionChange
}) => {
  const [config, setConfig] = useState<AutomationConfig>(defaultConfig);
  const [sessions, setSessions] = useState<{ [deviceId: string]: AutomationSession }>({});
  const [isRunning, setIsRunning] = useState(false);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const { toast } = useToast();

  // Load config from localStorage on component mount
  useEffect(() => {
    const savedConfig = localStorage.getItem(STORAGE_KEY);
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        
        // Ensure the parsed config has all required properties
        const loadedConfig: AutomationConfig = {
          skipPostsCount: parsedConfig.skipPostsCount || defaultConfig.skipPostsCount,
          scrollIntervalMin: parsedConfig.scrollIntervalMin || defaultConfig.scrollIntervalMin,
          scrollIntervalMax: parsedConfig.scrollIntervalMax || defaultConfig.scrollIntervalMax,
          triggers: Array.isArray(parsedConfig.triggers) ? parsedConfig.triggers : []
        };
        
        setConfig(loadedConfig);
      } catch (error) {
        setConfig(defaultConfig);
      }
    } else {
      setConfig(defaultConfig);
    }
    setIsConfigLoaded(true);
  }, []);

  // Save config to localStorage whenever it changes (but only after initial load)
  useEffect(() => {
    if (!isConfigLoaded) return; // Don't save during initial load
    
    try {
      const configToSave = JSON.stringify(config);
      localStorage.setItem(STORAGE_KEY, configToSave);
    } catch (error) {
      // Silently handle save errors
    }
  }, [config, isConfigLoaded]);

  // Handle config changes with proper persistence
  const handleConfigChange = (newConfig: AutomationConfig) => {
    setConfig(newConfig);
  };

  // Update sessions every second
  useEffect(() => {
    const interval = setInterval(() => {
      const newSessions: { [deviceId: string]: AutomationSession } = {};
      selectedDevices.forEach(deviceId => {
        const session = standardizedAutomationEngine.getSession(deviceId);
        if (session) {
          newSessions[deviceId] = session;
        }
      });
      setSessions(newSessions);
      setIsRunning(Object.keys(newSessions).length > 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedDevices]);

  const getDeviceName = (deviceId: string) => {
    const device = devices[deviceId];
    return device?.name || device?.device_name || deviceId;
  };

  const handleStartAutomation = async () => {
    if (selectedDevices.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one device",
        variant: "destructive",
      });
      return;
    }

    if (config.triggers.length === 0) {
      toast({
        title: "Error",
        description: "Please create at least one trigger",
        variant: "destructive",
      });
      return;
    }

    if (!localStorage.getItem('openai_api_key')) {
      toast({
        title: "Error",
        description: "Please set your OpenAI API key in the Settings tab",
        variant: "destructive",
      });
      return;
    }

    try {
      for (const deviceId of selectedDevices) {
        await standardizedAutomationEngine.startAutomation(deviceId, config);
      }

      toast({
        title: "Automation Started",
        description: `Started standardized automation for ${selectedDevices.length} device(s)`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start automation",
        variant: "destructive",
      });
    }
  };

  const handleStopAutomation = () => {
    selectedDevices.forEach(deviceId => {
      standardizedAutomationEngine.stopAutomation(deviceId);
    });

    toast({
      title: "Automation Stopped",
      description: "All automation has been stopped",
    });
  };

  const getTotalStats = () => {
    const totals = { postsScrolled: 0, postsAnalyzed: 0, actionsPerformed: 0, errors: 0 };
    Object.values(sessions).forEach(session => {
      totals.postsScrolled += session.stats.postsScrolled;
      totals.postsAnalyzed += session.stats.postsAnalyzed;
      totals.actionsPerformed += session.stats.actionsPerformed;
      totals.errors += session.stats.errors;
    });
    return totals;
  };

  const totalStats = getTotalStats();

  // Don't render until config is loaded to prevent flash of default state
  if (!isConfigLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-8">
          <div className="text-muted-foreground">Loading automation configuration...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Standardized Automation</h3>
          <p className="text-sm text-muted-foreground">
            Seamlessly manage and automate your farm with OTG Control.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {isRunning ? (
            <>
              <Badge variant="default" className="bg-green-500">
                Running on {Object.keys(sessions).length} device(s)
              </Badge>
              <Button onClick={handleStopAutomation} variant="destructive">
                <Pause className="h-4 w-4 mr-2" />
                Stop All
              </Button>
            </>
          ) : (
            <Button onClick={handleStartAutomation}>
              <Play className="h-4 w-4 mr-2" />
              Start Automation
            </Button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      {isRunning && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Posts Scrolled</p>
                  <p className="text-2xl font-bold">{totalStats.postsScrolled}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Posts Analyzed</p>
                  <p className="text-2xl font-bold">{totalStats.postsAnalyzed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Play className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">Actions Performed</p>
                  <p className="text-2xl font-bold">{totalStats.actionsPerformed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-red-500 rounded-full" />
                <div>
                  <p className="text-sm font-medium">Errors</p>
                  <p className="text-2xl font-bold">{totalStats.errors}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="devices" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="config">Flow Config</TabsTrigger>
          <TabsTrigger value="monitor">Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select devices</CardTitle>
              <CardDescription>
                Choose which devices to run the standardized automation on
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeviceSelector
                devices={devices}
                groups={groups}
                selectedDevices={selectedDevices}
                onSelectionChange={onSelectionChange}
              />
              
              {selectedDevices.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Selected devices:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDevices.map(deviceId => (
                      <Badge key={deviceId} variant="secondary">
                        {getDeviceName(deviceId)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <AutomationFlowConfig
            config={config}
            onConfigChange={handleConfigChange}
          />
        </TabsContent>

        <TabsContent value="monitor" className="space-y-4">
          {Object.keys(sessions).length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No active automation sessions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.values(sessions).map(session => (
                <Card key={session.deviceId}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {getDeviceName(session.deviceId)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Posts Scrolled</p>
                        <p>{session.stats.postsScrolled}</p>
                      </div>
                      <div>
                        <p className="font-medium">Posts Analyzed</p>
                        <p>{session.stats.postsAnalyzed}</p>
                      </div>
                      <div>
                        <p className="font-medium">Actions Performed</p>
                        <p>{session.stats.actionsPerformed}</p>
                      </div>
                      <div>
                        <p className="font-medium">Current Post</p>
                        <p>#{session.currentPostCount}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground">
                        Next analysis at post #{session.currentPostCount + (session.config.skipPostsCount - (session.currentPostCount % session.config.skipPostsCount))}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StandardizedAutomation;
