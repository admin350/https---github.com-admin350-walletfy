import { config } from 'dotenv';
config();

import '@/ai/flows/categorize-transactions-ai.ts';
import '@/ai/flows/generate-financial-summary.ts';
import '@/ai/flows/suggest-budget-adjustments.ts';