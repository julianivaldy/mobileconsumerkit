import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Save, MapPin, Smartphone, Camera, Crosshair, Globe } from 'lucide-react';
import tiktokIconImg from '@/assets/tiktok-icon.png';
import instagramIconImg from '@/assets/instagram-icon.png';
import { useToast } from '@/hooks/use-toast';
import { deviceCoordinateMappingService, DeviceCoordinates } from '../services/deviceCoordinateMapping';
import { farmAPI } from '../services/farmAPI';

interface DeviceCoordinateConfigProps {
  devices: any;
  selectedDeviceId: string;
  onDeviceSelect: (deviceId: string) => void;
}

const DeviceCoordinateConfig: React.FC<DeviceCoordinateConfigProps> = ({
  devices,
  selectedDeviceId,
  onDeviceSelect
}) => {
  const [coordinates, setCoordinates] = useState<DeviceCoordinates>({
    like: { x: 0, y: 0 },
    comment: { x: 0, y: 0 },
    save: { x: 0, y: 0 }
  });
  const [selectedDeviceType, setSelectedDeviceType] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('tiktok');
  const [isSaving, setIsSaving] = useState(false);
  const [screenshot, setScreenshot] = useState<string>('');
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [pointerPosition, setPointerPosition] = useState<{ x: number; y: number } | null>(null);
  const [isPointerMode, setIsPointerMode] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();

  const safeDevices = devices || {};

  // Get iPhone and Android models from the service
  const iPhoneModels = deviceCoordinateMappingService.getIPhoneModels();
  const androidModels = deviceCoordinateMappingService.getAndroidModels();

  useEffect(() => {
    if (selectedDeviceId && safeDevices[selectedDeviceId]) {
      loadDeviceCoordinates(selectedDeviceId);
    }
  }, [selectedDeviceId, safeDevices, selectedDeviceType]);

  const loadDeviceCoordinates = (deviceId: string) => {
    const device = safeDevices[deviceId];
    if (!device) return;

    const deviceInfo = {
      width: device.width || 1080,
      height: device.height || 1920,
      deviceType: selectedDeviceType || undefined
    };

    const deviceCoords = deviceCoordinateMappingService.getCoordinatesForDevice(deviceId, deviceInfo);

    if (deviceCoords) {
      setCoordinates(deviceCoords);
    } else {
      const width = device.width || 1080;
      const height = device.height || 1920;
      
      const defaultCoords = {
        like: { x: Math.round(width * 0.9), y: Math.round(height * 0.7) },
        comment: { x: Math.round(width * 0.5), y: Math.round(height * 0.8) },
        save: { x: Math.round(width * 0.9), y: Math.round(height * 0.6) }
      };
      
      setCoordinates(defaultCoords);
    }
  };

  const handleDeviceTypeChange = (deviceType: string) => {
    setSelectedDeviceType(deviceType);
    if (selectedDeviceId) {
      loadDeviceCoordinates(selectedDeviceId);
    }
  };

  const handleCoordinateChange = (action: keyof DeviceCoordinates, axis: 'x' | 'y', value: string) => {
    const numValue = parseInt(value) || 0;
    setCoordinates(prev => ({
      ...prev,
      [action]: {
        ...prev[action],
        [axis]: numValue
      }
    }));
  };

  const handleSaveCoordinates = async () => {
    if (!selectedDeviceId) {
      toast({
        title: "Error",
        description: "Please select a device first",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      deviceCoordinateMappingService.setCustomCoordinates(selectedDeviceId, coordinates);
      toast({
        title: "Success",
        description: `Coordinates saved for ${getDeviceName(selectedDeviceId)}${selectedDeviceType ? ` (${selectedDeviceType})` : ''}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save coordinates",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTakeScreenshot = async () => {
    if (!selectedDeviceId) {
      toast({
        title: "Error",
        description: "Please select a device first",
        variant: "destructive",
      });
      return;
    }

    setIsCapturingScreenshot(true);
    try {
      const result = await farmAPI.getDeviceScreenshot(selectedDeviceId);
      if (result.status === 0 && result.data.img) {
        const imageData = `data:image/jpeg;base64,${result.data.img}`;
        setScreenshot(imageData);
        toast({
          title: "Success",
          description: "Screenshot captured successfully",
        });
      } else {
        throw new Error(result.message || 'Failed to capture screenshot');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to capture screenshot",
        variant: "destructive",
      });
    } finally {
      setIsCapturingScreenshot(false);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isPointerMode || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = imageRef.current.naturalWidth / rect.width;
    const scaleY = imageRef.current.naturalHeight / rect.height;
    
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);
    
    setPointerPosition({ x, y });
  };

  const handleSetCoordinateFromPointer = (action: keyof DeviceCoordinates) => {
    if (!pointerPosition) return;
    
    setCoordinates(prev => ({
      ...prev,
      [action]: { ...pointerPosition }
    }));
    
    toast({
      title: "Coordinate Set",
      description: `${String(action)} coordinate set to (${pointerPosition.x}, ${pointerPosition.y})`,
    });
  };

  const getDeviceName = (deviceId: string) => {
    const device = safeDevices[deviceId];
    return device?.name || device?.device_name || deviceId;
  };

  const getDeviceResolution = (deviceId: string) => {
    const device = safeDevices[deviceId];
    return `${device?.width || 0}x${device?.height || 0}`;
  };

  return (
    <div className="space-y-6">
      {/* Platform Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Platform Selection
          </CardTitle>
          <CardDescription>
            Choose the social media platform you want to automate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label htmlFor="platform-selection">Select Platform</Label>
            <RadioGroup 
              value={selectedPlatform} 
              onValueChange={setSelectedPlatform}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="p-4 border rounded-lg hover:bg-accent transition-colors">
                <Label htmlFor="tiktok" className="flex items-center cursor-pointer">
                  <RadioGroupItem value="tiktok" id="tiktok" className="mr-3" />
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Device Action Coordinates
          </CardTitle>
          <CardDescription>
            Configure exact coordinates for Like, Comment, and Save actions for each device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Device Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select Device</h3>
              <div className="grid gap-2">
                {Object.values(safeDevices).map((device: any) => (
                  <div 
                    key={device.deviceid} 
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedDeviceId === device.deviceid 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                    onClick={() => onDeviceSelect(device.deviceid)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{getDeviceName(device.deviceid)}</p>
                          <p className="text-sm text-muted-foreground">{device.deviceid}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {getDeviceResolution(device.deviceid)}
                        </Badge>
                        <Badge variant={device.state === 0 ? "secondary" : "default"} className="text-xs ml-2">
                          {device.state === 0 ? "Offline" : "Online"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Type Selection */}
            {selectedDeviceId && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-1">
                    Configuring: {getDeviceName(selectedDeviceId)}
                  </h3>
                  <p className="text-sm text-blue-700">
                    Resolution: {getDeviceResolution(selectedDeviceId)}
                  </p>
                </div>

                {/* Device Type Selector */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Device Type (Optional)</CardTitle>
                    <CardDescription>
                      Select the specific device model to use predefined coordinates. Leave empty to use auto-detection.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="iphone" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="iphone">iPhone Models</TabsTrigger>
                        <TabsTrigger value="android">Android Models</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="iphone" className="space-y-4">
                        <Select value={selectedDeviceType} onValueChange={handleDeviceTypeChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select iPhone model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Auto-detect (No specific model)</SelectItem>
                            {iPhoneModels.map((model) => (
                              <SelectItem key={model.deviceType} value={model.deviceType}>
                                {model.deviceType.replace('iphone_', 'iPhone ').replace('_', ' ').toUpperCase()} 
                                ({model.screenWidth}x{model.screenHeight})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TabsContent>
                      
                      <TabsContent value="android" className="space-y-4">
                        <Select value={selectedDeviceType} onValueChange={handleDeviceTypeChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Android model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Auto-detect (No specific model)</SelectItem>
                            {androidModels.map((model) => (
                              <SelectItem key={model.deviceType} value={model.deviceType}>
                                {model.deviceType.replace('_', ' ').toUpperCase()} 
                                ({model.screenWidth}x{model.screenHeight})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TabsContent>
                    </Tabs>
                    
                    {selectedDeviceType && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          <strong>Selected:</strong> {selectedDeviceType.replace('_', ' ').toUpperCase()}
                          <br />
                          <strong>Coordinates:</strong> Using predefined coordinates for this device model
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Screenshot Controls */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      <Camera className="h-4 w-4 mr-2" />
                      Screenshot & Coordinate Picker
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Button 
                        onClick={handleTakeScreenshot} 
                        disabled={isCapturingScreenshot}
                        variant="outline"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {isCapturingScreenshot ? 'Capturing...' : 'Take Screenshot'}
                      </Button>
                      
                      <Button 
                        onClick={() => setIsPointerMode(!isPointerMode)}
                        variant={isPointerMode ? "default" : "outline"}
                        disabled={!screenshot}
                      >
                        <Crosshair className="h-4 w-4 mr-2" />
                        {isPointerMode ? 'Exit Pointer Mode' : 'Enable Pointer Mode'}
                      </Button>
                    </div>

                    {isPointerMode && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          <strong>Pointer Mode Active:</strong> Click anywhere on the screenshot to get coordinates.
                          {pointerPosition && ` Current position: (${pointerPosition.x}, ${pointerPosition.y})`}
                        </p>
                      </div>
                    )}

                    {screenshot && (
                      <div className="relative border rounded-lg overflow-hidden">
                        <img 
                          ref={imageRef}
                          src={screenshot} 
                          alt="Device Screenshot" 
                          className={`max-w-full h-auto ${isPointerMode ? 'cursor-crosshair' : ''}`}
                          onClick={handleImageClick}
                        />
                        
                        {/* Coordinate Markers */}
                        {imageRef.current && (
                          <>
                            {Object.entries(coordinates).map(([action, coord]) => {
                              const rect = imageRef.current!.getBoundingClientRect();
                              const scaleX = rect.width / imageRef.current!.naturalWidth;
                              const scaleY = rect.height / imageRef.current!.naturalHeight;
                              
                              return (
                                <div
                                  key={action}
                                  className="absolute w-4 h-4 bg-red-500 border-2 border-white rounded-full transform -translate-x-2 -translate-y-2"
                                  style={{
                                    left: (coord as { x: number; y: number }).x * scaleX,
                                    top: (coord as { x: number; y: number }).y * scaleY,
                                  }}
                                  title={`${action}: (${(coord as { x: number; y: number }).x}, ${(coord as { x: number; y: number }).y})`}
                                />
                              );
                            })}
                            
                            {/* Pointer Position */}
                            {pointerPosition && (
                              <div
                                className="absolute w-6 h-6 bg-blue-500 border-2 border-white rounded-full transform -translate-x-3 -translate-y-3"
                                style={{
                                  left: pointerPosition.x * (imageRef.current.getBoundingClientRect().width / imageRef.current.naturalWidth),
                                  top: pointerPosition.y * (imageRef.current.getBoundingClientRect().height / imageRef.current.naturalHeight),
                                }}
                              />
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Quick Set Buttons */}
                    {pointerPosition && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {(['like', 'comment', 'save'] as const).map((action) => (
                          <Button
                            key={action}
                            onClick={() => handleSetCoordinateFromPointer(action)}
                            variant="outline"
                            size="sm"
                          >
                            Set {action} ({pointerPosition.x}, {pointerPosition.y})
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Manual Coordinate Configuration */}
                {(['like', 'comment', 'save'] as const).map((action) => (
                  <Card key={action}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base capitalize flex items-center">
                        {action === 'like' && '❤️'}
                        {action === 'comment' && '💬'}
                        {action === 'save' && '🔖'}
                        <span className="ml-2">{action} Action</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`${action}-x`}>X Coordinate</Label>
                          <Input
                            id={`${action}-x`}
                            type="number"
                            value={coordinates[action].x}
                            onChange={(e) => handleCoordinateChange(action, 'x', e.target.value)}
                            placeholder="Enter X position"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`${action}-y`}>Y Coordinate</Label>
                          <Input
                            id={`${action}-y`}
                            type="number"
                            value={coordinates[action].y}
                            onChange={(e) => handleCoordinateChange(action, 'y', e.target.value)}
                            placeholder="Enter Y position"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Current: ({coordinates[action].x}, {coordinates[action].y})
                      </p>
                    </CardContent>
                  </Card>
                ))}

                <Button 
                  onClick={handleSaveCoordinates} 
                  disabled={isSaving}
                  className="w-full"
                  size="lg"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Coordinates'}
                </Button>
              </div>
            )}

            {!selectedDeviceId && (
              <div className="text-center text-muted-foreground py-8">
                <Smartphone className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Please select a device to configure its action coordinates</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeviceCoordinateConfig;
