'use server';
/**
 * @fileOverview Un agente de IA para procesar transacciones a granel desde texto o imágenes.
 */
import { z } from 'zod';
import { ai } from '../genkit-client';
const TransactionSchema = z.object({
    amount: z.number().describe("El monto numérico de la transacción. Positivo para ingresos, negativo para gastos."),
    description: z.string().describe("Una breve descripción de la transacción."),
    category: z.string().describe("La categoría que mejor se ajusta a la transacción."),
    profile: z.string().describe("El perfil financiero al que pertenece (ej. Personal, Negocio)."),
    accountId: z.string().describe("El ID de la cuenta o tarjeta utilizada."),
});
const ProcessTransactionsInputSchema = z.object({
    text: z.string().optional().describe("El texto en bruto que contiene las transacciones."),
    photoDataUri: z.string().optional().describe("Una foto de las transacciones como data URI."),
    categories: z.array(z.string()).describe("Lista de categorías de gastos e ingresos disponibles."),
    profiles: z.array(z.string()).describe("Lista de perfiles financieros disponibles."),
    accounts: z.array(z.object({ id: z.string(), name: z.string() })).describe("Lista de cuentas y tarjetas disponibles con sus IDs y nombres."),
});
const ProcessTransactionsOutputSchema = z.object({
    transactions: z.array(TransactionSchema),
});
export async function processTransactions(input) {
    return processTransactionsFlow(input);
}
const prompt = ai.definePrompt({
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
const processTransactionsFlow = ai.defineFlow({
    name: 'processTransactionsFlow',
    inputSchema: ProcessTransactionsInputSchema,
    outputSchema: ProcessTransactionsOutputSchema,
}, async (input) => {
    const llmResponse = await prompt(input);
    return llmResponse.output || { transactions: [] };
});
//# sourceMappingURL=process-transactions.js.map