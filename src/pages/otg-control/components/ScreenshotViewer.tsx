
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Download, RefreshCw } from 'lucide-react';
import { farmAPI } from '../services/farmAPI';
import { useToast } from '@/hooks/use-toast';

interface ScreenshotViewerProps {
  selectedDevice: string;
  devices: any;
}

const ScreenshotViewer: React.FC<ScreenshotViewerProps> = ({ selectedDevice, devices = {} }) => {
  const [screenshot, setScreenshot] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { toast } = useToast();

  const safeDevices = devices || {};

  const takeScreenshot = async () => {
    if (!selectedDevice) {
      toast({
        title: "No Device Selected",
        description: "Please select a device first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await farmAPI.getDeviceScreenshot(selectedDevice);
      
      if (response.status === 0 && response.data.img) {
        setScreenshot(`data:image/jpeg;base64,${response.data.img}`);
        setLastUpdate(new Date());
        toast({
          title: "Success",
          description: "Screenshot captured successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to capture screenshot",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to capture screenshot",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadScreenshot = () => {
    if (!screenshot) return;

    const link = document.createElement('a');
    link.href = screenshot;
    link.download = `screenshot-${selectedDevice}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!selectedDevice) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Please select a device from the Devices tab to capture screenshots.
      </div>
    );
  }

  const device = safeDevices[selectedDevice];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-sm text-muted-foreground">
            Device: {device?.name || device?.device_name || 'Unknown Device'}
          </div>
          <div className="text-xs text-muted-foreground">
            Resolution: {device?.width || 0}x{device?.height || 0}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {device?.state !== 0 ? (
            <Badge variant="default">Online</Badge>
          ) : (
            <Badge variant="secondary">Offline</Badge>
          )}
        </div>
      </div>

      <div className="flex space-x-2">
        <Button 
          onClick={takeScreenshot} 
          disabled={isLoading || device?.state === 0}
          className="flex-1"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Camera className="h-4 w-4 mr-2" />
          )}
          {isLoading ? 'Capturing...' : 'Take Screenshot'}
        </Button>
        
        {screenshot && (
          <Button onClick={downloadScreenshot} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        )}
      </div>

      {lastUpdate && (
        <div className="text-xs text-muted-foreground">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Device Screen</CardTitle>
          <CardDescription>
            Live view of the selected device screen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {screenshot ? (
            <div className="relative">
              <img 
                src={screenshot} 
                alt="Device Screenshot" 
                className="max-w-full h-auto border rounded-lg shadow-sm"
                style={{ maxHeight: '600px' }}
              />
              <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                {device?.width || 0}x{device?.height || 0}
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
              <Camera className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {device?.state === 0 
                  ? "Device is offline. Cannot capture screenshot."
                  : "Click 'Take Screenshot' to capture the device screen."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScreenshotViewer;
