'use server';

import { smartMovieBlending, SmartMovieBlendingInput } from '@/ai/flows/smart-movie-blending';
import { groupTasteFusion, GroupTasteFusionInput } from '@/ai/flows/group-taste-fusion';
import { getMediaDetails, getWatchProviderLinks } from '@/lib/tmdb';
import { z } from 'zod';
import type { IndividualMovieState, GroupMovieState, MovieInfo } from './types';
import { placeholderImages } from './placeholder-images';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig() || {};

const individualSchema = z.object({
  mood: z.string().min(1, 'Mood is required.'),
  mediaType: z.enum(['movie', 'tv', 'any']),
  vibe: z.string().optional(),
  genres: z.string().optional(),
});

function checkApiKeys() {
  const geminiApiKey = serverRuntimeConfig?.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  const tmdbApiKey = serverRuntimeConfig?.TMDB_API_KEY || process.env.TMDB_API_KEY;

  if (!geminiApiKey) {
    return 'The GEMINI_API_KEY is not configured. Please add it to your environment variables. If you have already added it, you may need to redeploy your application.';
  }
  if (!tmdbApiKey) {
    return 'The TMDB_API_KEY is not configured. Please add it to your environment variables. If you have already added it, you may need to redeploy your application.';
  }
  return null;
}

export async function findIndividualMovies(
  prevState: IndividualMovieState,
  formData: FormData
): Promise<IndividualMovieState> {
  const apiKeyError = checkApiKeys();
  if (apiKeyError) {
    return { error: apiKeyError };
  }

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
  const genreList = genres ? genres.split(',').filter(g => g) : [];

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
  } catch (error: any) {
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
  const apiKeyError = checkApiKeys();
  if (apiKeyError) {
    return { error: apiKeyError };
  }

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

  } catch (error: any) {
    console.error(error);
    return {
      error: 'An AI error occurred or participant data was malformed. Please try again.',
    };
  }
}

const detailsSchema = z.object({
    mediaId: z.coerce.number(),
    mediaType: z.enum(['movie', 'tv']),
});

export async function getMovieDetails(mediaId: number, mediaType: 'movie' | 'tv'): Promise<MovieInfo | { error: string }> {
    const apiKeyError = checkApiKeys();
    if (apiKeyError) {
        return { error: apiKeyError };
    }

    const validated = detailsSchema.safeParse({ mediaId, mediaType });
    if (!validated.success) {
        return { error: 'Invalid media ID or type.' };
    }
    
    try {
        const details = await getMediaDetails(mediaId, mediaType);
        const mediaTitle = details.title || details.name;

        if (!mediaTitle) {
            return { error: 'Failed to find a title for the selected media.' };
        }

        const providers = await getWatchProviderLinks(mediaId, mediaType, mediaTitle);

        const trailer = details.videos?.results?.find(
            (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        );

        return {
            ...details,
            trailerKey: trailer?.key,
            watchProviders: providers,
        };
    } catch (error: any) {
        console.error('Error getting movie details:', error);
        return { error: 'Failed to fetch movie details.' };
    }
}
