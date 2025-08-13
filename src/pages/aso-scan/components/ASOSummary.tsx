
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ASOSummaryProps {
  keywords: string;
  permissions?: string;
}

const ASOSummary = ({ keywords, permissions }: ASOSummaryProps) => {
  const [expanded, setExpanded] = useState(false);

  const keywordsList = keywords
    .split(",")
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-3 text-left">Keywords Analysis</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {keywordsList.slice(0, expanded ? keywordsList.length : 10).map((keyword, index) => (
              <Badge key={index} variant="outline" className="bg-gray-100 text-gray-800">
                {keyword}
              </Badge>
            ))}
            {keywordsList.length > 10 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-blue-600 text-sm flex items-center"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Show More ({keywordsList.length - 10} more)
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {permissions && (
          <div>
            <h3 className="font-semibold mb-3 text-left">Permissions</h3>
            <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap text-sm">
              {permissions}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ASOSummary;
