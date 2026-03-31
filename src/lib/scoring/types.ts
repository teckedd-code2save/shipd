export interface PlatformRecommendation {
  platform: string;
  score: number;
  confidence: number;
  verdict: "perfect" | "good" | "viable" | "weak" | "poor";
  reasons: string[];
}

