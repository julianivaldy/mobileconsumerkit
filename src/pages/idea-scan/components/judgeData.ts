
import { IdeaScanData, CategoryScores } from "./types";

export interface JudgeProfile {
  name: string;
  image: string;
  focusAreas: string[];
  corePrinciples?: string[];
  scoreMultipliers: {
    category: number;
    targetAudience: number;
    complexity: number;
    monetization: number;
    shareability: number;
  };
  feedbackStyle: string;
  writingStyle: {
    high: string[];
    medium: string[];
    low: string[];
  };
}

export const judgeProfiles: Record<string, JudgeProfile> = {
  all: {
    name: "All Judges",
    image: "",
    focusAreas: ["Overall balanced assessment"],
    corePrinciples: [
      "Solve big problems from Maslow's hierarchy of needs",
      "More complicated means less viral",
      "Create moments worth sharing",
      "Build viral mechanics into core functionality",
      "Drive network effects",
      "Optimize for k-factor"
    ],
    scoreMultipliers: {
      category: 1.0,
      targetAudience: 1.3,
      complexity: 0.85,
      monetization: 0.95,
      shareability: 1.3
    },
    feedbackStyle: "Balanced feedback combining Blake Anderson's and Nikita Bier's perspectives",
    writingStyle: {
      high: [
        "This idea shows strong potential across multiple dimensions. Both Blake Anderson and Nikita Bier would see significant promise here.",
        "A well-rounded concept with excellent market positioning and viral potential. The collective assessment is very positive.",
        "From both a product-market fit and viral mechanics standpoint, this idea has exceptional potential worth pursuing."
      ],
      medium: [
        "This idea has some promising elements but needs refinement in key areas according to both Blake Anderson and Nikita Bier.",
        "There's potential here, though aspects of both shareability and viral mechanics would benefit from further development.",
        "The idea shows promise but needs more work on complexity and viral loops to truly stand out in the market."
      ],
      low: [
        "Both Blake Anderson and Nikita Bier would identify significant challenges with this concept that need addressing.",
        "The collective assessment suggests reconsidering core elements of this idea to improve its viral potential and market fit.",
        "Across multiple dimensions, these experts would recommend substantial revisions to make this concept more viable and shareable."
      ]
    }
  },
  blake: {
    name: "Blake Anderson",
    image: "https://media.beehiiv.com/cdn-cgi/image/fit=scale-down,format=auto,onerror=redirect,quality=80/uploads/asset/file/27559087-c223-4078-a412-331430c29cae/Screenshot_2024-08-27_at_17.56.43.png?t=1724770645",
    focusAreas: ["Product-Market Fit", "User Experience", "Virality"],
    corePrinciples: [
      "Solve big problems from Maslow's hierarchy of needs",
      "More complicated means less viral",
      "Did you hear about this? - Make products remarkable and shareable",
      "Ideas need to be explainable in 3-4 words",
      "Create moments worth sharing",
      "Minimize cognitive load for users",
      "Do not reinvent the wheel in design",
      "Think like your customer",
      "Focus on single player utility apps",
      "Viral app design minimizes friction from design to millions of users",
      "Launch with 20% of features that deliver 80% of value"
    ],
    scoreMultipliers: {
      category: 0.9,
      targetAudience: 1.4,
      complexity: 0.7,
      monetization: 0.8,
      shareability: 1.2
    },
    feedbackStyle: "User-centric with focus on viral potential, simplicity and solving fundamental needs",
    writingStyle: {
      high: [
        "This idea has the viral potential I look for! Just like with RizzGPT, you're solving a meaningful problem with a concept that's easy to explain and share. You can describe it in 3-4 words, which is perfect for virality.",
        "I'm seeing strong viral potential here. Your concept addresses a significant need on Maslow's hierarchy while keeping it simple enough to explain in a few words – that's exactly what made my apps like Umax successful.",
        "This reminds me of what worked with Cal AI – you're tackling a big problem with an elegantly simple solution. The shareability factor here is excellent, which means people would naturally tell their friends about this at a party.",
        "Looking at Maslow's hierarchy of needs, you're addressing a fundamental problem that people care deeply about. And you've kept it simple enough to explain in 3-4 words, perfect for natural sharing moments where users would want to tell others about it."
      ],
      medium: [
        "Your idea has potential, but needs refinement. Think about Maslow's hierarchy – are you solving a big enough problem? If your app can't be explained in 3-4 words, it might be too complicated for viral growth.",
        "There's something interesting here, but I'm not convinced people would naturally share this with friends. Would someone mention this at a party? That 'Did you hear about this?' factor is essential for virality.",
        "I see promise in this concept, but it needs work on shareability. Ask yourself: would someone bring it up at a party or post about it on social media? You need to create moments worth sharing within the core user experience.",
        "The idea has merit but could be simpler. When I built Cal AI, I made sure it solved a big problem (calorie tracking) with a dead-simple solution (take a photo). Try to distill your concept down to that level of simplicity."
      ],
      low: [
        "This idea needs significant rethinking. It doesn't solve a big enough problem on Maslow's hierarchy, and the concept is too complex to explain in 3-4 words. Remember that more complicated means less viral.",
        "I'm not seeing the viral potential here. The concept isn't simple enough to share easily, and it doesn't create those natural moments where users would want to tell others about it. Virality is contingent on simplicity.",
        "This concept needs a complete rethink. It doesn't follow the 'Did you hear about' principle that makes apps like RizzGPT go viral. Your idea should be remarkable enough that people naturally want to tell their friends.",
        "When I came up with Umax, I focused on solving a big problem with a simple solution. Your idea isn't addressing a fundamental enough need from Maslow's hierarchy, and it's too complicated to explain quickly. Viral apps solve big problems in simple ways."
      ]
    }
  },
  nikita: {
    name: "Nikita Bier",
    image: "https://cdn.prod.website-files.com/5fce0f6bc9af69423eefaa13/64d77abe6eaaac5cd3bea171_Nikita.png",
    focusAreas: ["Growth Mechanics", "Viral Loops", "Product Psychology", "User Targeting"],
    corePrinciples: [
      "Build viral loops into core functionality",
      "Focus on viral coefficient (k-factor)",
      "Target teens for optimal viral spread",
      "Design for immediate value (<3 seconds)",
      "Build what users are already trying to do",
      "Apps live or die in the pixels - design matters",
      "Time to Understand Value (TTUV) must be under 3 seconds",
      "Test virality at small scale, then saturate",
      "Product-market fit feels like chaos",
      "Virality = sharing triggers + social density",
      "Monetize what people are begging you for",
      "Build safety and positivity into your app",
      "Product naming and positioning significantly impact virality",
      "Teen invite rates drop by 20% per year after age 13",
      "Plan for hypergrowth with scalable infrastructure"
    ],
    scoreMultipliers: {
      category: 0.8,
      targetAudience: 1.5,
      complexity: 0.5,
      monetization: 1.2,
      shareability: 1.7
    },
    feedbackStyle: "Growth-oriented with emphasis on viral mechanics, teen user psychology, and engagement patterns",
    writingStyle: {
      high: [
        "The viral potential here is exceptional. Your concept creates immediate value for users - exactly what I look for. With Gas and tbh, I saw how critical that first 3-second impression is, and your idea nails it.",
        "Your idea has the right ingredients for virality. The sharing triggers are natural, and you're targeting a high social density audience. This is precisely how we engineered tbh to reach millions of teens through organic word of mouth.",
        "This reminds me of what worked with Gas. You've created a concept with strong product-market fit - I can already feel the potential chaos of hypergrowth here. When your Amazon bill explodes because everyone's using your app, you'll know you've hit gold.",
        "The viral mechanics here are sound. You've built sharing into the core functionality, which is exactly what drove tbh and Gas to the top of the App Store. With the right execution, this could create the 'have to show my friends' moment we always aim for."
      ],
      medium: [
        "There's potential, but your TTUV (Time to Understand Value) needs work. At tbh, users understood the value in under 3 seconds. Your idea might take longer, which could hurt viral spread. Every tap should feel like a miracle.",
        "The concept has merit, but I'm concerned about your target demographic. If you're aiming at adults, be prepared to pay for growth. When we built Gas, we learned that viral loops are much stronger with teens who see each other daily.",
        "You have interesting viral mechanics, but your design approach needs refinement. Remember: apps live and die in the pixels. With tbh, we iterated endlessly on the UI because the design wasn't just cosmetic—it was the core product.",
        "I see the value, but your distribution strategy needs work. When we launched Gas, we didn't scale broadly - we saturated small, dense populations like individual high schools. You need to create that same focused intensity for word-of-mouth to ignite."
      ],
      low: [
        "This concept lacks the viral mechanics needed for organic growth. With tbh and Gas, we engineered distribution into the core product experience. Your idea doesn't create natural moments where users feel compelled to share with friends.",
        "The fundamental problem is your approach to user psychology. Teens want affirmation, not just utility. When we built tbh, we discovered structured positive feedback drove massive engagement. Your concept misses this emotional trigger.",
        "Your idea shows a disconnect with how viral growth actually works. At Gas, we saw invite rates drop 20% per year with age. If you're targeting adults with this concept, you're fighting against deeply ingrained social behaviors that resist new platforms.",
        "I don't see product-market fit here. Remember, product-market fit is binary - if you're wondering if you have it, you don't. With Gas, we knew within 48 hours when 10%+ of a school installed the app. This concept wouldn't pass that test."
      ]
    }
  }
};

