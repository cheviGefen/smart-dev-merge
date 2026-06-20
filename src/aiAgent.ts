import { GoogleGenAI, Type } from '@google/genai';

const getApiKey = () =>
  (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();

const getAiAgent = () => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error(
      'Missing Gemini API key. Set GEMINI_API_KEY or GOOGLE_API_KEY in your environment.'
    );
  }

  return new GoogleGenAI({ apiKey });
};

const RiskAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    risk: {
      type: Type.STRING,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
    },
    reason: {
      type: Type.STRING,
      description: 'A brief explanation of why this risk level was assigned.',
    },
  },
  required: ['risk', 'reason'],
};

const systemInstruction = `
You are an expert Senior DevOps and Security Engineer.

Analyze the provided Pull Request (PR) title, description, and code diff.

Your task is to classify the risk of merging this PR into the 'develop' branch as:

- LOW
- MEDIUM
- HIGH

Evaluate the following dimensions:

1. Security impact
2. Potential bugs and regressions
3. Breaking changes
4. Infrastructure / deployment impact
5. Architectural impact
6. Size and complexity of the change

Risk classification guidelines:

HIGH:
- Any critical security issue.
- Changes to authentication, authorization, encryption, secrets handling.
- Database schema changes that may cause data loss.
- Breaking API contracts.
- Large refactors affecting core business logic.
- Changes impacting multiple services or infrastructure.

MEDIUM:
- Large PRs.
- Moderate refactors.
- Changes to database queries.
- Changes to caching, queues, jobs, integrations.
- Significant dependency upgrades.

LOW:
- Small isolated bug fixes.
- Documentation changes.
- Logging improvements.
- Tests only.
- Minor UI/config changes.

Important:
- If a HIGH-risk condition exists, the result MUST be HIGH.
- If no HIGH-risk condition exists but at least one MEDIUM-risk condition exists, the result MUST be MEDIUM.
- Only return LOW when there are no significant concerns.

Provide:
1. Risk level
2. Short explanation
3. Key findings
`;

export async function analyzePR({
  prTitle,
  prDescription,
  codeDiff,
}: {
  prTitle?: string;
  prDescription?: string;
  codeDiff: string;
}) {
  const prompt = `
PR Title: ${prTitle || 'Untitled'}
PR Description: ${prDescription || 'No description provided.'}

Code Diff:
${codeDiff}
`;

  const aiAgent = getAiAgent();

  const result = await aiAgent.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: RiskAnalysisSchema,
    },
  });

  if (!result.text) {
    throw new Error('AI returned an empty response.');
  }

  return JSON.parse(result.text);
}