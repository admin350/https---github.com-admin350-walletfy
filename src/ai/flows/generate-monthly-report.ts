
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
  totalIncome: z.number().describe('Total income for the month.'),
  totalExpenses: z.number().describe('Total expenses for the month.'),
  netBalance: z.number().describe('Net balance for the month.'),
  expensesByCategory: z.string().describe('A JSON string of expenses by category.'),
  activeDebts: z.number().describe('Number of active debts.'),
  activeGoals: z.number().describe('Number of active goals.'),
  activeInvestments: z.number().describe('Number of active investments.'),
});
export type GenerateMonthlyReportInput = z.infer<typeof GenerateMonthlyReportInputSchema>;

const GenerateMonthlyReportOutputSchema = z.object({
    report: z.string().describe('A comprehensive financial report in Markdown format.')
});
export type GenerateMonthlyReportOutput = z.infer<typeof GenerateMonthlyReportOutputSchema>;

export async function generateMonthlyReport(input: GenerateMonthlyReportInput): Promise<string> {
  const result = await generateMonthlyReportFlow(input);
  return result.report;
}

const prompt = ai.definePrompt({
  name: 'generateMonthlyReportPrompt',
  input: {schema: GenerateMonthlyReportInputSchema},
  output: {schema: GenerateMonthlyReportOutputSchema},
  prompt: `You are a financial analyst. Your task is to generate a comprehensive, clear, and insightful monthly financial report in Spanish, formatted as a single Markdown string.

Analyze the user's financial data for the specified month and year.

**Input Data:**
*   **Month/Year:** {{{month}}}/{{{year}}}
*   **Total Income:** {{{totalIncome}}}
*   **Total Expenses:** {{{totalExpenses}}}
*   **Net Balance:** {{{netBalance}}}
*   **Expenses by Category (JSON):** {{{expensesByCategory}}}
*   **Active Debts:** {{{activeDebts}}}
*   **Active Goals:** {{{activeGoals}}}
*   **Active Investments:** {{{activeInvestments}}}

Provide a clear and well-structured financial analysis based on the data provided.
Ensure your entire response is a single, valid JSON object with a single key "report" containing the full markdown string.
If you cannot generate a report for any reason, respond with a valid JSON containing an error message in the "report" field, like '{"report": "# Error\\n\\nNo se pudo generar el informe."}'.
Never return a null or non-JSON response.
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
    if (!output || !output.report) {
      throw new Error("AI failed to generate report. Please try again.");
    }
    return output;
  }
);
