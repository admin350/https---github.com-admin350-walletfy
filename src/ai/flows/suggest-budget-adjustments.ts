'use server';

/**
 * @fileOverview A flow that suggests budget adjustments based on spending patterns.
 *
 * - suggestBudgetAdjustments - A function that suggests budget adjustments.
 * - SuggestBudgetAdjustmentsInput - The input type for the suggestBudgetAdjustments function.
 * - SuggestBudgetAdjustmentsOutput - The return type for the suggestBudgetAdjustments function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestBudgetAdjustmentsInputSchema = z.object({
  income: z.number().describe('The total income for the month.'),
  expenses: z
    .array(
      z.object({
        category: z.string().describe('The category of the expense.'),
        amount: z.number().describe('The amount spent in that category.'),
      })
    )
    .describe('An array of expenses with their respective categories and amounts.'),
  financialGoals: z
    .string()
    .describe(
      'A description of the user financial goals, e.g., save for a down payment on a house, pay off debt, etc.'
    ),
});
export type SuggestBudgetAdjustmentsInput = z.infer<typeof SuggestBudgetAdjustmentsInputSchema>;

const SuggestBudgetAdjustmentsOutputSchema = z.object({
  suggestions: z
    .array(
      z.object({
        category: z.string().describe('The category to adjust.'),
        adjustment: z.string().describe('The suggested adjustment for the category.'),
        reason: z.string().describe('The reason for the suggested adjustment.'),
      })
    )
    .describe('An array of suggested budget adjustments with their reasons.'),
});
export type SuggestBudgetAdjustmentsOutput = z.infer<typeof SuggestBudgetAdjustmentsOutputSchema>;

export async function suggestBudgetAdjustments(
  input: SuggestBudgetAdjustmentsInput
): Promise<SuggestBudgetAdjustmentsOutput> {
  return suggestBudgetAdjustmentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBudgetAdjustmentsPrompt',
  input: {schema: SuggestBudgetAdjustmentsInputSchema},
  output: {schema: SuggestBudgetAdjustmentsOutputSchema},
  prompt: `You are a financial advisor. Based on the user's income, expenses, and financial goals, suggest adjustments to their budget categories.

Income: {{{income}}}
Expenses: {{#each expenses}}- Category: {{{category}}}, Amount: {{{amount}}}
{{/each}}
Financial Goals: {{{financialGoals}}}

Suggest specific adjustments to budget categories, explaining the reason for each suggestion.

Format your response as a JSON array of suggestions, where each suggestion includes the category, adjustment, and reason.

Make sure the adjustments align with the user's financial goals.`,
});

const suggestBudgetAdjustmentsFlow = ai.defineFlow(
  {
    name: 'suggestBudgetAdjustmentsFlow',
    inputSchema: SuggestBudgetAdjustmentsInputSchema,
    outputSchema: SuggestBudgetAdjustmentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
