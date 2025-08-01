import { Word } from "../types";

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



export const generatePracticeWords = (
  words: Word[],
  count: number,
): Word[] => {
  let filteredWords = words.filter(
    (word) => word.definition.trim() !== "" || word.translation.trim() !== "",
  );

  // Prioritize words that haven't been reviewed recently
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

  // Less reviewed = higher weight
  weight += Math.max(0, 20 - word.reviewCount) * 2; //20 is the max review count

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


