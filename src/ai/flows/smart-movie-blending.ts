'use server';

/**
 * @fileOverview A flow to combine mood, vibe, and genre selections to generate movie and TV show recommendations.
 *
 * - smartMovieBlending - A function that handles the recommendation process.
 * - SmartMovieBlendingInput - The input type for the smartMovieBlending function.
 * - SmartMovieBlendingOutput - The return type for the smartMovieBlending function.
 */

import {ai} from '@/ai/genkit';
import { searchContentTool, getRecommendationsTool } from '@/ai/tools/tmdb';
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
    title: z.string().describe('The title of the movie or show.'),
    confidenceScore: z.number().describe('A score indicating how well the content matches the input criteria.'),
    reason: z.string().describe('Explanation of why this content works, including genre and mood.'),
    posterUrl: z.string().nullable().describe('The URL of the poster.'),
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
  tools: [searchContentTool, getRecommendationsTool],
  prompt: `You are a movie and TV show recommendation expert. Use the searchContent tool to find 5-10 items that match the user's criteria.

The user's criteria are:
Mood: {{{mood}}}
Media Type: {{{mediaType}}}
Vibe: {{{vibe}}}
Genres: {{#each genres}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

For each recommended item, provide a confidence score and a brief reason for the recommendation. Do not recommend an item if it does not have a poster.`,
});

const smartMovieBlendingFlow = ai.defineFlow(
  {
    name: 'smartMovieBlendingFlow',
    inputSchema: SmartMovieBlendingInputSchema,
    outputSchema: SmartMovieBlendingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
