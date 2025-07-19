import { Word, FlashCard } from "../types";

export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export const calculateProgress = (correct: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
};

export const getDifficultyColor = (difficulty: 1 | 2 | 3 | 4 | 5): string => {
  const colors = {
    1: "#22c55e", // green
    2: "#84cc16", // lime
    3: "#f59e0b", // amber
    4: "#f97316", // orange
    5: "#ef4444", // red
  };
  return colors[difficulty];
};

export const getDifficultyText = (difficulty: 1 | 2 | 3 | 4 | 5): string => {
  const texts = {
    1: "Very Easy",
    2: "Easy",
    3: "Medium",
    4: "Hard",
    5: "Very Hard",
  };
  return texts[difficulty];
};


export const createFlashCardFromWord = (word: Word): FlashCard => {
  return {
    id: generateId(),
    wordId: word.id,
    front: word.text,
    back: word.definition || word.translation || "No definition available",
    difficulty: word.difficulty,
    nextReview: new Date().toISOString(),
    interval: 1,
    easeFactor: 2.5,
    reviewCount: 0,
  };
};

export const calculateNextReview = (
  flashCard: FlashCard,
  quality: 0 | 1 | 2 | 3 | 4 | 5,
): { nextReview: string; interval: number; easeFactor: number } => {
  // Spaced repetition algorithm (simplified SM-2)
  let { interval, easeFactor } = flashCard;

  if (quality < 3) {
    // If quality is poor, reset interval
    interval = 1;
  } else {
    if (flashCard.reviewCount === 0) {
      interval = 1;
    } else if (flashCard.reviewCount === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  // Update ease factor (helpful for adjusting difficulty)
  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    nextReview: nextReviewDate.toISOString(),
    interval,
    easeFactor,
  };
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getRandomItems = <T>(array: T[], count: number): T[] => {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, count);
};

export const calculateStreak = (
  dailyStats: { date: string; wordsLearned: number }[],
): number => {
  if (dailyStats.length === 0) return 0;

  const sortedStats = dailyStats
    .filter((stat) => stat.wordsLearned > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedStats.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const stat of sortedStats) {
    const statDate = new Date(stat.date);
    statDate.setHours(0, 0, 0, 0);

    if (statDate.getTime() === currentDate.getTime()) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (
      statDate.getTime() ===
      currentDate.getTime() + 24 * 60 * 60 * 1000
    ) {
      // Allow for yesterday if no activity today
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

// debounce function to limit how often a function can be called
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// truncate text to a maximum length and add ellipsis if needed
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

export const capitalizeFirst = (text: string): string => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const getColorForProgress = (progress: number): string => {
  if (progress < 25) return "#ef4444"; // red
  if (progress < 50) return "#f59e0b"; // amber
  if (progress < 75) return "#84cc16"; // lime
  return "#22c55e"; // green
};

export const generatePracticeWords = (
  words: Word[],
  count: number,
  difficulty?: 1 | 2 | 3 | 4 | 5,
): Word[] => {
  let filteredWords = words.filter(
    (word) => word.definition.trim() !== "" || word.translation.trim() !== "",
  );

  if (difficulty) {
    filteredWords = filteredWords.filter(
      (word) => word.difficulty === difficulty,
    );
  }

  // Prioritize words that haven't been reviewed recently or have low progress
  const weightedWords = filteredWords.map((word) => ({
    ...word,
    weight: calculateWordWeight(word),
  }));

  // Sort by weight (higher weight = more likely to be selected)
  weightedWords.sort((a, b) => b.weight - a.weight);

  return weightedWords.slice(0, count);
};

const calculateWordWeight = (word: Word): number => {
  let weight = 100; // Base weight

  // Lower progress = higher weight
  weight += (100 - word.progress) * 0.5;

  // Less reviewed = higher weight
  weight += Math.max(0, 20 - word.reviewCount) * 2; //20 is the max review count

  // More difficult = slightly higher weight
  weight += word.difficulty * 5;

  // Recently added = higher weight
  const daysSinceAdded =
    (Date.now() - new Date(word.dateAdded).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceAdded < 7) {
    weight += (7 - daysSinceAdded) * 10;
  }

  // Marked as difficult = higher weight
  if (word.isMarkedDifficult) {
    weight += 30;
  }

  return weight;
};


