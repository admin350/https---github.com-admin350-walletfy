// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview Provides a GenAI-powered financial summary flow that allows users to ask questions about their finances using free-form text.
 *
 * @exports generateFinancialSummary - An async function that takes financial data and a user question as input, and returns a GenAI-generated summary answering the question.
 * @exports GenerateFinancialSummaryInput - The input type for the generateFinancialSummary function, including financial data and the user's question.
 * @exports GenerateFinancialSummaryOutput - The output type for the generateFinancialSummary function, which is a string containing the generated financial summary.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFinancialSummaryInputSchema = z.object({
  financialData: z.string().describe('A summary of the user\'s financial data, including income, expenses, debts, and savings.'),
  question: z.string().describe('The user\'s question about their finances.'),
});

export type GenerateFinancialSummaryInput = z.infer<typeof GenerateFinancialSummaryInputSchema>;

const GenerateFinancialSummaryOutputSchema = z.string().describe('A GenAI-generated summary answering the user\'s question about their finances.');

export type GenerateFinancialSummaryOutput = z.infer<typeof GenerateFinancialSummaryOutputSchema>;

export async function generateFinancialSummary(input: GenerateFinancialSummaryInput): Promise<GenerateFinancialSummaryOutput> {
  return generateFinancialSummaryFlow(input);
}

const generateFinancialSummaryPrompt = ai.definePrompt({
  name: 'generateFinancialSummaryPrompt',
  input: {schema: GenerateFinancialSummaryInputSchema},
  output: {schema: GenerateFinancialSummaryOutputSchema},
  prompt: `You are a financial expert. Please answer the following question about the user's finances, using the provided financial data.\n\nFinancial Data:\n{{{financialData}}}\n\nQuestion:\n{{{question}}}`,  
});

const generateFinancialSummaryFlow = ai.defineFlow(
  {
    name: 'generateFinancialSummaryFlow',
    inputSchema: GenerateFinancialSummaryInputSchema,
    outputSchema: GenerateFinancialSummaryOutputSchema,
  },
  async input => {
    const {output} = await generateFinancialSummaryPrompt(input);
    return output!;
  }
);
