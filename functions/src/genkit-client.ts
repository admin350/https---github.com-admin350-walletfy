'use server';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { firebase } from '@genkit-ai/firebase';

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: ['v1', 'v1beta'],
    }),
    firebase(),
  ],
  flowStateStore: "firebase",
  traceStore: "firebase",
  telemetry: {
    instrumentation: "firebase",
    sampler: "firebase"
  }
});