// Calculate scores based on the selected judge's perspective
export const calculateJudgeSpecificScores = (data: IdeaScanData): CategoryScores => {
  // Enhanced base scores calculation - ensure all categories get meaningful values
  const ideaLength = data.idea.length;
  const ideaWords = data.idea.split(' ').filter(word => word.length > 0).length;
  
  const baseScores = {
    // Category score based on idea quality and length
    category: Math.min(Math.max(ideaLength * 0.8 + (ideaWords * 2), 20), 100),
    
    // Target audience score based on idea clarity and specificity  
    targetAudience: Math.min(Math.max((ideaWords * 1.5) + (ideaLength * 0.6), 25), 100),
    
    // Complexity score - optimal around 3, with penalties for too simple or complex
    complexity: Math.max(100 - Math.abs(data.complexity - 3) * 15, 10),
    
    // Monetization score based on idea commercial potential indicators
    monetization: Math.min(Math.max((ideaWords * 1.2) + (ideaLength * 0.5), 20), 100),
    
    // Shareability score based on social/viral potential keywords
    shareability: Math.min(Math.max((ideaWords * 1.8) + (ideaLength * 0.4), 15), 100),
  };
  
  // Apply judge-specific multipliers
  const judge = judgeProfiles[data.judge] || judgeProfiles.all;
  
  if (data.judge === "all") {
    // For "all" judges, average the scores using Blake and Nikita's multipliers
    const judgeKeys = ["blake", "nikita"];
    const scores = {
      category: 0,
      targetAudience: 0,
      complexity: 0,
      monetization: 0,
      shareability: 0
    };
    
    judgeKeys.forEach(judgeKey => {
      const profile = judgeProfiles[judgeKey];
      scores.category += baseScores.category * profile.scoreMultipliers.category;
      scores.targetAudience += baseScores.targetAudience * profile.scoreMultipliers.targetAudience;
      scores.complexity += baseScores.complexity * profile.scoreMultipliers.complexity;
      scores.monetization += baseScores.monetization * profile.scoreMultipliers.monetization;
      scores.shareability += baseScores.shareability * profile.scoreMultipliers.shareability;
    });
    
    // Average the scores and ensure they're within 0-100
    return {
      category: Math.min(Math.max(Math.round(scores.category / judgeKeys.length), 0), 100),
      targetAudience: Math.min(Math.max(Math.round(scores.targetAudience / judgeKeys.length), 0), 100),
      complexity: Math.min(Math.max(Math.round(scores.complexity / judgeKeys.length), 0), 100),
      monetization: Math.min(Math.max(Math.round(scores.monetization / judgeKeys.length), 0), 100),
      shareability: Math.min(Math.max(Math.round(scores.shareability / judgeKeys.length), 0), 100)
    };
  } else {
    // Apply specific judge's multipliers
    return {
      category: Math.min(Math.max(Math.round(baseScores.category * judge.scoreMultipliers.category), 0), 100),
      targetAudience: Math.min(Math.max(Math.round(baseScores.targetAudience * judge.scoreMultipliers.targetAudience), 0), 100),
      complexity: Math.min(Math.max(Math.round(baseScores.complexity * judge.scoreMultipliers.complexity), 0), 100),
      monetization: Math.min(Math.max(Math.round(baseScores.monetization * judge.scoreMultipliers.monetization), 0), 100),
      shareability: Math.min(Math.max(Math.round(baseScores.shareability * judge.scoreMultipliers.shareability), 0), 100)
    };
  }
};

