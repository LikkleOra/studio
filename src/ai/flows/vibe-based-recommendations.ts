'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating movie recommendations based on a user-provided movie title.
 *
 * - getVibeBasedRecommendations - A function that takes a movie title as input and returns a list of similar movie recommendations.
 * - VibeBasedRecommendationsInput - The input type for the getVibeBasedRecommendations function.
 * - VibeBasedRecommendationsOutput - The return type for the getVibeBasedRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VibeBasedRecommendationsInputSchema = z.object({
  movieTitle: z.string().describe('The title of a movie to find similar movies to.'),
});
export type VibeBasedRecommendationsInput = z.infer<typeof VibeBasedRecommendationsInputSchema>;

const VibeBasedRecommendationsOutputSchema = z.array(z.string()).describe('A list of similar movie titles.');
export type VibeBasedRecommendationsOutput = z.infer<typeof VibeBasedRecommendationsOutputSchema>;

export async function getVibeBasedRecommendations(input: VibeBasedRecommendationsInput): Promise<VibeBasedRecommendationsOutput> {
  return vibeBasedRecommendationsFlow(input);
}

const vibeBasedRecommendationsPrompt = ai.definePrompt({
  name: 'vibeBasedRecommendationsPrompt',
  input: {schema: VibeBasedRecommendationsInputSchema},
  output: {schema: VibeBasedRecommendationsOutputSchema},
  prompt: `You are a movie recommendation expert. Given the title of a movie, you will provide a list of 5 similar movie titles.

Movie Title: {{{movieTitle}}}

Similar Movie Titles:`,
});

const vibeBasedRecommendationsFlow = ai.defineFlow(
  {
    name: 'vibeBasedRecommendationsFlow',
    inputSchema: VibeBasedRecommendationsInputSchema,
    outputSchema: VibeBasedRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await vibeBasedRecommendationsPrompt(input);
    return output!;
  }
);
