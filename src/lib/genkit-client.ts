'use client';
import { genkit, type GenkitOptions } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { firebase } from '@genkit-ai/firebase';
import { dotprompt } from '@genkit-ai/dotprompt';


const options: GenkitOptions = {
  plugins: [
    googleAI({
      apiVersion: ['v1', 'v1beta'],
    }),
    firebase(),
    dotprompt({
      // By default, Dotprompt uses the local file system to store prompts.
      // To use Firestore instead, uncomment the following line and install
      // the @genkit-ai/firebase plugin.
      // client: firebase().promptClient(),
    }),
    
  ],
  // Where to store flow state. Defaults to in-memory.
  // flowStateStore: firebase().flowStateStore(),
  // Where to store traces. Defaults to in-memory.
  // traceStore: firebase().traceStore(),
  // Enable OpenTelemetry instrumentation.
  // telemtry: {
  //   instrumentation: firebase().instrumentation(),
  //   sampler: firebase().sampler()
  // }
};

export const ai = genkit(options);
