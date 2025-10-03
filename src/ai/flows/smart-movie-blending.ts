'use server';

/**
 * @fileOverview A flow to combine mood, vibe, and genre selections to generate movie recommendations.
 *
 * - smartMovieBlending - A function that handles the movie recommendation process.
 * - SmartMovieBlendingInput - The input type for the smartMovieBlending function.
 * - SmartMovieBlendingOutput - The return type for the smartMovieBlending function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartMovieBlendingInputSchema = z.object({
  mood: z.string().describe('The selected mood (e.g., Chill, Hype, Cozy).'),
  vibe: z.string().describe('A movie title to find similar movies based on AI embeddings (e.g., Shrek, Inception).'),
  genres: z.array(z.string()).describe('An array of selected genres (e.g., Horror, Comedy, Romance).'),
});
export type SmartMovieBlendingInput = z.infer<typeof SmartMovieBlendingInputSchema>;

const SmartMovieBlendingOutputSchema = z.array(
  z.object({
    title: z.string().describe('The title of the movie.'),
    confidenceScore: z.number().describe('A score indicating how well the movie matches the input criteria.'),
    reason: z.string().describe('Explanation of why this movie works, including genre and mood.'),
  })
).length(z.number().min(5).max(10)).describe('A list of 5-10 movie recommendations');
export type SmartMovieBlendingOutput = z.infer<typeof SmartMovieBlendingOutputSchema>;

export async function smartMovieBlending(input: SmartMovieBlendingInput): Promise<SmartMovieBlendingOutput> {
  return smartMovieBlendingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartMovieBlendingPrompt',
  input: {schema: SmartMovieBlendingInputSchema},
  output: {schema: SmartMovieBlendingOutputSchema},
  prompt: `You are a movie recommendation expert. Based on the user's mood, preferred movie (vibe), and selected genres, recommend 5-10 movies.

Mood: {{{mood}}}
Vibe (Similar Movie): {{{vibe}}}
Genres: {{#each genres}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Format your response as a JSON array of objects. Each object should include the movie title, a confidence score (0-1), and a brief explanation of why the movie works based on the provided mood, vibe, and genres.
`,
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
