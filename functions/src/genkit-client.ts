'use server';
import {genkit, FlowStateStore, TraceStore} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {firebase} from '@genkit-ai/firebase';

export const ai = genkit({
    plugins: [
        googleAI(),
        firebase(),
    ],
    flowStateStore: {
      collection: 'flow-states',
    } as FlowStateStore,
    traceStore: {
      collection: 'traces',
    } as TraceStore,
});
