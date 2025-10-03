import { config } from 'dotenv';
config({ path: '.env.local' });
config();

import './flows/smart-movie-blending.ts';
import './flows/vibe-based-recommendations.ts';
import './flows/group-taste-fusion.ts';