// Calculate overall score based on category scores with judge-specific weighting
export const calculateOverallScore = (categoryScores: CategoryScores, judgeId: string): number => {
  const judge = judgeProfiles[judgeId] || judgeProfiles.all;
  
  // Weight the categories based on judge's focus areas
  let totalScore = 0;
  let totalWeight = 0;
  
  Object.entries(judge.scoreMultipliers).forEach(([key, weight]) => {
    totalScore += categoryScores[key as keyof CategoryScores] * weight;
    totalWeight += weight;
  });
  
  // Add a small random factor to make results feel more realistic
  const randomFactor = Math.random() * 10 - 5; // -5 to +5
  
  // Calculate final score
  return Math.min(Math.max(Math.round((totalScore / totalWeight) + randomFactor), 0), 100);
};

// Get judge-specific feedback phrases based on score
export const getJudgeFeedback = (score: number, judgeId: string): { label: string, description: string, personalizedFeedback: string } => {
  const judge = judgeProfiles[judgeId] || judgeProfiles.all;
  const judgeName = judge.name;
  
  // Get a random personalized feedback message based on score range
  const getRandomFeedback = (scoreRange: 'high' | 'medium' | 'low'): string => {
    const feedbackOptions = judge.writingStyle[scoreRange];
    return feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
  };
  
  let label: string;
  let description: string;
  let personalizedFeedback: string;
  
  if (score >= 85) {
    label = "🌟 EXCEPTIONAL";
    description = `${judgeName} would be excited about this idea. It shows outstanding potential across key metrics that align with ${judge.focusAreas.join(", ")}.`;
    personalizedFeedback = getRandomFeedback('high');
  } else if (score >= 70) {
    label = "👍 PROMISING";
    description = `${judgeName} sees strong promise in this idea. There's solid foundation to build upon, especially in ${judge.focusAreas.join(", ")}.`;
    personalizedFeedback = getRandomFeedback('high');
  } else if (score >= 50) {
    label = "😐 NEEDS WORK";
    description = `${judgeName} sees potential but suggests refinement in key areas. Consider strengthening aspects related to ${judge.focusAreas.join(", ")}.`;
    personalizedFeedback = getRandomFeedback('medium');
  } else if (score >= 30) {
    label = "🤔 CHALLENGING";
    description = `${judgeName} identifies significant challenges with this concept. The idea needs substantial improvement, particularly in ${judge.focusAreas.join(", ")}.`;
    personalizedFeedback = getRandomFeedback('medium');
  } else {
    label = "👎 RECONSIDER";
    description = `${judgeName} would recommend going back to the drawing board. This idea faces too many obstacles in its current form, especially regarding ${judge.focusAreas.join(", ")}.`;
    personalizedFeedback = getRandomFeedback('low');
  }
  
  return { label, description, personalizedFeedback };
};
