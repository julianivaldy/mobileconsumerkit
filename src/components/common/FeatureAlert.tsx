
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FeatureAlertProps {
  isToolSelected: boolean;
  hasApiKey: boolean;
  toolName: string;
  apiKeyName: string;
}

const FeatureAlert = ({ isToolSelected, hasApiKey, toolName, apiKeyName }: FeatureAlertProps) => {
  const navigate = useNavigate();
  const canUseFeature = hasApiKey && isToolSelected;

  const handleGoToSettings = () => {
    navigate('/settings');
  };

  if (canUseFeature) return null;

  const getMessage = () => {
    if (!isToolSelected && !hasApiKey) {
      return `Please enable ${toolName} and add your ${apiKeyName} in Settings to use this feature.`;
    }
    if (!isToolSelected) {
      return `Please enable ${toolName} in Settings to use this feature.`;
    }
    return `${apiKeyName} is required to use ${toolName}. Please add your API key in Settings.`;
  };

  return (
    <Alert className="border-orange-200 bg-orange-50 mb-6">
      <AlertDescription className="text-orange-800">
        <div className="flex items-center justify-between">
          <span>{getMessage()}</span>
          <Button 
            onClick={handleGoToSettings}
            variant="outline"
            size="sm"
            className="ml-4"
          >
            Go to Settings
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default FeatureAlert;
