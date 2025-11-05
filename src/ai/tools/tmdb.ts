'use server';
/**
 * @fileoverview This file contains Genkit tools for interacting with The Movie Database (TMDB) API.
 * It exports tools for searching movies/shows and getting recommendations.
 *
 * - searchContentTool - A tool to search for movies and TV shows on TMDB.
 * - getRecommendationsTool - A tool to get movie or TV show recommendations from TMDB.
 */

import { ai } from '@/ai/genkit';
import { searchContent, getRecommendations, getWatchProviders } from '@/lib/tmdb';
import type { TmdbMovie, TmdbTvShow } from '@/lib/types';
import { z } from 'zod';

function transformMedia(media: (TmdbMovie | TmdbTvShow)[] ) {
  return media.map((item) => {
    const isMovie = item.media_type === 'movie' || 'title' in item;
    return {
      id: item.id,
      title: isMovie ? (item as TmdbMovie).title : (item as TmdbTvShow).name,
      overview: item.overview,
      posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
      releaseDate: isMovie ? (item as TmdbMovie).release_date : (item as TmdbTvShow).first_air_date,
      rating: item.vote_average,
      mediaType: item.media_type,
    };
  });
}

export const searchContentTool = ai.defineTool(
  {
    name: 'searchContent',
    description: 'Search for movies or TV shows on TMDB. Use this to find content based on a query, genres, or keywords. This is the primary tool to find content.',
    inputSchema: z.object({
      query: z.string().optional().describe('The query to search for. Can be a title, a person, a company, a keyword, etc.'),
      genres: z.array(z.string()).optional().describe("A list of genres to filter by. The names of the genres should be used, e.g. 'Action', 'Comedy'"),
      mediaType: z.enum(['movie', 'tv', 'any']).default('any').describe("The type of media to search for. Can be 'movie', 'tv', or 'any'. Defaults to 'any'."),
    }),
    outputSchema: z.array(z.object({
      id: z.number(),
      title: z.string(),
      overview: z.string(),
      posterUrl: z.string().nullable(),
      releaseDate: z.string(),
      rating: z.number(),
      mediaType: z.string(),
    })),
  },
  async ({ query, genres, mediaType }) => {
    // Validate that either query or genres are provided.
    if ((!query || query.trim() === '') && (!genres || genres.length === 0)) {
        console.error('searchContentTool Error: A query or at least one genre must be provided.');
        // Return an empty array to the flow to indicate no results.
        return [];
    }
    
    console.log(`Searching content with input: ${JSON.stringify({ query, genres, mediaType })}`);
    try {
      const content = await searchContent(query, genres, mediaType);
      if (!content || content.length === 0) {
        console.log('searchContentTool: No results found from TMDB.');
        return [];
      }
      return transformMedia(content);
    } catch (error) {
      console.error('Error in searchContentTool:', error);
      // Return an empty array to the flow in case of an error. The AI can then handle it gracefully.
      return [];
    }
  }
);

export const getRecommendationsTool = ai.defineTool(
  {
    name: 'getRecommendations',
    description: 'Get recommendations based on a movie or TV show ID. Use this to find content similar to a given item.',
    inputSchema: z.object({
      mediaId: z.number().describe('The ID of the movie or TV show to get recommendations for.'),
      mediaType: z.enum(['movie', 'tv']).describe("The type of media: 'movie' or 'tv'."),
    }),
    outputSchema: z.array(z.object({
      id: z.number(),
      title: z.string(),
      overview: z.string(),
      posterUrl: z.string().nullable(),
      releaseDate: z.string(),
      rating: z.number(),
      mediaType: z.string(),
    })),
  },
  async ({ mediaId, mediaType }) => {
    console.log(`Getting recommendations for ${mediaType} ID: ${mediaId}`);
    try {
      const content = await getRecommendations(mediaId, mediaType);
      return transformMedia(content);
    } catch (error) {
      console.error('Error fetching recommendations from TMDB:', error);
      return [];
    }
  }
);

export const getWatchProvidersTool = ai.defineTool(
    {
        name: 'getWatchProviders',
        description: 'Get a list of streaming providers for a movie or TV show in the US region.',
        inputSchema: z.object({
            mediaId: z.number().describe('The ID of the movie or TV show.'),
            mediaType: z.enum(['movie', 'tv']).describe("The type of media: 'movie' or 'tv'."),
        }),
        outputSchema: z.array(z.string()).describe('A list of streaming provider names.'),
    },
    async ({ mediaId, mediaType }) => {
        try {
            return await getWatchProviders(mediaId, mediaType);
        } catch (error) {
            console.error(`Error fetching watch providers for ${mediaType} ID ${mediaId}:`, error);
            return [];
        }
    }
);
