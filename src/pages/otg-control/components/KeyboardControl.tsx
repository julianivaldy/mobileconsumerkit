
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Keyboard, Type, Command } from 'lucide-react';
import { farmAPI } from '../services/farmAPI';
import { useToast } from '@/hooks/use-toast';

interface KeyboardControlProps {
  selectedDevice: string;
  devices: any;
}

const KeyboardControl: React.FC<KeyboardControlProps> = ({ selectedDevice, devices = {} }) => {
  const [textInput, setTextInput] = useState('');
  const [singleKey, setSingleKey] = useState('');
  const [hotkey, setHotkey] = useState('');
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

  const handleSendText = async () => {
    if (!selectedDevice || !textInput) return;

    try {
      const response = await farmAPI.sendKey(selectedDevice, textInput);
      showResult(response, 'Text input');
      setTextInput('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send text",
        variant: "destructive",
      });
    }
  };

  const handleSendHotkey = async () => {
    if (!selectedDevice || !hotkey) return;

    try {
      const response = await farmAPI.sendKey(selectedDevice, undefined, hotkey);
      showResult(response, 'Hotkey');
      setHotkey('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send hotkey",
        variant: "destructive",
      });
    }
  };

  const handleKeyAction = async (action: string, key?: string) => {
    if (!selectedDevice) return;

    try {
      let response;
      switch (action) {
        case 'down':
          response = await farmAPI.keyDown(selectedDevice, key || singleKey);
          break;
        case 'up':
          response = await farmAPI.keyUp(selectedDevice, key || singleKey);
          break;
        case 'release_all':
          response = await farmAPI.keyReleaseAll(selectedDevice);
          break;
        default:
          return;
      }
      showResult(response, `Key ${action}`);
      if (action !== 'release_all') setSingleKey('');
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to execute key ${action}`,
        variant: "destructive",
      });
    }
  };

  const quickKeys = [
    { label: 'Home', value: 'WIN+h' },
    { label: 'Back', value: 'ESC' },
    { label: 'Enter', value: 'ENTER' },
    { label: 'Space', value: 'SPACE' },
    { label: 'Tab', value: 'TAB' },
    { label: 'Backspace', value: 'BACKSPACE' },
    { label: 'Screenshot', value: 'WIN+SHIFT+3' },
    { label: 'App Switch', value: 'ALT+TAB' }
  ];

  if (!selectedDevice) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Please select a device from the Devices tab to control keyboard input.
      </div>
    );
  }

  const device = safeDevices[selectedDevice];

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        Controlling: {device?.name || device?.device_name || 'Unknown Device'}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Type className="h-5 w-5 mr-2" />
              Text Input
            </CardTitle>
            <CardDescription>Send text strings to the device</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="text-input">Text to Send</Label>
              <Textarea
                id="text-input"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter text to send..."
                rows={3}
              />
            </div>
            <Button onClick={handleSendText} className="w-full" disabled={!textInput}>
              Send Text
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Command className="h-5 w-5 mr-2" />
              Hotkeys
            </CardTitle>
            <CardDescription>Send keyboard shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="hotkey-input">Hotkey Combination</Label>
              <Input
                id="hotkey-input"
                value={hotkey}
                onChange={(e) => setHotkey(e.target.value)}
                placeholder="e.g., WIN+h, CTRL+C, ALT+TAB"
              />
            </div>
            <Button onClick={handleSendHotkey} className="w-full" disabled={!hotkey}>
              Send Hotkey
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Keyboard className="h-5 w-5 mr-2" />
              Single Key Control
            </CardTitle>
            <CardDescription>Control individual key presses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="single-key">Key</Label>
              <Input
                id="single-key"
                value={singleKey}
                onChange={(e) => setSingleKey(e.target.value)}
                placeholder="e.g., a, 1, ENTER, ESC"
              />
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={() => handleKeyAction('down')} 
                variant="outline" 
                className="flex-1"
                disabled={!singleKey}
              >
                Key Down
              </Button>
              <Button 
                onClick={() => handleKeyAction('up')} 
                variant="outline" 
                className="flex-1"
                disabled={!singleKey}
              >
                Key Up
              </Button>
            </div>
            <Button 
              onClick={() => handleKeyAction('release_all')} 
              variant="secondary" 
              className="w-full"
            >
              Release All Keys
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common keyboard shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {quickKeys.map((key) => (
                <Button
                  key={key.value}
                  onClick={() => handleSendHotkey()}
                  variant="outline"
                  size="sm"
                  onMouseDown={() => setHotkey(key.value)}
                >
                  {key.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KeyboardControl;
