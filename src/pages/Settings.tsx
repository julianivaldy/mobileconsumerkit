
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Settings as SettingsIcon, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmailVerificationDialog from "@/components/settings/EmailVerificationDialog";
import { ToolConfig, STORAGE_KEYS } from "@/types/common";

/**
 * Interface for verification dialog state
 */
interface VerificationDialogState {
  open: boolean;
  apiKeyType: string;
  toolNames: string[];
  onVerified: () => void;
}
/**
 * Settings Page Component
 * 
 * Provides interface for users to:
 * - Select which tools they want to use
 * - Configure API keys for selected tools
 * - Verify their email for tool access
 */
const Settings = () => {
  // State for API keys
  const [rapidApiKey, setRapidApiKey] = useState("");
  const [openAiKey, setOpenAiKey] = useState("");
  const [apifyApiKey, setApifyApiKey] = useState("");
  
  // State for tool selection and verification
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [verificationDialog, setVerificationDialog] = useState<VerificationDialogState>({
    open: false,
    apiKeyType: "",
    toolNames: [],
    onVerified: () => {},
  });
  const [verifiedKeys, setVerifiedKeys] = useState<string[]>([]);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  /**
   * Available tools configuration
   */
  const tools: ToolConfig[] = [
    { id: "idea-scan", name: "Idea Scan", apiKey: "openai" },
    { id: "reviews-scan", name: "Reviews Scan", apiKey: "rapidapi" },
    { id: "aso-scan", name: "ASO Scan", apiKey: "rapidapi" },
    { id: "tiktok-tracker", name: "Socials Scan", apiKey: "apify" },
    { id: "otg-control", name: "OTG Control", apiKey: "openai" },
    { id: "voice-control", name: "Voice Control", apiKey: "openai" },
  ];

  /**
   * Load stored values from localStorage on component mount
   */
  useEffect(() => {
    const storedRapidApiKey = localStorage.getItem(STORAGE_KEYS.RAPIDAPI_KEY);
    if (storedRapidApiKey) {
      setRapidApiKey(storedRapidApiKey);
    }

    const storedOpenAiKey = localStorage.getItem(STORAGE_KEYS.OPENAI_API_KEY);
    if (storedOpenAiKey) {
      setOpenAiKey(storedOpenAiKey);
    }

    const storedApifyApiKey = localStorage.getItem(STORAGE_KEYS.APIFY_API_TOKEN);
    if (storedApifyApiKey) {
      setApifyApiKey(storedApifyApiKey);
    }

    const storedTools = localStorage.getItem(STORAGE_KEYS.SELECTED_TOOLS);
    if (storedTools) {
      setSelectedTools(JSON.parse(storedTools));
    }

    const storedVerifiedKeys = localStorage.getItem(STORAGE_KEYS.VERIFIED_API_KEYS);
    if (storedVerifiedKeys) {
      setVerifiedKeys(JSON.parse(storedVerifiedKeys));
    }
  }, []);

  /**
   * Handles toggling of tool selection
   */
  const handleToolToggle = (toolId: string) => {
    const isCurrentlySelected = selectedTools.includes(toolId);
    
    // If user is deselecting a tool, allow it without verification
    if (isCurrentlySelected) {
      const updatedTools = selectedTools.filter(id => id !== toolId);
      setSelectedTools(updatedTools);
      localStorage.setItem(STORAGE_KEYS.SELECTED_TOOLS, JSON.stringify(updatedTools));
      return;
    }

    // If user is selecting a new tool and has no API keys AND no tools selected yet, show verification dialog
    if (!hasAnyApiKey() && selectedTools.length === 0) {
      const tool = tools.find(t => t.id === toolId);
      if (tool) {
        setVerificationDialog({
          open: true,
          apiKeyType: getApiKeyDisplayName(tool.apiKey),
          toolNames: [tool.name],
          onVerified: () => {
            const updatedTools = [...selectedTools, toolId];
            setSelectedTools(updatedTools);
            localStorage.setItem(STORAGE_KEYS.SELECTED_TOOLS, JSON.stringify(updatedTools));
            toast({
              title: "Tool Selected",
              description: `${tool.name} has been added to your selected tools.`,
            });
          },
        });
      }
    } else {
      // If user already has API keys or already selected tools (email provided), just add the tool directly
      const updatedTools = [...selectedTools, toolId];
      setSelectedTools(updatedTools);
      localStorage.setItem(STORAGE_KEYS.SELECTED_TOOLS, JSON.stringify(updatedTools));
    }
  };

  const hasAnyApiKey = () => {
    return !!(rapidApiKey || openAiKey || apifyApiKey);
  };

  /**
   * Opens email verification dialog for first-time API key setup
   */
  const openVerificationDialog = (apiKeyType: string, onVerified: () => void) => {
    // Only show verification dialog if no API keys have been added yet
    if (!hasAnyApiKey()) {
      const relatedTools = tools
        .filter(tool => selectedTools.includes(tool.id) && tool.apiKey === apiKeyType)
        .map(tool => tool.name);
      
      setVerificationDialog({
        open: true,
        apiKeyType: apiKeyType === "rapidapi" ? "RapidAPI" : apiKeyType === "openai" ? "OpenAI" : "Apify",
        toolNames: relatedTools,
        onVerified,
      });
    } else {
      // If user already has API keys, just save directly
      onVerified();
    }
  };

  const markKeyAsVerified = (keyType: string) => {
    const updatedVerifiedKeys = [...verifiedKeys, keyType];
    setVerifiedKeys(updatedVerifiedKeys);
    localStorage.setItem(STORAGE_KEYS.VERIFIED_API_KEYS, JSON.stringify(updatedVerifiedKeys));
  };

  const saveRapidApiKey = () => {
    openVerificationDialog("rapidapi", () => {
      localStorage.setItem(STORAGE_KEYS.RAPIDAPI_KEY, rapidApiKey);
      markKeyAsVerified("rapidapi");
      toast({
        title: "RapidAPI Key Saved",
        description: "Your RapidAPI key has been successfully saved and verified.",
      });
    });
  };

  const saveOpenAiKey = () => {
    openVerificationDialog("openai", () => {
      localStorage.setItem(STORAGE_KEYS.OPENAI_API_KEY, openAiKey);
      markKeyAsVerified("openai");
      toast({
        title: "OpenAI Key Saved",
        description: "Your OpenAI key has been successfully saved and verified.",
      });
    });
  };

  const saveApifyApiKey = () => {
    openVerificationDialog("apify", () => {
      localStorage.setItem(STORAGE_KEYS.APIFY_API_TOKEN, apifyApiKey);
      markKeyAsVerified("apify");
      toast({
        title: "Apify API Key Saved",
        description: "Your Apify API key has been successfully saved and verified.",
      });
    });
  };

  // Group selected tools by API key
  const getSelectedToolsByApiKey = (apiKeyType: string) => {
    return tools
      .filter(tool => selectedTools.includes(tool.id) && tool.apiKey === apiKeyType)
      .map(tool => tool.name);
  };

  const getApiKeyDisplayName = (apiKeyType: string) => {
    switch (apiKeyType) {
      case "rapidapi":
        return "RapidAPI";
      case "openai":
        return "OpenAI";
      case "apify":
        return "Apify";
      default:
        return apiKeyType;
    }
  };

  // Get all unique API keys needed by selected tools
  const neededApiKeys = [...new Set(
    selectedTools
      .map(toolId => tools.find(tool => tool.id === toolId)?.apiKey)
      .filter(Boolean)
  )];

  // Get all selected tools grouped by API key
  const allSelectedToolsGrouped = neededApiKeys.map(apiKeyType => ({
    apiKeyType,
    tools: getSelectedToolsByApiKey(apiKeyType),
    displayName: getApiKeyDisplayName(apiKeyType)
  })).filter(group => group.tools.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center text-black hover:text-gray-700 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        
        <div className="mb-8 text-left">
          <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground text-lg">Configure your tools and API keys</p>
        </div>

        <Card className="shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <SettingsIcon className="h-5 w-5 mr-2" />
              Tool selection
            </CardTitle>
            <CardDescription>Choose which tools you want to use</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tools.map((tool) => (
                <div key={tool.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={tool.id}
                    checked={selectedTools.includes(tool.id)}
                    onCheckedChange={() => handleToolToggle(tool.id)}
                  />
                  <Label 
                    htmlFor={tool.id} 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                  >
                    {tool.name}
                  </Label>
                  <div className="flex items-center space-x-2">
                    {selectedTools.includes(tool.id) && verifiedKeys.includes(tool.apiKey) && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {allSelectedToolsGrouped.length > 0 && (
          <Card className="shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                API Keys Configuration
                {allSelectedToolsGrouped.every(group => verifiedKeys.includes(group.apiKeyType)) && (
                  <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                )}
              </CardTitle>
              <CardDescription>
                Configure API keys for your selected tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {allSelectedToolsGrouped.map((group) => {
                let currentApiKey = "";
                let saveFunction = () => {};
                
                switch (group.apiKeyType) {
                  case "rapidapi":
                    currentApiKey = rapidApiKey;
                    saveFunction = saveRapidApiKey;
                    break;
                  case "openai":
                    currentApiKey = openAiKey;
                    saveFunction = saveOpenAiKey;
                    break;
                  case "apify":
                    currentApiKey = apifyApiKey;
                    saveFunction = saveApifyApiKey;
                    break;
                }

                return (
                  <div key={group.apiKeyType} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground flex items-center">
                          {group.tools.join(", ")}
                          {verifiedKeys.includes(group.apiKeyType) && (
                            <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          In order to use {group.tools.join(", ")}, you need {group.displayName} API key.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`${group.apiKeyType}-api-key`}>{group.displayName} API Key</Label>
                      {group.apiKeyType === "rapidapi" && (
                        <p className="text-sm text-muted-foreground">
                          You need a pro subscription to{" "}
                          <a 
                            href="https://rapidapi.com/SafeDev/api/aso-report" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            ASO Report by Safedev
                          </a>
                        </p>
                      )}
                      <Input
                        id={`${group.apiKeyType}-api-key`}
                        placeholder={`Enter your ${group.displayName} API key`}
                        type="password"
                        value={currentApiKey}
                        onChange={(e) => {
                          switch (group.apiKeyType) {
                            case "rapidapi":
                              setRapidApiKey(e.target.value);
                              break;
                            case "openai":
                              setOpenAiKey(e.target.value);
                              break;
                            case "apify":
                              setApifyApiKey(e.target.value);
                              break;
                          }
                        }}
                      />
                      <Button onClick={saveFunction} size="sm">Save {group.displayName} Key</Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {selectedTools.length === 0 && (
          <Card className="shadow-sm border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Please select at least one tool above to configure your API keys.
              </p>
            </CardContent>
          </Card>
        )}

        <EmailVerificationDialog
          open={verificationDialog.open}
          onOpenChange={(open) => setVerificationDialog(prev => ({ ...prev, open }))}
          onVerified={verificationDialog.onVerified}
          apiKeyType={verificationDialog.apiKeyType}
          toolNames={verificationDialog.toolNames}
        />
      </div>
    </div>
  );
};

export default Settings;
