// Level color scheme: 1=light yellow to 5=intensive green
export const LEVEL_COLORS: Record<number, string> = {
  1: '#FEF9C3', // Pale Yellow-Green (Sprout)
  2: '#D9F99D', // Light Lime (Seedling)
  3: '#4ADE80', // Vivid Green (Growth)
  4: '#16A34A', // Mature Green (Tree)
  5: '#14532D', // Dark Forest (Old Growth)
};

export const LEVEL_TEXT_COLORS: Record<number, string> = {
  1: '#854D0E', // Earthy Brown (Roots)
  2: '#3F6212', // Dark Lime
  3: '#064E3B', // Deep Green
  4: '#FFFFFF', // White (Switches for contrast)
  5: '#FFFFFF', // White
};

export const getLevelColor = (level: number): string => {
  return LEVEL_COLORS[level] || LEVEL_COLORS[1];
};

export const getLevelTextColor = (level: number): string => {
  return LEVEL_TEXT_COLORS[level] || LEVEL_TEXT_COLORS[1];
};

export const LEVEL_LABELS: Record<number, string> = {
  1: 'Beginner',
  2: 'Basic',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
};

export const getLevelLabel = (level: number): string => {
  return LEVEL_LABELS[level] || 'Unknown';
};
