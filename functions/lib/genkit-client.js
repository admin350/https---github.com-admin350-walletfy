"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ai = void 0;
const genkit_1 = require("genkit");
const googleai_1 = require("@genkit-ai/googleai");
const firebase_1 = require("@genkit-ai/firebase");
exports.ai = (0, genkit_1.genkit)({
    plugins: [
        (0, googleai_1.googleAI)(),
        (0, firebase_1.firebase)({
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