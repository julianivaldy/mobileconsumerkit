
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, BookOpen, Star, Download, User, Calendar, Tag, TrendingUp } from "lucide-react";
import { AppAnalysisData } from "@/types/common";
/**
 * Interface for ASO Analysis component props
 */
interface ASOAnalysisProps {
  analysisData?: AppAnalysisData;
  analyzing: boolean;
  onAnalyze: () => void;
  disabled: boolean;
}

/**
 * ASO Analysis Component
 * 
 * Displays comprehensive App Store Optimization analysis results
 * including app overview, performance scores, keywords, and recommendations.
 */
const ASOAnalysis = ({
  analysisData,
  analyzing,
  onAnalyze,
  disabled
}: ASOAnalysisProps) => {
  const hasAnalysis = !!analysisData;

  if (!hasAnalysis && !analyzing) {
    return null;
  }

  /**
   * Returns appropriate color class based on score value
   */
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <>
      {!hasAnalysis && (
        <div className="text-center">
          <Button
            onClick={onAnalyze}
            disabled={disabled}
            variant="secondary"
            className="w-full"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Analyzing ASO...
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 mr-2" />
                Analyse ASO
              </>
            )}
          </Button>
        </div>
      )}

      {hasAnalysis && !analyzing && analysisData && (
        <div className="space-y-6">
          {/* App Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                App Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-lg mb-2">{analysisData.title}</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{analysisData.developer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      <span>{analysisData.downloads} downloads</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      <span>{analysisData.rating}/5 rating</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>v{analysisData.version} • {analysisData.lastUpdated}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">{analysisData.category}</Badge>
                  <p className="text-sm text-muted-foreground line-clamp-4">
                    {analysisData.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ASO Performance Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                ASO Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Title Optimization</span>
                    <span className={`text-sm font-bold ${getScoreColor(analysisData.analysis.titleScore)}`}>
                      {analysisData.analysis.titleScore}%
                    </span>
                  </div>
                  <Progress value={analysisData.analysis.titleScore} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Description Quality</span>
                    <span className={`text-sm font-bold ${getScoreColor(analysisData.analysis.descriptionScore)}`}>
                      {analysisData.analysis.descriptionScore}%
                    </span>
                  </div>
                  <Progress value={analysisData.analysis.descriptionScore} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Keyword Density</span>
                    <span className={`text-sm font-bold ${getScoreColor(analysisData.analysis.keywordDensity)}`}>
                      {analysisData.analysis.keywordDensity}%
                    </span>
                  </div>
                  <Progress value={analysisData.analysis.keywordDensity} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Keywords */}
          <Card>
            <CardHeader>
              <CardTitle>Keywords Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(analysisData.keywords) && analysisData.keywords.map((keyword, index) => (
                  <Badge key={index} variant="outline">
                    {typeof keyword === 'string' ? keyword : keyword?.name || keyword?.id || JSON.stringify(keyword)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>ASO Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysisData.analysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default ASOAnalysis;
