
import React from 'react';
import { Lesson, LessonType } from './types';

export const STAGE_WIDTH = 480;
export const STAGE_HEIGHT = 360;

export interface CostumeDef {
  id: string;
  emoji: string;
  price: number;
}

export const HEROES: CostumeDef[] = [
  { id: 'cat', emoji: '🐱', price: 0 },
  { id: 'dog', emoji: '🐶', price: 0 },
  { id: 'rocket', emoji: '🚀', price: 1 },
  { id: 'ghost', emoji: '👻', price: 1 },
  { id: 'dancer', emoji: '💃', price: 2 },
  { id: 'robot', emoji: '🤖', price: 2 },
  { id: 'alien', emoji: '👽', price: 3 },
  { id: 'dragon', emoji: '🐲', price: 5 },
];

export const COSTUMES = HEROES.reduce((acc, hero) => {
  acc[hero.id.toUpperCase()] = hero.emoji;
  return acc;
}, {} as Record<string, string>);

export const BADGES = {
  MOTION: { icon: '🏃‍♂️', name: 'Speed Runner', color: 'from-blue-400 to-blue-600' },
  COORDINATES: { icon: '📍', name: 'Map Master', color: 'from-red-400 to-red-600' },
  COSTUMES: { icon: '🎭', name: 'Style Star', color: 'from-purple-400 to-purple-600' },
  QUIZ: { icon: '🧠', name: 'Math Genius', color: 'from-yellow-400 to-yellow-600' },
  PROJECT: { icon: '🌟', name: 'Super Creator', color: 'from-green-400 to-green-600' },
  CHAMPION: { icon: '👑', name: 'Grand Champion', color: 'from-orange-400 to-yellow-500' },
};

export const BACKGROUNDS = [
  { name: 'Sunny Classroom', color: 'bg-classroom', grid: true },
  { name: 'Science Lab', color: 'bg-science-lab', grid: true },
  { name: 'School Playground', color: 'bg-playground', grid: false },
  { name: 'Quiet Library', color: 'bg-library', grid: false },
  { name: 'Sports Gym', color: 'bg-gym', grid: true },
];

