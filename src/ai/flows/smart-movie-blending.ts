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
    confidenceScore: z.number().describe('A score from 0.0 to 1.0 indicating how well the content matches the input criteria.'),
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
  tools: [searchContentTool, getWatchProvidersTool],
  prompt: `You are a movie and TV show recommendation expert. Your goal is to find 5-10 highly relevant items for a user.

Follow these steps:
1.  Analyze the user's criteria: Mood, Media Type, Vibe, and Genres.
2.  Combine the 'vibe' and 'mood' to form a descriptive search query. For example, if the mood is "Scared" and the vibe is "a haunted house", the query could be "scary haunted house movie".
3.  Use the \`searchContent\` tool with the query, genres, and mediaType. This is your primary method for finding content.
4.  **IMPORTANT**: If the \`searchContent\` tool returns no results or an empty array, you MUST return an empty array from the flow. Do not invent results. Do not try searching again.
5.  For each potential recommendation returned by the tool, evaluate its suitability.
6.  For each suitable item, use the \`getWatchProviders\` tool to get the list of streaming services in the US.
7.  For each recommendation, create a confidence score (0.0 to 1.0) and a brief 'reason' explaining why it's a good match.
8.  Ensure you return the mediaId (which is the 'id' from the tool) and mediaType for each recommendation.
9.  You must not recommend any item that does not have a poster URL.

The user's criteria are:
- Mood: {{{mood}}}
- Media Type: {{{mediaType}}}
- Vibe: {{{vibe}}}
- Genres: {{#each genres}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}`,
});

const smartMovieBlendingFlow = ai.defineFlow(
  {
    name: 'smartMovieBlendingFlow',
    inputSchema: SmartMovieBlendingInputSchema,
    outputSchema: SmartMovieBlendingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // If the AI returns no output (which can happen if it follows the instructions to return nothing),
    // ensure we send back an empty array to prevent downstream errors.
    if (!output) {
      return [];
    }
    return output;
  }
);
