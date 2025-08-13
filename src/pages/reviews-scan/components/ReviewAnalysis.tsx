
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import ReviewList from "./ReviewList";

interface Review {
  id: string;
  userName: string;
  userImage: string;
  date: string;
  score: number;
  scoreText: string;
  url: string;
  title: string | null;
  text: string;
  replyDate: string | null;
  replyText: string | null;
  version: string;
  thumbsUp: number;
  criterias: any[];
}

interface ReviewAnalysisProps {
  appData: Review[];
}

const ReviewAnalysis = ({ appData }: ReviewAnalysisProps) => {
  if (!appData || !Array.isArray(appData)) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">No review data available to analyze.</p>
      </Card>
    );
  }

  // Transform the data to match our ReviewCard component format
  const transformedReviews = appData.map(review => ({
    id: review.id,
    userName: review.userName,
    rating: review.score,
    title: review.title || `Review by ${review.userName}`,
    content: review.text,
    date: review.date
  }));

  // Categorize reviews
  const positiveReviews = transformedReviews.filter(review => review.rating >= 4);
  const neutralReviews = transformedReviews.filter(review => review.rating === 3);
  const negativeReviews = transformedReviews.filter(review => review.rating <= 2);

  // Calculate statistics
  const totalReviews = transformedReviews.length;
  const averageRating = totalReviews > 0 
    ? (transformedReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
    : 0;

  const positivePercentage = totalReviews > 0 ? Math.round((positiveReviews.length / totalReviews) * 100) : 0;
  const neutralPercentage = totalReviews > 0 ? Math.round((neutralReviews.length / totalReviews) * 100) : 0;
  const negativePercentage = totalReviews > 0 ? Math.round((negativeReviews.length / totalReviews) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Review Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalReviews}</div>
              <div className="text-sm text-muted-foreground">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{averageRating}</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{positivePercentage}%</div>
              <div className="text-sm text-muted-foreground">Positive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{negativePercentage}%</div>
              <div className="text-sm text-muted-foreground">Negative</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {positiveReviews.length} Positive (4-5 stars)
            </Badge>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {neutralReviews.length} Neutral (3 stars)
            </Badge>
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              {negativeReviews.length} Negative (1-2 stars)
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Reviews Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All ({totalReviews})</TabsTrigger>
              <TabsTrigger value="positive">Positive ({positiveReviews.length})</TabsTrigger>
              <TabsTrigger value="neutral">Neutral ({neutralReviews.length})</TabsTrigger>
              <TabsTrigger value="negative">Negative ({negativeReviews.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <ReviewList reviews={transformedReviews} />
            </TabsContent>
            
            <TabsContent value="positive" className="mt-6">
              <ReviewList reviews={positiveReviews} />
            </TabsContent>
            
            <TabsContent value="neutral" className="mt-6">
              <ReviewList reviews={neutralReviews} />
            </TabsContent>
            
            <TabsContent value="negative" className="mt-6">
              <ReviewList reviews={negativeReviews} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewAnalysis;
