
export interface IdeaScanData {
  idea: string;
  category: string;
  targetAudience: string;
  complexity: number;
  monetization: string;
  shareability: string;
  judge: string;
}

export interface CategoryScores {
  category: number;
  targetAudience: number;
  complexity: number;
  monetization: number;
  shareability: number;
}

export interface IdeaScanResult {
  score: number;
  label: string;
  description: string;
  personalizedFeedback: string;
  categories: CategoryScores;
  rawData: IdeaScanData;
}
