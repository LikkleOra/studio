'use server';

/**
 * @fileOverview A flow to combine mood, vibe, and genre selections to generate movie and TV show recommendations.
 *
 * - smartMovieBlending - A function that handles the recommendation process.
 * - SmartMovieBlendingInput - The input type for the smartMovieBlending function.
 * - SmartMovieBlendingOutput - The return type for the smartMovieBlending function.
 */

import {ai} from '@/ai/genkit';
import { searchContentTool, getRecommendationsTool, getWatchProvidersTool } from '@/ai/tools/tmdb';
import {z} from 'zod';

const SmartMovieBlendingInputSchema = z.object({
  mood: z.string().describe('The selected mood (e.g., Chill, Hype, Cozy).'),
  mediaType: z.enum(['movie', 'tv', 'any']).describe("The type of media to search for ('movie', 'tv', or 'any')."),
  vibe: z.string().describe('A movie/show title or general vibe to find similar content (e.g., Shrek, Inception, "a quiet rainy day").'),
  genres: z.array(z.string()).describe('An array of selected genres (e.g., Horror, Comedy, Romance).'),
});
export type SmartMovieBlendingInput = z.infer<typeof SmartMovieBlendingInputSchema>;

const SmartMovieBlendingOutputSchema = z.array(
  z.object({
    mediaId: z.number().describe('The ID of the recommended movie or show.'),
    mediaType: z.enum(['movie', 'tv']).describe("The type of media ('movie' or 'tv')."),
    title: z.string().describe('The title of the movie or show.'),
    confidenceScore: z.number().describe('A score indicating how well the content matches the input criteria.'),
    reason: z.string().describe('Explanation of why this content works, including genre and mood.'),
    posterUrl: z.string().nullable().describe('The URL of the poster.'),
    watchProviders: z.array(z.string()).describe('A list of streaming providers where the content is available.'),
  })
).describe('A list of movie or TV show recommendations');
export type SmartMovieBlendingOutput = z.infer<typeof SmartMovieBlendingOutputSchema>;

export async function smartMovieBlending(input: SmartMovieBlendingInput): Promise<SmartMovieBlendingOutput> {
  return smartMovieBlendingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartMovieBlendingPrompt',
  input: {schema: SmartMovieBlendingInputSchema},
  output: {schema: SmartMovieBlendingOutputSchema},
  tools: [searchContentTool, getRecommendationsTool, getWatchProvidersTool],
  prompt: `You are a movie and TV show recommendation expert. 
  1. Use the searchContent tool to find 5-10 items that match the user's criteria. Combine the mood, vibe, and genres to form a search query.
  2. If the tool returns no results or an empty array, you MUST return an empty array from the flow. Do not invent results. Do not try searching again.
  3. For each item found, use the getWatchProviders tool to see where it is streaming in the US.
  4. For each recommended item, provide a confidence score, a brief reason for the recommendation, and the list of watch providers.
  5. Ensure you return the mediaId (which is the 'id' from the tool) and mediaType for each recommendation.
  6. Do not recommend an item if it does not have a poster.

The user's criteria are:
Mood: {{{mood}}}
Media Type: {{{mediaType}}}
Vibe: {{{vibe}}}
Genres: {{#each genres}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}`,
});

const smartMovieBlendingFlow = ai.defineFlow(
  {
    name: 'smartMovieBlendingFlow',
    inputSchema: SmartMovieBlendingInputSchema,
    outputSchema: SmartMovieBlendingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      return [];
    }
    return output;
  }
);