export const LESSONS: Lesson[] = [
  {
    id: 'l1-coding',
    title: 'Mission: The First Step',
    type: LessonType.MOTION,
    description: 'Help the hero move!',
    targetPos: { x: 120, y: 0 },
    solutionBlocks: [{ type: 'move', value: 120 }],
    content: `MISSION 1: Welcome! Use the "Walk" block to move 120 steps to the right and reach the treasure!`,
  },
  {
    id: 'l2-math',
    title: 'Math Riddle: Apple Counting',
    type: LessonType.QUIZ,
    description: 'Simple addition for Grade 1!',
    content: `RIDDLE 1: If Sparky the Dog has 5 red apples and 3 green apples, how many apples does he have in total?`,
    quiz: {
      question: "5 apples + 3 apples = ?",
      options: ["7 apples", "8 apples", "9 apples", "10 apples"],
      correctIndex: 1
    }
  },
  {
    id: 'l3-coding',
    title: 'Mission: Space Jump',
    type: LessonType.COORDINATES,
    description: 'Teleport through space!',
    targetPos: { x: -100, y: 100 },
    solutionBlocks: [{ type: 'goto', x: -100, y: 100 }],
    content: `MISSION 2: The Moon Base is at X: -100 and Y: 100. Use the "Jump To" block to get there instantly!`,
  },
  {
    id: 'l4-math',
    title: 'Math Riddle: Shape Mystery',
    type: LessonType.QUIZ,
    description: 'Simple geometry for Grade 2!',
    content: `RIDDLE 2: Which of these shapes has exactly 3 sides and 3 corners?`,
    quiz: {
      question: "Which shape has 3 sides?",
      options: ["Square", "Circle", "Triangle", "Rectangle"],
      correctIndex: 2
    }
  },
  {
    id: 'l5-coding',
    title: 'Mission: Magic Costume',
    type: LessonType.COSTUMES,
    description: 'Change your persona!',
    targetPos: { x: 0, y: -80 },
    solutionBlocks: [
      { type: 'costume' },
      { type: 'goto', x: 0, y: -80 }
    ],
    content: `MISSION 3: Change your "Persona" to look like a hero, then jump to the treasure at (0, -80)!`,
  },
  {
    id: 'l6-math',
    title: 'Math Riddle: Toy Sharing',
    type: LessonType.QUIZ,
    description: 'Basic multiplication for Grade 3!',
    content: `RIDDLE 3: If 4 friends each have 5 stickers, how many stickers do they have altogether?`,
    quiz: {
      question: "4 groups of 5 stickers = ?",
      options: ["9 stickers", "15 stickers", "20 stickers", "25 stickers"],
      correctIndex: 2
    }
  },
  {
    id: 'l7-coding',
    title: 'Mission: Gliding Goal',
    type: LessonType.MOTION,
    description: 'Smooth movement!',
    targetPos: { x: 150, y: 50 },
    solutionBlocks: [{ type: 'glide', x: 150, y: 50 }],
    content: `MISSION 4: Use the "Glide To" block to slide smoothly to X: 150 and Y: 50. It's like skating!`,
  },
  {
    id: 'l8-math',
    title: 'Math Riddle: Fraction Pizza',
    type: LessonType.QUIZ,
    description: 'Intro to fractions for Grade 4!',
    content: `RIDDLE 4: If a pizza is cut into 4 equal slices and you eat 1 slice, what fraction of the pizza is left?`,
    quiz: {
      question: "You eat 1 out of 4 slices. How much is left?",
      options: ["1/4", "1/2", "3/4", "All of it"],
      correctIndex: 2
    }
  },
  {
    id: 'l9-coding',
    title: 'Mission: Spin & Slide',
    type: LessonType.PROJECT,
    description: 'Combine your skills!',
    targetPos: { x: -50, y: -150 },
    solutionBlocks: [
      { type: 'turn', value: 360 },
      { type: 'glide', x: -50, y: -150 }
    ],
    content: `MISSION 5: Do a happy spin (360 degrees) and then glide to the secret treasure at (-50, -150)!`,
  },
  {
    id: 'l10-math',
    title: 'Math Riddle: Time Traveler',
    type: LessonType.QUIZ,
    description: 'Telling time for Grade 5!',
    content: `RIDDLE 5: If a movie starts at 2:00 PM and lasts for 1 hour and 30 minutes, what time does it finish?`,
    quiz: {
      question: "2:00 PM + 1 hour 30 mins = ?",
      options: ["3:00 PM", "3:30 PM", "4:00 PM", "2:30 PM"],
      correctIndex: 1
    }
  },
  {
    id: 'l11-coding',
    title: 'Grand Final: Coding Boss',
    type: LessonType.PROJECT,
    description: 'The Ultimate Coding Challenge!',
    targetPos: { x: 200, y: 140 },
    solutionBlocks: [
      { type: 'background' },
      { type: 'costume' },
      { type: 'turn', value: 720 },
      { type: 'goto', x: 200, y: 140 }
    ],
    content: `GRAND MISSION: Change the world, pick a new persona, spin twice (720 deg), and reach the final treasure!`,
  },
  {
    id: 'l12-math',
    title: 'Grand Final: Math Master',
    type: LessonType.QUIZ,
    description: 'Area Master for Grade 6!',
    content: `GRAND RIDDLE: A rectangular swimming pool is 10 meters long and 4 meters wide. What is the area of the pool floor?`,
    quiz: {
      question: "Area = Length x Width. 10m x 4m = ?",
      options: ["14 sq meters", "40 sq meters", "28 sq meters", "20 sq meters"],
      correctIndex: 1
    }
  }
];
