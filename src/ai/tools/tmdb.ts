'use server';
/**
 * @fileoverview This file contains Genkit tools for interacting with The Movie Database (TMDB) API.
 * It exports tools for searching movies and getting movie recommendations.
 *
 * - searchMoviesTool - A tool to search for movies on TMDB.
 * - getRecommendationsTool - A tool to get movie recommendations from TMDB.
 */

import { ai } from '@/ai/genkit';
import { searchMovies, getRecommendations } from '@/lib/tmdb';
import { z } from 'zod';

export const searchMoviesTool = ai.defineTool(
  {
    name: 'searchMovies',
    description: 'Search for movies on TMDB. Use this to find movies based on a query, genres, or keywords. This is the primary tool to find movies.',
    inputSchema: z.object({
      query: z.string().optional().describe('The query to search for. Can be a movie title, a person, a company, a keyword, etc.'),
      genres: z.array(z.string()).optional().describe("A list of genres to filter by. The names of the genres should be used, e.g. 'Action', 'Comedy'"),
    }),
    outputSchema: z.array(z.object({
      id: z.number(),
      title: z.string(),
      overview: z.string(),
      posterUrl: z.string().nullable(),
      releaseDate: z.string(),
      rating: z.number(),
    })),
  },
  async (input) => {
    console.log(`Searching movies with input: ${JSON.stringify(input)}`);
    const movies = await searchMovies(input.query, input.genres);
    return movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      releaseDate: movie.release_date,
      rating: movie.vote_average,
    }));
  }
);

export const getRecommendationsTool = ai.defineTool(
  {
    name: 'getRecommendations',
    description: 'Get movie recommendations based on a movie ID. Use this to find movies similar to a given movie.',
    inputSchema: z.object({
      movieId: z.number().describe('The ID of the movie to get recommendations for.'),
    }),
    outputSchema: z.array(z.object({
      id: z.number(),
      title: z.string(),
      overview: z.string(),
      posterUrl: z.string().nullable(),
      releaseDate: z.string(),
      rating: z.number(),
    })),
  },
  async (input) => {
    console.log(`Getting recommendations for movie ID: ${input.movieId}`);
    const movies = await getRecommendations(input.movieId);
    return movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      releaseDate: movie.release_date,
      rating: movie.vote_average,
    }));
  }
);
