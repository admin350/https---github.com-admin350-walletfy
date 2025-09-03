
'use server';

/**
 * @fileOverview A flow that generates a comprehensive monthly financial report.
 *
 * - generateMonthlyReport - A function that generates the report.
 * - GenerateMonthlyReportInput - The input type for the generateMonthlyReport function.
 * - GenerateMonthlyReportOutput - The return type for the generateMonthlyReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMonthlyReportInputSchema = z.object({
  month: z.number().describe('The month for the report (0-11).'),
  year: z.number().describe('The year for the report.'),
  transactions: z.string().describe('JSON string of all transactions for the month.'),
  goals: z.string().describe('JSON string of all savings goals.'),
  debts: z.string().describe('JSON string of all debts.'),
  investments: z.string().describe('JSON string of all investments.'),
  budgets: z.string().describe('JSON string of all budgets.'),
});
export type GenerateMonthlyReportInput = z.infer<typeof GenerateMonthlyReportInputSchema>;

const GenerateMonthlyReportOutputSchema = z.string().describe('A comprehensive financial report in Markdown format.');
export type GenerateMonthlyReportOutput = z.infer<typeof GenerateMonthlyReportOutputSchema>;

export async function generateMonthlyReport(input: GenerateMonthlyReportInput): Promise<GenerateMonthlyReportOutput> {
  return generateMonthlyReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMonthlyReportPrompt',
  input: {schema: GenerateMonthlyReportInputSchema},
  output: {schema: GenerateMonthlyReportOutputSchema},
  prompt: `You are an expert financial analyst. Your task is to generate a comprehensive, clear, and insightful monthly financial report in Spanish, formatted as a single Markdown string.

Analyze the user's financial data for the specified month and year.

**Report Sections to Include:**
1.  **Executive Summary:** High-level overview of income, expenses, and net balance.
2.  **Income and Expense Analysis:** Breakdown of income sources and top spending categories.
3.  **Progress Towards Goals:** Analysis of savings contributions.
4.  **Debt Situation:** Summary of debt payments and remaining balances.
5.  **Investment Performance:** Summary of portfolio performance.
6.  **Budget Comparison:** Analysis of actual spending vs. budgeted amounts.
7.  **Conclusions and Recommendations:** Provide 2-3 actionable recommendations.

**Input Data:**
*   **Month/Year:** {{{month}}}/{{{year}}}
*   **Transactions:** {{{transactions}}}
*   **Goals:** {{{goals}}}
*   **Debts:** {{{debts}}}
*   **Investments:** {{{investments}}}
*   **Budgets:** {{{budgets}}}

Ensure your entire response is a single, valid Markdown string.
`,
});

const generateMonthlyReportFlow = ai.defineFlow(
  {
    name: 'generateMonthlyReportFlow',
    inputSchema: GenerateMonthlyReportInputSchema,
    outputSchema: GenerateMonthlyReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
