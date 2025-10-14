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

interface TmdbMedia {
  id: number;
  overview: string;
  poster_path: string | null;
  vote_average: number;
  genre_ids?: number[];
  media_type: 'movie' | 'tv';
}

export interface TmdbMovie extends TmdbMedia {
  title: string;
  release_date: string;
  media_type: 'movie';
}

export interface TmdbTvShow extends TmdbMedia {
  name: string;
  first_air_date: string;
  media_type: 'tv';
}

export type Provider = {
    name: string;
    logoUrl: string;
    link: string;
};

export interface MovieInfo {
    id: number;
    title?: string;
    name?: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    release_date?: string;
    first_air_date?: string;
    genres: { id: number; name: string }[];
    videos?: {
        results: {
            key: string;
            site: string;
            type: string;
        }[];
    };
    trailerKey?: string;
    watchProviders?: Provider[];
}
