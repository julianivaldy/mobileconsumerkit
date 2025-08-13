import React, { useState, useEffect } from "react";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader, ArrowLeft, Clock, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import SearchForm, { FormValues } from "./components/SearchForm";
import ResultsTable from "./components/ResultsTable";
import CreatorAnalysisForm from "./components/CreatorAnalysisForm";
import { TikTokVideo } from "./components/types";
import { fetchTikTokData } from "./components/TikTokAPI";
import FeatureAlert from "@/components/common/FeatureAlert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Socials Scan page component
 * Analyzes social media performance across different accounts and platforms
 */
const SocialsScanPage = () => {
  useScrollToTop();
  
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TikTokVideo[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isToolSelected, setIsToolSelected] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Starting analysis...");

  useEffect(() => {
    const apiKey = localStorage.getItem('apify_api_token');
    setHasApiKey(!!apiKey?.trim());

    const selectedTools = localStorage.getItem('selected_tools');
    if (selectedTools) {
      const tools = JSON.parse(selectedTools);
      setIsToolSelected(tools.includes('tiktok-tracker'));
    }
  }, []);

  const canUseFeature = hasApiKey && isToolSelected;

  /**
   * Handles form submission and social media data fetching
   */
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setResults([]);
    setHasSearched(true);
    setLoadingMessage("Starting analysis...");
    
    try {
      // Update loading message after a few seconds
      const messageTimer = setTimeout(() => {
        setLoadingMessage("Processing your request... This may take a few minutes.");
      }, 3000);

      // Update loading message again after more time
      const messageTimer2 = setTimeout(() => {
        setLoadingMessage("Still processing... The API is working hard to gather your data.");
      }, 30000);

      const responseData = await fetchTikTokData(data);
      
      clearTimeout(messageTimer);
      clearTimeout(messageTimer2);
      
      if (responseData.length > 0) {
        setResults(responseData);
        toast({
          title: "Success!",
          description: `Found ${responseData.length} videos for ${data.usernames.length} account${data.usernames.length > 1 ? "s" : ""}`,
        });
      } else {
        toast({
          title: "No videos found",
          description: `No videos found for the selected usernames and time period`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching social media data:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch social media data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLoadingMessage("Starting analysis...");
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
            <h1 className="text-4xl font-bold tracking-tight">Socials Scan</h1>
            <p className="text-xl text-muted-foreground">
              Analyze the performance of your social media posts across different accounts
            </p>
          </div>

          <FeatureAlert 
            isToolSelected={isToolSelected}
            hasApiKey={hasApiKey}
            toolName="Socials Scan"
            apiKeyName="Apify API key"
          />

          {/* Tabs for different analysis types */}
          <Tabs defaultValue="performance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Performance Analysis
              </TabsTrigger>
              <TabsTrigger value="creator" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Creator Analysis
              </TabsTrigger>
            </TabsList>

            <TabsContent value="performance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Social Media Performance Analysis</CardTitle>
                  <CardDescription>
                    Track performance metrics across multiple TikTok accounts
                  </CardDescription>
                </CardHeader>
                <CardContent className={`${isMobile ? "p-4" : "p-6"} ${!canUseFeature ? "opacity-50 cursor-not-allowed" : ""}`}>
                  <SearchForm onSubmit={onSubmit} isLoading={isLoading} />
                  
                  {hasSearched && (
                    <div className="mt-10">
                      {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-10">
                          <Loader className="h-10 w-10 animate-spin text-gray-400 mb-4" />
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <p className="text-gray-600 font-medium">{loadingMessage}</p>
                          </div>
                          <p className="text-sm text-gray-500 text-center max-w-md">
                            The API is processing your request. This can take up to 5 minutes depending on the number of accounts and posts.
                          </p>
                        </div>
                      ) : results.length > 0 ? (
                        <div>
                          <h3 className="text-xl font-semibold mb-4">Results</h3>
                          <ResultsTable results={results} />
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <p className="text-muted-foreground">No results found. Try adjusting your search parameters.</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="creator" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Creator Profile Analysis</CardTitle>
                  <CardDescription>
                    Get detailed insights about individual TikTok creators
                  </CardDescription>
                </CardHeader>
                <CardContent className={!canUseFeature ? "opacity-50 cursor-not-allowed" : ""}>
                  <CreatorAnalysisForm />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SocialsScanPage;