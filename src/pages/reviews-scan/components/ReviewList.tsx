import ReviewCard from "./ReviewCard";

interface Review {
  id: string;
  userName: string;
  rating: number;
  title: string;
  content: string;
  date: string;
}

interface ReviewListProps {
  reviews: Review[];
}

const ReviewList = ({ reviews }: ReviewListProps) => {
  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
      
      {reviews.length > 0 && (
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Showing {reviews.length} reviews
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewList;