
import React, { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader, User, Users, Heart, MessageCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as z from "zod";

const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreatorData {
  uniqueId: string;
  nickname: string;
  signature: string;
  followerCount: number;
  followingCount: number;
  heartCount: number;
  videoCount: number;
  avatarThumb: string;
  verified: boolean;
}

const CreatorAnalysisForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [creatorData, setCreatorData] = useState<CreatorData | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    }
  });

  const extractUsernameFromUrl = (input: string): string => {
    const trimmed = input.trim();
    const tiktokUrlPattern = /^https?:\/\/(?:www\.)?tiktok\.com\/@([^\/?\s]+)/i;
    const match = trimmed.match(tiktokUrlPattern);
    
    if (match && match[1]) {
      return match[1];
    }
    
    return trimmed.replace('@', '');
  };

  const onSubmit = async (data: FormValues) => {
    const apiToken = localStorage.getItem("apify_api_token");
    if (!apiToken) {
      toast({
        title: "API Token Required",
        description: "Please add your Apify API token in the settings page.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setCreatorData(null);
    
    try {
      const username = extractUsernameFromUrl(data.username);
      
      const input = {
        profiles: [username],
        excludePinnedPosts: true,
        resultsPerPage: 1,
        shouldDownloadVideos: false,
        shouldDownloadCovers: false,
        shouldDownloadSubtitles: false,
        shouldDownloadSlideshowImages: false,
        shouldDownloadAvatars: false,
        shouldDownloadMusicCovers: false,
        proxyCountryCode: "None"
      };

      const response = await fetch(`https://api.apify.com/v2/acts/GdWCkxBtKWOsKjdch/run-sync-get-dataset-items?token=${apiToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const responseData = await response.json();
      
      if (responseData && Array.isArray(responseData) && responseData.length > 0) {
        // The authorMeta is directly in the first item of the response
        const firstItem = responseData[0];
        const authorMeta = firstItem.authorMeta || firstItem;
        
        if (authorMeta) {
          setCreatorData({
            uniqueId: authorMeta.uniqueId || authorMeta.id || username,
            nickname: authorMeta.name || authorMeta.nickname || authorMeta.displayName || username,
            signature: authorMeta.signature || authorMeta.bio || "No bio available",
            followerCount: parseInt(authorMeta.followerCount) || parseInt(authorMeta.fans) || 0,
            followingCount: parseInt(authorMeta.followingCount) || parseInt(authorMeta.following) || 0,
            heartCount: parseInt(authorMeta.heartCount) || parseInt(authorMeta.heart) || parseInt(authorMeta.likes) || 0,
            videoCount: parseInt(authorMeta.videoCount) || parseInt(authorMeta.video) || 0,
            avatarThumb: authorMeta.avatarThumb || authorMeta.avatar || "",
            verified: authorMeta.verified || false,
          });
          
          toast({
            title: "Success!",
            description: `Found creator data for @${username}`,
          });
        } else {
          throw new Error("No creator data found in response");
        }
      } else {
        throw new Error("No data returned from API");
      }
    } catch (error) {
      console.error("Error fetching creator data:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch creator data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>TikTok Creator Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TikTok Username or URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter username (e.g., @username) or TikTok profile URL" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Creator...
                  </>
                ) : "Analyze Creator"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {creatorData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {creatorData.avatarThumb && (
                <img 
                  src={creatorData.avatarThumb} 
                  alt={creatorData.nickname}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span>{creatorData.nickname}</span>
                  {creatorData.verified && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">@{creatorData.uniqueId}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Bio</h4>
              <p className="text-muted-foreground">{creatorData.signature}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <div className="font-semibold">{formatNumber(creatorData.followerCount)}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <User className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <div className="font-semibold">{formatNumber(creatorData.followingCount)}</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Heart className="h-6 w-6 mx-auto mb-2 text-red-500" />
                <div className="font-semibold">{formatNumber(creatorData.heartCount)}</div>
                <div className="text-sm text-muted-foreground">Likes</div>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <MessageCircle className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <div className="font-semibold">{formatNumber(creatorData.videoCount)}</div>
                <div className="text-sm text-muted-foreground">Videos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CreatorAnalysisForm;
