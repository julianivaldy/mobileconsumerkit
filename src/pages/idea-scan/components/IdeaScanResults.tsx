
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Lightbulb, 
  Users, 
  Puzzle, 
  DollarSign, 
  Share2, 
  Info,
  Quote
} from "lucide-react";
import { IdeaScanResult } from "./types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { judgeProfiles } from "./judgeData";

interface ScoreBarProps {
  score: number;
  label: string;
  icon: React.ReactNode;
}

const ScoreBar = ({ score, label, icon }: ScoreBarProps) => {
  // Determine color based on score
  let barColor = "";
  if (score >= 80) barColor = "bg-green-500";
  else if (score >= 60) barColor = "bg-lime-500";
  else if (score >= 40) barColor = "bg-yellow-500";
  else if (score >= 20) barColor = "bg-orange-500";
  else barColor = "bg-red-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm font-bold">{score}/100</span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${barColor} rounded-full transition-all duration-500`} 
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

interface IdeaScanResultsProps {
  result: IdeaScanResult;
}

const IdeaScanResults = ({ result }: IdeaScanResultsProps) => {
  const { score, label, description, categories, rawData, personalizedFeedback } = result;
  
  // Determine the overall score color
  let scoreColor = "";
  if (score >= 80) scoreColor = "text-green-600";
  else if (score >= 60) scoreColor = "text-lime-600";
  else if (score >= 40) scoreColor = "text-yellow-600";
  else if (score >= 20) scoreColor = "text-orange-600";
  else scoreColor = "text-red-600";

  const judgeInfo = judgeProfiles[rawData.judge] || judgeProfiles.all;

  return (
    <>
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Your Idea Score</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1 text-left">
                {rawData.judge !== "all" && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage 
                      src={judgeInfo.image} 
                      alt={judgeInfo.name}
                      className="object-cover object-center" 
                    />
                    <AvatarFallback>{judgeInfo.name[0]}</AvatarFallback>
                  </Avatar>
                )}
                Evaluated by {judgeInfo.name}
              </CardDescription>
            </div>
            <div className={`text-5xl font-bold ${scoreColor}`}>
              {score}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className={`text-xl font-bold mb-2 ${scoreColor}`}>{label}</h3>
            <p className="text-gray-600">{description}</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg mb-4">
            <h4 className="font-semibold mb-1">Your Idea:</h4>
            <p className="text-gray-600">{rawData.idea}</p>
          </div>

          {personalizedFeedback && (
            <div className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-white p-6 rounded-r-lg mb-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
                  <Quote className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-blue-900 mb-3 text-lg">Direct Feedback</h4>
                  <div className="prose prose-blue max-w-none">
                    <p className="text-blue-800 leading-relaxed whitespace-pre-line text-sm">
                      {personalizedFeedback}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {rawData.judge !== "all" && (
            <div className="p-4 bg-gray-100 rounded-lg mb-4">
              <h4 className="font-semibold mb-1 text-gray-800 text-left">Judge Perspective:</h4>
              <p className="text-gray-700 text-sm text-left">
                {judgeInfo.name} specializes in {judgeInfo.focusAreas.join(", ")}. 
                Their feedback style is {judgeInfo.feedbackStyle}.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>
            See how your idea scores across different dimensions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ScoreBar 
            score={categories.category} 
            label="Problem Category" 
            icon={<Lightbulb className="h-4 w-4" />} 
          />
          
          <ScoreBar 
            score={categories.targetAudience} 
            label="Target Audience" 
            icon={<Users className="h-4 w-4" />} 
          />
          
          <ScoreBar 
            score={categories.complexity} 
            label="App Complexity" 
            icon={<Puzzle className="h-4 w-4" />} 
          />
          
          <ScoreBar 
            score={categories.monetization} 
            label="Monetization" 
            icon={<DollarSign className="h-4 w-4" />} 
          />
          
          <ScoreBar 
            score={categories.shareability} 
            label="Shareability" 
            icon={<Share2 className="h-4 w-4" />} 
          />
          
          <div className="p-4 bg-blue-50 rounded-lg mt-4 text-sm flex gap-2 text-blue-800">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">About this evaluation:</p>
              <p>This is a high-level assessment based on industry best practices. 
              The score is meant to guide your thinking, not to definitively judge 
              the viability of your idea.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default IdeaScanResults;
