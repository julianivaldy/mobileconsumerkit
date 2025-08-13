
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mouse, Move, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { farmAPI } from '../services/farmAPI';
import { useToast } from '@/hooks/use-toast';

interface MouseControlProps {
  selectedDevice: string;
  devices: any;
}

const MouseControl: React.FC<MouseControlProps> = ({ selectedDevice, devices = {} }) => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState('up');
  const [swipeLength, setSwipeLength] = useState(0.9);
  const { toast } = useToast();

  const safeDevices = devices || {};

  const showResult = (response: any, action: string) => {
    if (response.status === 0) {
      toast({
        title: "Success",
        description: `${action} executed successfully`,
      });
    } else {
      toast({
        title: "Error",
        description: `${action} failed: ${response.message}`,
        variant: "destructive",
      });
    }
  };

  const handleClick = async (button: string = 'left') => {
    if (!selectedDevice) {
      toast({
        title: "No Device Selected",
        description: "Please select a device first",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await farmAPI.mouseClick(selectedDevice, x, y, button);
      showResult(response, `${button} click`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send mouse click",
        variant: "destructive",
      });
    }
  };

  const handleMove = async () => {
    if (!selectedDevice) return;

    try {
      const response = await farmAPI.mouseMove(selectedDevice, x, y);
      showResult(response, 'Mouse move');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move mouse",
        variant: "destructive",
      });
    }
  };

  const handleSwipe = async () => {
    if (!selectedDevice) return;

    try {
      const response = await farmAPI.mouseSwipe(selectedDevice, {
        direction: swipeDirection,
        length: swipeLength,
        button: 'left'
      });
      showResult(response, 'Swipe');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to swipe",
        variant: "destructive",
      });
    }
  };

  const handleReset = async () => {
    if (!selectedDevice) return;

    try {
      const response = await farmAPI.mouseReset(selectedDevice);
      showResult(response, 'Mouse reset');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset mouse",
        variant: "destructive",
      });
    }
  };

  const handleWheel = async (direction: string) => {
    if (!selectedDevice) return;

    try {
      const response = await farmAPI.mouseWheel(selectedDevice, direction);
      showResult(response, `Wheel ${direction}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to scroll wheel",
        variant: "destructive",
      });
    }
  };

  if (!selectedDevice) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Please select a device from the Devices tab to control mouse actions.
      </div>
    );
  }

  const device = safeDevices[selectedDevice];

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        Controlling: {device?.name || device?.device_name || 'Unknown Device'} ({device?.width || 0}x{device?.height || 0})
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mouse className="h-5 w-5 mr-2" />
              Click Control
            </CardTitle>
            <CardDescription>Click at specific coordinates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="x-coord">X Coordinate</Label>
                <Input
                  id="x-coord"
                  type="number"
                  value={x}
                  onChange={(e) => setX(Number(e.target.value))}
                  max={device?.width || 1000}
                />
              </div>
              <div>
                <Label htmlFor="y-coord">Y Coordinate</Label>
                <Input
                  id="y-coord"
                  type="number"
                  value={y}
                  onChange={(e) => setY(Number(e.target.value))}
                  max={device?.height || 1000}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => handleClick('left')} className="flex-1">
                Left Click
              </Button>
              <Button onClick={() => handleClick('right')} variant="outline" className="flex-1">
                Right Click
              </Button>
            </div>
            <Button onClick={handleMove} variant="outline" className="w-full">
              <Move className="h-4 w-4 mr-2" />
              Move to Position
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Swipe Control</CardTitle>
            <CardDescription>Perform swipe gestures</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="swipe-direction">Direction</Label>
              <Select value={swipeDirection} onValueChange={setSwipeDirection}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="up">Up</SelectItem>
                  <SelectItem value="down">Down</SelectItem>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="swipe-length">Length (0.1 - 1.0)</Label>
              <Input
                id="swipe-length"
                type="number"
                step="0.1"
                min="0.1"
                max="1.0"
                value={swipeLength}
                onChange={(e) => setSwipeLength(Number(e.target.value))}
              />
            </div>
            <Button onClick={handleSwipe} className="w-full">
              Perform Swipe
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wheel & Reset</CardTitle>
            <CardDescription>Scroll and reset functions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Button onClick={() => handleWheel('up')} variant="outline" className="flex-1">
                <ArrowUp className="h-4 w-4 mr-2" />
                Scroll Up
              </Button>
              <Button onClick={() => handleWheel('down')} variant="outline" className="flex-1">
                <ArrowDown className="h-4 w-4 mr-2" />
                Scroll Down
              </Button>
            </div>
            <Button onClick={handleReset} variant="secondary" className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Position
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MouseControl;
