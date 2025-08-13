import { useState, useEffect } from "react";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReviewAnalysis from "./components/ReviewAnalysis";
import FeatureAlert from "@/components/common/FeatureAlert";
import { STORAGE_KEYS, ApiResponse } from "@/types/common";

/**
 * Reviews Scan Page Component
 * 
 * Allows users to analyze app reviews from Google Play Store
 * by entering a Play Store URL and fetching review data from ASO Report API.
 */
const ReviewsScanPage = () => {
  useScrollToTop();
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [appData, setAppData] = useState<any>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isToolSelected, setIsToolSelected] = useState(false);

  /**
   * Check API key and tool selection status on component mount
   */
  useEffect(() => {
    const apiKey = localStorage.getItem(STORAGE_KEYS.RAPIDAPI_KEY);
    setHasApiKey(!!apiKey?.trim());

    const selectedTools = localStorage.getItem(STORAGE_KEYS.SELECTED_TOOLS);
    if (selectedTools) {
      const tools = JSON.parse(selectedTools);
      setIsToolSelected(tools.includes('reviews-scan'));
    }
  }, []);

  const canUseFeature = hasApiKey && isToolSelected;

  /**
   * Extracts package name from Google Play Store URL
   */
  const extractPackageName = (url: string) => {
    const match = url.match(/id=([^&]+)/);
    if (match) return match[1];
    return null;
  };

  /**
   * Handles form submission and review fetching
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canUseFeature) {
      if (!hasApiKey) {
        toast({
          title: "API Key Required",
          description: "Please add your RapidAPI key in Settings to use Reviews Scan.",
          variant: "destructive",
        });
      } else if (!isToolSelected) {
        toast({
          title: "Tool Not Selected",
          description: "Please enable Reviews Scan in Settings to use this feature.",
          variant: "destructive",
        });
      }
      return;
    }

    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Google Play Store URL.",
        variant: "destructive",
      });
      return;
    }

    // Extract package name from Google Play Store URL
    const match = url.match(/id=([^&]+)/);
    if (!match) {
      toast({
        title: "Invalid URL",
        description: "Invalid Google Play Store URL. Please check the format.",
        variant: "destructive",
      });
      return;
    }
    
    const packageName = match[1];

    setLoading(true);
    try {
      const rapidApiKey = localStorage.getItem(STORAGE_KEYS.RAPIDAPI_KEY);
      
      if (!rapidApiKey) {
        throw new Error("RapidAPI key not found");
      }

      // Use the correct ASO Report API endpoint for reviews
      const apiUrl = `https://aso-report.p.rapidapi.com/rplay/app/reviews/${packageName}`;
      
      const headers = {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": "aso-report.p.rapidapi.com",
      };

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result: ApiResponse = await response.json();

      if (result.success && result.data) {
        setAppData(result.data);
        
        toast({
          title: "Success",
          description: "Reviews analysis completed successfully!",
        });
      } else {
        throw new Error(result.message || "Failed to fetch reviews data");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      toast({
        title: "Error",
        description: errorMessage || "Failed to analyze reviews. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
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
            <h1 className="text-4xl font-bold tracking-tight">Reviews Scan</h1>
            <p className="text-xl text-muted-foreground">
              Analyze app reviews to identify user pain points and feature requests
            </p>
          </div>

          <FeatureAlert 
            isToolSelected={isToolSelected}
            hasApiKey={hasApiKey}
            toolName="Reviews Scan"
            apiKeyName="RapidAPI key"
          />

          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Enter Google Play Store URL</CardTitle>
              <CardDescription>
                Analyze app reviews from the Google Play Store
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="app-url">Google Play Store URL</Label>
                  <Input
                    id="app-url"
                    type="url"
                    placeholder="https://play.google.com/store/apps/details?id=com.example.app"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={!canUseFeature}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading || !canUseFeature}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Reviews...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Analyze Reviews
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          {appData && (
            <ReviewAnalysis appData={appData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsScanPage;