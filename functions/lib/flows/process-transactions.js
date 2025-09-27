"use strict";
'use server';
Object.defineProperty(exports, "__esModule", { value: true });
exports.processTransactions = processTransactions;
/**
 * @fileOverview Un agente de IA para procesar transacciones a granel desde texto o imágenes.
 */
const zod_1 = require("zod");
const genkit_client_1 = require("../genkit-client");
const TransactionSchema = zod_1.z.object({
    amount: zod_1.z.number().describe("El monto numérico de la transacción. Positivo para ingresos, negativo para gastos."),
    description: zod_1.z.string().describe("Una breve descripción de la transacción."),
    category: zod_1.z.string().describe("La categoría que mejor se ajusta a la transacción."),
    profile: zod_1.z.string().describe("El perfil financiero al que pertenece (ej. Personal, Negocio)."),
    accountId: zod_1.z.string().describe("El ID de la cuenta o tarjeta utilizada."),
});
const ProcessTransactionsInputSchema = zod_1.z.object({
    text: zod_1.z.string().optional().describe("El texto en bruto que contiene las transacciones."),
    photoDataUri: zod_1.z.string().optional().describe("Una foto de las transacciones como data URI."),
    categories: zod_1.z.array(zod_1.z.string()).describe("Lista de categorías de gastos e ingresos disponibles."),
    profiles: zod_1.z.array(zod_1.z.string()).describe("Lista de perfiles financieros disponibles."),
    accounts: zod_1.z.array(zod_1.z.object({ id: zod_1.z.string(), name: zod_1.z.string() })).describe("Lista de cuentas y tarjetas disponibles con sus IDs y nombres."),
});
const ProcessTransactionsOutputSchema = zod_1.z.object({
    transactions: zod_1.z.array(TransactionSchema),
});
async function processTransactions(input) {
    return processTransactionsFlow(input);
}
const prompt = genkit_client_1.ai.definePrompt({
    name: 'processTransactionsPrompt',
    input: { schema: ProcessTransactionsInputSchema },
    output: { schema: ProcessTransactionsOutputSchema },
    prompt: `Eres un asistente experto en finanzas para la app WALLETFY. Tu tarea es analizar un texto o una imagen y extraer todas las transacciones que encuentres.

Para cada transacción, debes identificar: el monto, una descripción, la categoría, el perfil y la cuenta/tarjeta utilizada.

Usa las siguientes listas para hacer coincidir la información:
Perfiles Disponibles: {{{profiles}}}
Categorías Disponibles: {{{categories}}}
Cuentas/Tarjetas Disponibles (debes devolver el ID asociado al nombre): {{{accounts}}}

El monto debe ser un número. Si es un gasto, hazlo negativo. Si es un ingreso, mantenlo positivo.
Si no puedes determinar un campo, déjalo como un string vacío.

Analiza la siguiente entrada y devuelve un objeto JSON con una lista de transacciones.
{{#if text}}
Aquí está el texto a analizar:
{{{text}}}
{{/if}}
{{#if photoDataUri}}
Analiza el texto en la siguiente imagen:
{{media url=photoDataUri}}
{{/if}}
`
});
const processTransactionsFlow = genkit_client_1.ai.defineFlow({
    name: 'processTransactionsFlow',
    inputSchema: ProcessTransactionsInputSchema,
    outputSchema: ProcessTransactionsOutputSchema,
}, async (input) => {
    const llmResponse = await prompt(input);
    return llmResponse.output || { transactions: [] };
});
//# sourceMappingURL=process-transactions.js.map