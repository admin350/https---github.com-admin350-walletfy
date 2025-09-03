
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
  reportData: z.string().describe('A summary of the financial data for the month.'),
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
  // We remove the output schema validation here to handle potential nulls in the flow itself.
  prompt: `You are a financial analyst. Your task is to generate a comprehensive, clear, and insightful monthly financial report in Spanish, formatted as a single Markdown string.

Analyze the user's financial data for the specified month and year.

**Input Data:**
*   **Month/Year:** {{{month}}}/{{{year}}}
*   **Financial Summary:** {{{reportData}}}

Provide a clear and well-structured financial analysis based on the data summary provided.
Ensure your entire response is a single, valid Markdown string.
If you cannot generate a report for any reason, respond with a simple error message in Markdown, like '# Error\\n\\nNo se pudo generar el informe.' but never return a null or non-string response.
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
    if (!output) {
      throw new Error("AI failed to generate report. Please try again.");
    }
    return output;
  }
);
