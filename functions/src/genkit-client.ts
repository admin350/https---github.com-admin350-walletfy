'use server';
import { genkit, type GenkitOptions } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { firebase } from '@genkit-ai/firebase';

const options: GenkitOptions = {
  plugins: [
    googleAI({
      apiVersion: ['v1', 'v1beta'],
    }),
    firebase(),
  ],
  flowStateStore: firebase().flowStateStore(),
  traceStore: firebase().traceStore(),
  telemetry: {
    instrumentation: firebase().instrumentation(),
    sampler: firebase().sampler()
  }
};

export const ai = genkit(options);
