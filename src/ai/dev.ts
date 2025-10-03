import { config } from 'dotenv';
config({ path: '.env.local' });
config();

import '@/ai/flows/smart-movie-blending.ts';
import '@/ai/flows/vibe-based-recommendations.ts';
import '@/ai/flows/group-taste-fusion.ts';
