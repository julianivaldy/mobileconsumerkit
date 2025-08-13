
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Play, Pause, Save, Camera, Smartphone, Globe } from 'lucide-react';
import tiktokIconImg from '@/assets/tiktok-icon.png';
import instagramIconImg from '@/assets/instagram-icon.png';
import { useToast } from '@/hooks/use-toast';
import { 
  standardizedAutomationEngine, 
  AutomationConfig, 
  AutomationSession 
} from '../services/standardizedAutomationEngine';
import { deviceCoordinateMappingService, DeviceCoordinates } from '../services/deviceCoordinateMapping';
import AutomationFlowConfig from './AutomationFlowConfig';
import DeviceSelector from './DeviceSelector';
import { farmAPI } from '../services/farmAPI';
import DeviceScreenshotDialog from "./DeviceScreenshotDialog";

// Update the props to use multi-select
interface AutomationControlProps {
  selectedDevices: string[];
  onSelectionChange: (ids: string[]) => void;
  devices: any;
  groups?: any;
  onDevicesRefresh?: () => void;
  onGroupsRefresh?: () => void;
}

const defaultConfig: AutomationConfig = {
  skipPostsCount: 3,
  scrollIntervalMin: 2,
  scrollIntervalMax: 5,
  triggers: []
};

const AutomationControl: React.FC<AutomationControlProps> = ({ 
  selectedDevices, 
  onSelectionChange,
  devices = {},
  groups = {},
  onDevicesRefresh,
  onGroupsRefresh
}) => {
  const [config, setConfig] = useState<AutomationConfig>(defaultConfig);
  const [sessions, setSessions] = useState<{ [deviceId: string]: AutomationSession }>({});
  const [deviceCoordinates, setDeviceCoordinates] = useState<{ [deviceId: string]: DeviceCoordinates }>({});
  const [deviceScreenshots, setDeviceScreenshots] = useState<{[deviceId: string]: string}>({});
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState<{[deviceId: string]: boolean}>({});
  const [pointerMode, setPointerMode] = useState<{[deviceId: string]: boolean}>({});
  const [pointerPos, setPointerPos] = useState<{[deviceId: string]: {x: number; y: number} | null}>({});
  const [dialogDeviceId, setDialogDeviceId] = useState<string | null>(null);
  const [dialogScreenshot, setDialogScreenshot] = useState<string | null>(null);
  const [logsPerDevice, setLogsPerDevice] = useState<{ [deviceId: string]: string[] }>({});
  const [selectedCoordinateDevice, setSelectedCoordinateDevice] = useState<string>('');
  const { toast } = useToast();

  // Remove internal selectedDevices state, use props instead  
  // Remove effect syncing with prop

  // Sessions effect, now using `selectedDevices` from props
  useEffect(() => {
    // Update sessions every second
    const interval = setInterval(() => {
      const newSessions: { [deviceId: string]: AutomationSession } = {};
      selectedDevices.forEach(deviceId => {
        const session = standardizedAutomationEngine.getSession(deviceId);
        if (session) {
          newSessions[deviceId] = session;
        }
      });
      setSessions(newSessions);
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedDevices]);

  // Load coordinates for selected devices
  useEffect(() => {
    const newCoordinates: { [deviceId: string]: DeviceCoordinates } = {};
    selectedDevices.forEach(deviceId => {
      const device = devices[deviceId];
      if (device) {
        const coords = deviceCoordinateMappingService.getCoordinatesForDevice(deviceId, {
          width: device.width || 1080,
          height: device.height || 1920,
          deviceType: 'android'
        });
        if (coords) {
          newCoordinates[deviceId] = coords;
        } else {
          const width = device.width || 1080;
          const height = device.height || 1920;
          newCoordinates[deviceId] = {
            like: { x: Math.round(width * 0.9), y: Math.round(height * 0.7) },
            comment: { x: Math.round(width * 0.5), y: Math.round(height * 0.8) },
            save: { x: Math.round(width * 0.9), y: Math.round(height * 0.6) }
          };
        }
      }
    });
    setDeviceCoordinates(newCoordinates);

    // Auto-select first device for coordinate configuration if none selected
    if (selectedDevices.length > 0 && !selectedCoordinateDevice) {
      setSelectedCoordinateDevice(selectedDevices[0]);
    }
    
    // Clear coordinate device selection if it's no longer in selected devices
    if (selectedCoordinateDevice && !selectedDevices.includes(selectedCoordinateDevice)) {
      setSelectedCoordinateDevice(selectedDevices[0] || '');
    }
  }, [selectedDevices, devices, selectedCoordinateDevice]);

  // Subscribe to log updates
  useEffect(() => {
    const off = standardizedAutomationEngine.onLog((deviceId, log) => {
      setLogsPerDevice(prev => ({
        ...prev,
        [deviceId]: [...(prev[deviceId] || []), log].slice(-200)
      }));
    });
    return () => { off(); };
  }, []);

  // Clear logs when device selection changes
  useEffect(() => {
    selectedDevices.forEach(id => {
      setLogsPerDevice(prev => ({
        ...prev,
        [id]: standardizedAutomationEngine.getDeviceLogs(id)
      }));
    });
  }, [selectedDevices]);

  const getDeviceName = (deviceId: string) => {
    const device = devices[deviceId];
    return device?.name || device?.device_name || deviceId;
  };

  const getDeviceResolution = (deviceId: string) => {
    const device = devices[deviceId];
    return `${device?.width || 0}x${device?.height || 0}`;
  };

  const handleCoordinateChange = (deviceId: string, action: keyof DeviceCoordinates, axis: 'x' | 'y', value: string) => {
    const numValue = parseInt(value) || 0;
    setDeviceCoordinates(prev => ({
      ...prev,
      [deviceId]: {
        ...prev[deviceId],
        [action]: {
          ...prev[deviceId][action],
          [axis]: numValue
        }
      }
    }));
  };

  const handleSaveCoordinates = (deviceId: string) => {
    const coords = deviceCoordinates[deviceId];
    if (coords) {
      deviceCoordinateMappingService.setCustomCoordinates(deviceId, coords);
      toast({
        title: "Success",
        description: `Coordinates saved for ${getDeviceName(deviceId)}`,
      });
    }
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
        description: "Please set your OpenAI API key in the Settings tab first",
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
        description: `Started automation for ${selectedDevices.length} device(s)`,
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

  const handleTakeScreenshot = async (deviceId: string) => {
    try {
      setIsCapturingScreenshot(prev => ({ ...prev, [deviceId]: true }));
      const result = await farmAPI.getDeviceScreenshot(deviceId);
      if (result.status === 0 && result.data.img) {
        const imageData = `data:image/jpeg;base64,${result.data.img}`;
        setDialogDeviceId(deviceId);
        setDialogScreenshot(imageData);
        setDeviceScreenshots(prev => ({ ...prev, [deviceId]: imageData }));
        toast({
          title: "Success",
          description: `Screenshot captured for ${getDeviceName(deviceId)}`,
        });
      } else {
        throw new Error(result.message || "Failed to capture screenshot");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to capture screenshot",
        variant: "destructive",
      });
    } finally {
      setIsCapturingScreenshot(prev => ({ ...prev, [deviceId]: false }));
    }
  };

  const device = selectedDevices.length === 1 ? devices[selectedDevices[0]] : undefined;
  const totalStats = getTotalStats();
  const isRunning = Object.keys(sessions).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {isRunning && (
            <Badge variant="default" className="bg-green-500">
              Running on {Object.keys(sessions).length} device(s)
            </Badge>
          )}
        </div>
      </div>
      {Object.keys(devices).length === 0 && (
        <div className="bg-muted p-4 rounded text-center text-muted-foreground">
          No devices connected. Please connect a device to begin.
        </div>
      )}
      {/* DeviceSelector accepts multi-selection */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Select Devices</h3>
        <p className="text-muted-foreground mb-4">
          Choose devices to run automation on, refresh devices, or manage groups.
        </p>
        <DeviceSelector
          devices={devices}
          groups={groups}
          selectedDevices={selectedDevices}
          onSelectionChange={onSelectionChange}
          onDevicesRefresh={onDevicesRefresh}
          onGroupsRefresh={onGroupsRefresh}
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
      </div>

      {isRunning && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card p-4 rounded-lg border">
            <p className="text-sm font-medium text-muted-foreground">Posts Scrolled</p>
            <p className="text-2xl font-bold">{totalStats.postsScrolled}</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <p className="text-sm font-medium text-muted-foreground">Posts Analyzed</p>
            <p className="text-2xl font-bold">{totalStats.postsAnalyzed}</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <p className="text-sm font-medium text-muted-foreground">Actions Performed</p>
            <p className="text-2xl font-bold">{totalStats.actionsPerformed}</p>
          </div>
          <div className="bg-card p-4 rounded-lg border">
            <p className="text-sm font-medium text-muted-foreground">Errors</p>
            <p className="text-2xl font-bold">{totalStats.errors}</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Device Action Coordinates</CardTitle>
          <CardDescription>
            Configure coordinates for Like, Comment, and Save actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Platform Selection */}
          <div className="space-y-4 pb-6 border-b">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <h4 className="text-lg font-medium">Platform Selection</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              Choose the social media platform you want to automate
            </p>
            
            <RadioGroup 
              value="tiktok" 
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="p-4 border rounded-lg bg-accent/50">
                <Label htmlFor="tiktok" className="flex items-center cursor-pointer">
                  <RadioGroupItem value="tiktok" id="tiktok" checked className="mr-3" />
                  <div className="flex items-center space-x-3">
                    <img src={tiktokIconImg} alt="TikTok logo" className="w-8 h-8 rounded-lg" loading="lazy" />
                    <div>
                      <p className="font-medium">TikTok</p>
                      <p className="text-sm text-muted-foreground">Available</p>
                    </div>
                  </div>
                </Label>
              </div>
              
              <div className="p-4 border rounded-lg opacity-50 cursor-not-allowed">
                <Label htmlFor="instagram" className="flex items-center cursor-not-allowed">
                  <RadioGroupItem value="instagram" id="instagram" disabled className="mr-3" />
                  <div className="flex items-center space-x-3">
                    <img src={instagramIconImg} alt="Instagram logo" className="w-8 h-8 rounded-lg" loading="lazy" />
                    <div>
                      <p className="font-medium">Instagram</p>
                      <p className="text-sm text-muted-foreground">Coming Soon</p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
            
          </div>

          {selectedDevices.length > 0 ? (
            <>
              {/* Device Selector for Coordinates */}
              <div className="space-y-3">
                <Label className="text-base font-medium flex items-center">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Choose Device to Configure
                </Label>
                <Select value={selectedCoordinateDevice} onValueChange={setSelectedCoordinateDevice}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a device to configure coordinates" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedDevices.map((deviceId) => (
                      <SelectItem key={deviceId} value={deviceId}>
                        <div className="flex items-center justify-between w-full">
                          <span>{getDeviceName(deviceId)}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {getDeviceResolution(deviceId)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Coordinate Configuration for Selected Device */}
              {selectedCoordinateDevice && deviceCoordinates[selectedCoordinateDevice] && (
                <div className="border rounded-lg p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                    <div>
                      <h4 className="text-lg font-semibold">{getDeviceName(selectedCoordinateDevice)}</h4>
                      <p className="text-sm text-muted-foreground">
                        Resolution: {getDeviceResolution(selectedCoordinateDevice)} • ID: {selectedCoordinateDevice}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleSaveCoordinates(selectedCoordinateDevice)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-3 w-3 mr-1" />
                        Save Coordinates
                      </Button>
                      <Button
                        onClick={() => handleTakeScreenshot(selectedCoordinateDevice)}
                        size="sm"
                        variant="outline"
                        disabled={!!isCapturingScreenshot[selectedCoordinateDevice]}
                      >
                        <span className="flex items-center">
                          <Camera className="h-4 w-4 mr-1" />
                          {isCapturingScreenshot[selectedCoordinateDevice] ? "Capturing..." : "Take Screenshot"}
                        </span>
                      </Button>
                    </div>
                  </div>
                  {deviceScreenshots[selectedCoordinateDevice] && (
                    <div className="mb-2">
                      <img
                        src={deviceScreenshots[selectedCoordinateDevice]}
                        alt="Latest Screenshot"
                        className="max-w-xs rounded border"
                        style={{ maxHeight: 100 }}
                      />
                    </div>
                  )}

                  {/* Coordinate Configuration for all actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(['like', 'comment', 'save'] as const).map((action) => (
                      <div key={action} className="bg-white p-4 rounded-lg border">
                        <Label className="text-sm font-semibold capitalize flex items-center mb-3">
                          {action === "like" && "❤️"}
                          {action === "comment" && "💬"}
                          {action === "save" && "🔖"}
                          <span className="ml-2">{action} Action</span>
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">X Coordinate</Label>
                            <Input
                              type="number"
                              value={deviceCoordinates[selectedCoordinateDevice][action].x}
                              onChange={(e) => handleCoordinateChange(selectedCoordinateDevice, action, "x", e.target.value)}
                              className="h-8 text-sm"
                              placeholder="X position"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Y Coordinate</Label>
                            <Input
                              type="number"
                              value={deviceCoordinates[selectedCoordinateDevice][action].y}
                              onChange={(e) => handleCoordinateChange(selectedCoordinateDevice, action, "y", e.target.value)}
                              className="h-8 text-sm"
                              placeholder="Y position"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Current: ({deviceCoordinates[selectedCoordinateDevice][action].x}, {deviceCoordinates[selectedCoordinateDevice][action].y})
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Informative text about coordinate accuracy */}
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>📍 Getting Exact Coordinates:</strong> Depending on your screen and the version of your iMouse software, there may be some discrepancies in the action coordinates. To get the exact coordinates, go to the iMouse software, activate the emulator setting (at the top left of each screen, click on the first option), and you'll be able to point your cursor where you want to interact. Then, press click + Control + left arrow to get the exact coordinates.
                    </p>
                  </div>
                  <DeviceScreenshotDialog
                    open={dialogDeviceId === selectedCoordinateDevice}
                    onOpenChange={(open) => {
                      if (!open) {
                        setDialogDeviceId(null);
                        setDialogScreenshot(null);
                      }
                    }}
                    screenshot={dialogScreenshot}
                    deviceName={getDeviceName(selectedCoordinateDevice)}
                    initialCoords={deviceCoordinates[selectedCoordinateDevice]}
                    onSave={(updatedCoords) => {
                      setDeviceCoordinates((prev) => ({
                        ...prev,
                        [selectedCoordinateDevice]: updatedCoords,
                      }));
                      deviceCoordinateMappingService.setCustomCoordinates(selectedCoordinateDevice, updatedCoords);
                      toast({
                        title: "Success",
                        description: `Coordinates updated for ${getDeviceName(selectedCoordinateDevice)}`,
                      });
                      setDialogDeviceId(null);
                      setDialogScreenshot(null);
                    }}
                  />
                </div>
              )}

              {!selectedCoordinateDevice && (
                <div className="text-center text-muted-foreground py-8">
                  <Smartphone className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Please select a device above to configure its action coordinates</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Smartphone className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No devices connected. Connect devices to configure action coordinates.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AutomationFlowConfig
        config={config}
        onConfigChange={setConfig}
      />

      {/* Move "Logs" section here, just below AutomationFlowConfig */}
      <div className="bg-card rounded-lg border p-4">
        <h4 className="text-base font-semibold mb-2">Automation Logs</h4>
        <div className="overflow-x-auto text-xs max-h-48 bg-black rounded-md text-white p-2 font-mono">
          {selectedDevices.length > 0 ? (
            selectedDevices.map((devId) => (
              <div key={devId} className="mb-2">
                <span className="font-bold text-green-300">{getDeviceName(devId)}</span>
                <ul className="mt-1 ml-2 list-none">
                  {(logsPerDevice[devId] ?? []).slice(-30).map((log, i) => (
                    <li key={i} className="leading-tight">{log}</li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-4">
              <p>No devices selected. Automation logs will appear here once devices are running.</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        {isRunning ? (
          <Button onClick={handleStopAutomation} variant="destructive" size="lg">
            <Pause className="h-4 w-4 mr-2" />
            Stop All Automation
          </Button>
        ) : (
          <Button onClick={handleStartAutomation} size="lg">
            <Play className="h-4 w-4 mr-2" />
            Start Automation
          </Button>
        )}
      </div>

    </div>
  );
};

export default AutomationControl;
