'use server';
/**
 * @fileOverview Un agente de IA para procesar transacciones a granel desde texto o imágenes.
 */
import { generate } from 'genkit/ai';
import { geminiPro } from '@genkit-ai/googleai';
import { z } from 'zod';
import { defineFlow } from 'genkit/flow';
import { ai } from '@/lib/genkit-client';

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

export async function processTransactions(input: z.infer<typeof ProcessTransactionsInputSchema>): Promise<z.infer<typeof ProcessTransactionsOutputSchema>> {
    return processTransactionsFlow(input);
}


const processTransactionsFlow = defineFlow(
  {
    name: 'processTransactionsFlow',
    inputSchema: ProcessTransactionsInputSchema,
    outputSchema: ProcessTransactionsOutputSchema,
  },
  async (input) => {
    const promptParts = [
        `Eres un asistente experto en finanzas para la app WALLETFY. Tu tarea es analizar un texto o una imagen y extraer todas las transacciones que encuentres.`,
        `Para cada transacción, debes identificar: el monto, una descripción, la categoría, el perfil y la cuenta/tarjeta utilizada.`,
        `Usa las siguientes listas para hacer coincidir la información:`,
        `Perfiles Disponibles: ${input.profiles.join(', ')}.`,
        `Categorías Disponibles: ${input.categories.join(', ')}.`,
        `Cuentas/Tarjetas Disponibles (debes devolver el ID asociado al nombre): ${input.accounts.map(a => `${a.name} (ID: ${a.id})`).join(', ')}.`,
        `El monto debe ser un número. Si es un gasto, hazlo negativo. Si es un ingreso, mantenlo positivo.`,
        `Si no puedes determinar un campo, déjalo como un string vacío.`,
        `Analiza la siguiente entrada y devuelve un objeto JSON con una lista de transacciones.`
    ];

    if (input.text) {
        promptParts.push(`Aquí está el texto a analizar:\n\n${input.text}`);
    } else if (input.photoDataUri) {
        promptParts.push('Analiza el texto en la siguiente imagen:');
        promptParts.push({ media: { url: input.photoDataUri } });
    }

    const llmResponse = await generate({
        model: geminiPro,
        prompt: promptParts,
        output: {
            format: 'json',
            schema: ProcessTransactionsOutputSchema,
        },
        config: {
            temperature: 0.1,
        }
    });

    return llmResponse.output() || { transactions: [] };
  }
);
