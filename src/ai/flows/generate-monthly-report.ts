
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
  prompt: `You are an expert financial analyst. Your task is to generate a comprehensive, clear, and insightful monthly financial report in Markdown format.

The user will provide you with their financial data for a specific month and year in JSON format.

**Report Structure:**

1.  **# Resumen Ejecutivo (Executive Summary):**
    *   Start with a brief, high-level overview of the month's financial performance. Mention total income, total expenses, and the net balance.
    *   Highlight one major financial "win" (e.g., high savings rate, a new income stream) and one "área de mejora" (area for improvement, e.g., overspending in a specific category).

2.  **# Análisis de Ingresos y Egresos (Income and Expense Analysis):**
    *   **## Ingresos:** List the main income sources and their amounts.
    *   **## Egresos por Categoría:** Provide a breakdown of expenses by category. List the top 5-7 spending categories with njihove amounts.
    *   **## Flujo de Caja (Cash Flow):** State the net cash flow (Ingresos - Egresos).

3.  **# Progreso hacia Metas (Progress Towards Goals):**
    *   Analyze the progress made on savings goals. Mention the total amount contributed to goals during the month.
    *   Highlight any goals that are close to completion or that received significant contributions.

4.  **# Situación de Deudas (Debt Situation):**
    *   Summarize the current debt situation. Mention the total amount paid towards debts during the month.
    *   List the most significant debts and their remaining balances.

5.  **# Rendimiento de Inversiones (Investment Performance):**
    *   Provide a summary of the investment portfolio's performance. Mention total contributions and any notable changes in value.

6.  **# Comparación con el Presupuesto (Budget Comparison):**
    *   Compare the actual spending against the planned budget.
    *   Identify categories where spending was over or under budget and by how much. This is a critical section.

7.  **# Conclusiones y Recomendaciones (Conclusions and Recommendations):**
    *   Provide 2-3 actionable recommendations for the next month based on the analysis. These should be specific and tailored to the user's data (e.g., "Consider re-evaluating your 'Entretenimiento' budget, as you exceeded it by 25%," or "Excellent work on contributing an extra $200 to your emergency fund!").

**Data Provided:**

*   **Month/Year:** {{{month}}}/{{{year}}}
*   **Transactions:** {{{transactions}}}
*   **Goals:** {{{goals}}}
*   **Debts:** {{{debts}}}
*   **Investments:** {{{investments}}}
*   **Budgets:** {{{budgets}}}

Please generate the report in Spanish. Be professional, encouraging, and clear in your analysis.
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
