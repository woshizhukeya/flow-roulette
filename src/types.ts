export type Weight = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  name: string;
  weight: Weight;
}

export interface Group {
  id: string;
  name: string;
  tasks: Task[];
}

export const WEIGHT_VALUES: Record<Weight, number> = {
  low: 1,
  medium: 3,
  high: 5,
};
