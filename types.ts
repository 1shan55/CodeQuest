
export enum LessonType {
  MOTION = 'motion',
  COSTUMES = 'costumes',
  COORDINATES = 'coordinates',
  PROJECT = 'project',
  QUIZ = 'quiz'
}

export interface SpriteState {
  x: number;
  y: number;
  rotation: number;
  costume: string;
  visible: boolean;
}

export interface Block {
  id: string;
  type: 'move' | 'turn' | 'goto' | 'glide' | 'costume' | 'background' | 'changex' | 'changey';
  value?: number | string;
  x?: number;
  y?: number;
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  description: string;
  content: string;
  videoUrl?: string;
  targetPos?: { x: number; y: number };
  solutionBlocks?: Omit<Block, 'id'>[];
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
  };
}
