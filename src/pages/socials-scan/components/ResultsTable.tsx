
import React, { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Eye, Heart, MessageSquare, Share } from "lucide-react";
import { TikTokVideo } from "./types";

interface ResultsTableProps {
  results: TikTokVideo[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  // Calculate totals for all metrics
  const totals = useMemo(() => {
    if (!results.length) return { views: 0, likes: 0, comments: 0, shares: 0 };
    
    return results.reduce((acc, video) => {
      return {
        views: acc.views + (video.playCount || 0),
        likes: acc.likes + (video.diggCount || 0),
        comments: acc.comments + (video.commentCount || 0),
        shares: acc.shares + (video.shareCount || 0)
      };
    }, { views: 0, likes: 0, comments: 0, shares: 0 });
  }, [results]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString();
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return "N/A";
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Eye size={16} />
                Views
              </div>
            </TableHead>
            <TableHead className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Heart size={16} />
                Likes
              </div>
            </TableHead>
            <TableHead className="text-right">
              <div className="flex items-center justify-end gap-1">
                <MessageSquare size={16} />
                Comments
              </div>
            </TableHead>
            <TableHead className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Share size={16} />
                Shares
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((video, index) => (
            <TableRow key={index}>
              <TableCell>{formatDate(video.createTimeISO)}</TableCell>
              <TableCell className="max-w-xs">
                <div className="truncate">{video.text || "No description"}</div>
              </TableCell>
              <TableCell className="text-right">{formatNumber(video.playCount)}</TableCell>
              <TableCell className="text-right">{formatNumber(video.diggCount)}</TableCell>
              <TableCell className="text-right">{formatNumber(video.commentCount)}</TableCell>
              <TableCell className="text-right">{formatNumber(video.shareCount)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="bg-gray-50 font-medium">
            <TableCell colSpan={2} className="text-right">Total</TableCell>
            <TableCell className="text-right">{formatNumber(totals.views)}</TableCell>
            <TableCell className="text-right">{formatNumber(totals.likes)}</TableCell>
            <TableCell className="text-right">{formatNumber(totals.comments)}</TableCell>
            <TableCell className="text-right">{formatNumber(totals.shares)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default ResultsTable;
