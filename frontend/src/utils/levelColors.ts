// Level color scheme: 1=light yellow to 5=intensive green
export const LEVEL_COLORS: Record<number, string> = {
  1: '#fef9c3', // light yellow
  2: '#fde047', // yellow
  3: '#bef264', // light green
  4: '#4ade80', // green
  5: '#16a34a', // intensive green
};

export const LEVEL_TEXT_COLORS: Record<number, string> = {
  1: '#713f12', // dark text for light background
  2: '#713f12', // dark text for light background
  3: '#166534', // dark green text
  4: '#166534', // dark green text
  5: '#ffffff', // white text for dark background
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
