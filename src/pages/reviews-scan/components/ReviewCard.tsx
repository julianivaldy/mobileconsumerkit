
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReviewCardProps {
  review: {
    id: string;
    userName: string;
    rating: number;
    title: string;
    content: string;
    date: string;
  };
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const { toast } = useToast();

  const copyReview = () => {
    navigator.clipboard.writeText(review.content);
    toast({
      title: "Copied!",
      description: "Review copied to clipboard",
    });
  };

  // Format the date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card key={review.id} className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg">{review.userName}</h3>
          <div className="flex items-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={copyReview}
          className="hover:bg-gray-100"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <h4 className="font-medium mb-2">{review.title}</h4>
      <p className="text-gray-600">{review.content}</p>
    </Card>
  );
};

export default ReviewCard;
