"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ai = void 0;
const genkit_1 = require("genkit");
const googleai_1 = require("@genkit-ai/googleai");
const firebase_1 = require("@genkit-ai/firebase");
const options = {
    plugins: [
        (0, googleai_1.googleAI)({
            apiVersion: ['v1', 'v1beta'],
        }),
        (0, firebase_1.firebase)(),
    ],
    flowStateStore: (0, firebase_1.firebase)().flowStateStore(),
    traceStore: (0, firebase_1.firebase)().traceStore(),
    telemetry: {
        instrumentation: (0, firebase_1.firebase)().instrumentation(),
        sampler: (0, firebase_1.firebase)().sampler()
    }
};
exports.ai = (0, genkit_1.genkit)(options);
//# sourceMappingURL=genkit-client.js.map