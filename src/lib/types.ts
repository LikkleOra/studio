import type { SmartMovieBlendingOutput } from '@/ai/flows/smart-movie-blending';
import type { GroupTasteFusionOutput } from '@/ai/flows/group-taste-fusion';

export type MovieRecommendation = SmartMovieBlendingOutput[0];
export type GroupMovieRecommendation = GroupTasteFusionOutput[0];

export type IndividualMovieState = {
  movies?: MovieRecommendation[];
  error?: string;
};

export type GroupMovieState = {
  movies?: GroupMovieRecommendation[];
  error?: string;
};

export type Participant = {
  id: string;
  mood: string;
  genres: string[];
  vibe: string;
};

export type Movie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
};
