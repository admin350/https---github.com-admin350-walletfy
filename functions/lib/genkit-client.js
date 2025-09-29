'use server';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { firebase } from '@genkit-ai/firebase';
export const ai = genkit({
    plugins: [
        googleAI(),
        firebase({
            flowStateStore: {
                collection: 'flow-states',
            },
            traceStore: {
                collection: 'traces',
            },
        }),
    ],
});
//# sourceMappingURL=genkit-client.js.map