'use server';

import { smartMovieBlending, SmartMovieBlendingInput } from '@/ai/flows/smart-movie-blending';
import { groupTasteFusion, GroupTasteFusionInput } from '@/ai/flows/group-taste-fusion';
import { z } from 'zod';
import type { IndividualMovieState, GroupMovieState } from './types';
import { placeholderImages } from './placeholder-images';

const individualSchema = z.object({
  mood: z.string().min(1, 'Mood is required.'),
  mediaType: z.enum(['movie', 'tv', 'any']),
  vibe: z.string().optional(),
  genres: z.string().optional(),
});

export async function findIndividualMovies(
  prevState: IndividualMovieState,
  formData: FormData
): Promise<IndividualMovieState> {
  const validatedFields = individualSchema.safeParse({
    mood: formData.get('mood'),
    mediaType: formData.get('mediaType'),
    vibe: formData.get('vibe'),
    genres: formData.get('genres'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Invalid input. Please check your selections.',
    };
  }

  const { mood, mediaType, vibe, genres } = validatedFields.data;
  const genreList = genres ? genres.split(',') : [];

  const aiInput: SmartMovieBlendingInput = {
    mood,
    mediaType,
    vibe: vibe || 'any',
    genres: genreList,
  };

  try {
    const movies = await smartMovieBlending(aiInput);
    if (!movies || movies.length === 0) {
      return {
        error: "We couldn't find any movies or shows for that vibe. Try being a bit more general.",
      };
    }
    const moviesWithPlaceholders = movies.map((movie, index) => ({
      ...movie,
      posterUrl: movie.posterUrl || placeholderImages[index % placeholderImages.length].imageUrl,
    }));
    return { movies: moviesWithPlaceholders };
  } catch (error) {
    console.error(error);
    return {
      error: 'An AI error occurred. Please try again later.',
    };
  }
}

const groupSchema = z.object({
  participants: z.string().min(1, 'At least one participant is required.'),
});

export async function findGroupMovies(
  prevState: GroupMovieState,
  formData: FormData
): Promise<GroupMovieState> {
  const validatedFields = groupSchema.safeParse({
    participants: formData.get('participants'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Invalid participant data.',
    };
  }

  try {
    const participants = JSON.parse(validatedFields.data.participants);
    
    if (!Array.isArray(participants) || participants.length === 0) {
      return { error: 'No participants provided.' };
    }
    
    const aiInput: GroupTasteFusionInput = {
      participants: participants.map((p) => ({
        mood: p.mood || 'any',
        genres: p.genres || [],
        vibe: p.vibe || '',
      })),
    };

    const movies = await groupTasteFusion(aiInput);
    
    if (!movies || movies.length === 0) {
      return {
        error: "We couldn't find a good match for your group. Try adjusting your preferences.",
      };
    }
    
    return { movies };

  } catch (error) {
    console.error(error);
    return {
      error: 'An AI error occurred or participant data was malformed. Please try again.',
    };
  }
}
