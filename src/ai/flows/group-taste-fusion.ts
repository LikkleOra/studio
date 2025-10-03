'use server';

/**
 * @fileOverview Implements the Group Taste Fusion flow, which finds movies and TV shows that satisfy a group's preferences.
 *
 * - groupTasteFusion - A function that takes group preferences and returns recommendations with match scores and breakdowns.
 * - GroupTasteFusionInput - The input type for the groupTasteFusion function.
 * - GroupTasteFusionOutput - The return type for the groupTasteFusion function.
 */

import {ai} from '@/ai/genkit';
import { searchContentTool } from '@/ai/tools/tmdb';
import {z} from 'zod';

const GroupTasteFusionInputSchema = z.object({
  participants: z.array(
    z.object({
      mood: z.string().describe('The mood selected by the participant.'),
      genres: z.array(z.string()).describe('The genres selected by the participant.'),
      vibe: z.string().optional().describe('The vibe reference entered by the participant.'),
    })
  ).describe('An array of participant preferences.'),
});
export type GroupTasteFusionInput = z.infer<typeof GroupTasteFusionInputSchema>;

const GroupTasteFusionOutputSchema = z.array(
  z.object({
    movieId: z.string().describe('The ID of the recommended movie or show.'),
    title: z.string().describe('The title of the recommended movie or show.'),
    posterUrl: z.string().describe('The URL of the poster.'),
    groupMatchPercentage: z.number().describe('The percentage of how well the item matches the group preferences.'),
    whyThisWorks: z.string().describe('A breakdown of why the item works for the group.'),
  })
).describe('An array of recommendations with match scores and breakdowns.');


export type GroupTasteFusionOutput = z.infer<typeof GroupTasteFusionOutputSchema>;

export async function groupTasteFusion(input: GroupTasteFusionInput): Promise<GroupTasteFusionOutput> {
  return groupTasteFusionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'groupTasteFusionPrompt',
  input: {schema: GroupTasteFusionInputSchema},
  output: {schema: GroupTasteFusionOutputSchema},
  tools: [searchContentTool],
  prompt: `You are an AI recommendation expert for movies and TV shows. Given the preferences of a group of people, recommend content that would satisfy the entire group.

Use the searchContent tool to find movies and TV shows ('any' media type) that match the combined preferences of the group.

For each item, calculate a Group Match Percentage indicating how well it aligns with the overall group preferences. Also, provide a "Why this works" breakdown explaining why the item is a good fit for the group, considering their selected moods, genres, and vibe references. Do not recommend an item if it doesn't have a poster.

Group Preferences:
{{#each participants}}
  Participant {{@index}}:
    Mood: {{{mood}}}
    Genres: {{#each genres}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
    Vibe: {{{vibe}}}
{{/each}}`,
});

const groupTasteFusionFlow = ai.defineFlow(
  {
    name: 'groupTasteFusionFlow',
    inputSchema: GroupTasteFusionInputSchema,
    outputSchema: GroupTasteFusionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
