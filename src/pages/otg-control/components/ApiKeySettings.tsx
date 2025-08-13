
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface ApiKeySettingsProps {
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
  onSaveApiKey: () => void;
}

const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({
  apiKey,
  onApiKeyChange,
  onSaveApiKey
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          API Configuration
        </CardTitle>
        <CardDescription>
          Configure OpenAI API key for AI and OCR services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="openai-key">OpenAI API Key</Label>
          <Input
            id="openai-key"
            type="password"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="sk-..."
          />
          <p className="text-xs text-muted-foreground mt-1">
            This key will be used for both AI rule processing and OCR (text extraction from screenshots)
          </p>
        </div>
        <Button onClick={onSaveApiKey} className="w-full">
          Save API Key
        </Button>
      </CardContent>
    </Card>
  );
};

export default ApiKeySettings;
