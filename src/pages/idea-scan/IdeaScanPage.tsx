import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import IdeaScanResults from "./components/IdeaScanResults";
import IdeaScanForm from "./components/IdeaScanForm";
import PageHeader from "./components/PageHeader";
import FeatureAlert from "@/components/common/FeatureAlert";
import { IdeaScanData, IdeaScanResult } from "./components/types";
import { calculateJudgeSpecificScores, calculateOverallScore, getJudgeFeedback } from "./components/judgeData";
import { getAIFeedback } from "./services/openai";

/**
 * Idea Scan page component
 * Allows users to get feedback from industry experts on their app ideas
 */
const IdeaScanPage = () => {
  useScrollToTop();
  
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<IdeaScanResult | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isToolSelected, setIsToolSelected] = useState(false);

  // Form state
  const [formData, setFormData] = useState<IdeaScanData>({
    idea: "",
    category: "",
    targetAudience: "",
    complexity: 3,
    monetization: "",
    shareability: "",
    judge: "all"
  });

  useEffect(() => {
    const apiKey = localStorage.getItem('openai_api_key');
    setHasApiKey(!!apiKey?.trim());

    const selectedTools = localStorage.getItem('selected_tools');
    if (selectedTools) {
      const tools = JSON.parse(selectedTools);
      setIsToolSelected(tools.includes('idea-scan'));
    }
  }, []);

  /**
   * Handles form field changes
   */
  const handleInputChange = (field: keyof IdeaScanData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Handles form submission and idea analysis
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if API key is required and missing
    if (!hasApiKey) {
      toast({
        title: "OpenAI API Key Required",
        description: "Please add your OpenAI API key in Settings to use Idea Scan.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.idea.trim()) {
      toast({
        title: "Error",
        description: "Please describe your app idea.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get AI-generated personalized feedback
      const aiFeedback = await getAIFeedback(formData, 0);
      if (!aiFeedback) {
        throw new Error("Failed to get AI feedback");
      }

      // Calculate scores based on judge perspective
      const categoryScores = calculateJudgeSpecificScores(formData);
      const overallScore = calculateOverallScore(categoryScores, formData.judge);
      const feedback = getJudgeFeedback(overallScore, formData.judge);

      const result: IdeaScanResult = {
        score: overallScore,
        label: feedback.label,
        description: feedback.description,
        personalizedFeedback: aiFeedback,
        categories: categoryScores,
        rawData: formData
      };

      setResults(result);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete idea scan. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <PageHeader />

        <FeatureAlert 
          isToolSelected={isToolSelected}
          hasApiKey={hasApiKey}
          toolName="Idea Scan"
          apiKeyName="OpenAI API key"
        />

        <div className={`${!hasApiKey || !isToolSelected ? "cursor-not-allowed" : ""}`}>
          <IdeaScanForm
            formData={formData}
            loading={loading}
            hasApiKey={hasApiKey}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
          />
        </div>

        {results && (
          <div className="mt-8">
            <IdeaScanResults result={results} />
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeaScanPage;