
import { FormValues } from "./SearchForm";
import { TikTokVideo } from "./types";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

export async function fetchTikTokData(data: FormValues): Promise<TikTokVideo[]> {
  const apiToken = localStorage.getItem("apify_api_token");
  if (!apiToken) {
    throw new Error("API token not found");
  }
  
  // Prepare the API input based on form data
  let input: any = {
    profiles: data.usernames,
    excludePinnedPosts: true,
    resultsPerPage: 1000,
    shouldDownloadVideos: false,
    shouldDownloadCovers: false,
    shouldDownloadSubtitles: false,
    shouldDownloadSlideshowImages: false,
    shouldDownloadAvatars: false,
    shouldDownloadMusicCovers: false,
    proxyCountryCode: "None"
  };

  // Add date parameters based on tracking mode
  if (data.trackingMode === "relative" && data.customDays) {
    input.oldestPostDateUnified = `${data.customDays} days`;
  } else if (data.trackingMode === "absolute" && data.startDate && data.endDate) {
    input.oldestPostDateUnified = format(data.startDate, "yyyy-MM-dd");
    input.newestPostDate = format(data.endDate, "yyyy-MM-dd");
  }

  // First, start the run
  const runResponse = await fetch(`https://api.apify.com/v2/acts/GdWCkxBtKWOsKjdch/runs?token=${apiToken}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!runResponse.ok) {
    throw new Error(`Failed to start run: ${runResponse.status}`);
  }

  const runData = await runResponse.json();
  const runId = runData.data.id;

  // Poll for completion
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes with 5 second intervals
  
  while (attempts < maxAttempts) {
    
    // Wait 5 seconds between checks
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check run status
    const statusResponse = await fetch(`https://api.apify.com/v2/acts/GdWCkxBtKWOsKjdch/runs/${runId}?token=${apiToken}`);
    
    if (!statusResponse.ok) {
      throw new Error(`Failed to check run status: ${statusResponse.status}`);
    }

    const statusData = await statusResponse.json();

    if (statusData.data.status === 'SUCCEEDED') {
      // Get the dataset items
      const datasetResponse = await fetch(`https://api.apify.com/v2/datasets/${statusData.data.defaultDatasetId}/items?token=${apiToken}`);
      
      if (!datasetResponse.ok) {
        throw new Error(`Failed to fetch dataset: ${datasetResponse.status}`);
      }

      const responseData = await datasetResponse.json();
      
      if (responseData && Array.isArray(responseData) && responseData.length > 0) {
        return responseData;
      }
      
      return [];
    } else if (statusData.data.status === 'FAILED') {
      throw new Error(`Run failed: ${statusData.data.statusMessage || 'Unknown error'}`);
    } else if (statusData.data.status === 'ABORTED') {
      throw new Error('Run was aborted');
    }
    
    attempts++;
  }

  throw new Error('Request timed out after 5 minutes. The API is taking longer than expected to process your request.');
}
