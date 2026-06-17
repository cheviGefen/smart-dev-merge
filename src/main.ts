import express, { type Request, type Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

if (!process.env.GEMINI_API_KEY) {
  console.error('[startup] GEMINI_API_KEY is not set.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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


const systemInstruction: string = `

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

- Any critical security issue (e.g. SQL Injection, Command Injection, Path Traversal, SSRF, RCE, Authentication or Authorization bypass).

- Changes to authentication, authorization, encryption, secrets handling, or security-sensitive infrastructure.

- Database schema changes that may cause data loss.

- Breaking API contracts.

- Large refactors affecting core business logic.

- Changes that impact multiple services, production infrastructure, CI/CD pipelines, or networking.



MEDIUM:

- Large PRs (e.g. more than 500 changed lines or touching many files) even when no obvious bug is found.

- Moderate refactors.

- Changes to database queries.

- Changes to caching, queues, background jobs, or integrations.

- New dependencies or package upgrades with significant version jumps.

- Changes that are difficult to fully validate from the diff alone.



LOW:

- Small isolated bug fixes.

- Documentation changes.

- Logging improvements.

- Tests only.

- Minor UI or configuration changes with no production impact.



Important:

- If a HIGH-risk condition exists, the result MUST be HIGH.

- If no HIGH-risk condition exists but at least one MEDIUM-risk condition exists, the result MUST be MEDIUM.

- Only return LOW when there are no significant concerns.



Provide:

1. Risk level

2. Short explanation

3. Key findings that justify the classification

`;


app.get('/ping', (req, res) => {
  console.log('Ping received');
  res.send('pong! The server is alive.');
});

app.post('/analyze-pr', async (req: Request, res: Response): Promise<void> => {
  try {
    const { owner, repo, prNumber, prTitle, prDescription, codeDiff } = req.body;

    console.log(
      `[analyze-pr] repo=${owner || 'unknown'}/${repo || 'unknown'} pr=${prNumber || 'unknown'} diffLength=${typeof codeDiff === 'string' ? codeDiff.length : 0}`
    );

    if (!codeDiff || typeof codeDiff !== 'string') {
      console.error('[analyze-pr] Missing or invalid codeDiff in request body.');
      res.status(400).json({ error: "Missing or invalid 'codeDiff' in request body." });
      return;
    }

    const prompt = `PR Title: ${prTitle || 'Untitled'}\nPR Description: ${prDescription || 'No description provided.'}\n\nCode Diff:\n${codeDiff}`;

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: RiskAnalysisSchema,
      },
    });

    const rawContent = result.text;

    if (!rawContent) {
      throw new Error('AI returned an empty response.');
    }

    console.log('[analyze-pr] AI response received.');
    console.log(rawContent);

    const analysisResult = JSON.parse(rawContent);

    res.json({
      success: true,
      data: analysisResult,
    });
  } catch (error) {
    console.error('[analyze-pr] Error analyzing PR:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running locally on http://localhost:${PORT}`);
});
