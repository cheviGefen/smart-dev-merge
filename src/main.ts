import dotenv from 'dotenv';

dotenv.config();

import express, { type Request, type Response } from 'express';

const { analyzePR } = require('./aiAgent') as {
  analyzePR: (args: {
    prTitle?: string;
    prDescription?: string;
    codeDiff: string;
  }) => Promise<any>;
};

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const PORT = process.env.PORT || 3000;
const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();

if (!apiKey) {
  console.error(
    '[startup] GEMINI_API_KEY or GOOGLE_API_KEY is not set.'
  );
  process.exit(1);
}

app.get('/ping', (_req, res) => {
  console.log('Ping received');
  res.send('pong! The server is alive.');
});

app.post('/analyze-pr', async (req: Request, res: Response) => {
  try {
    const {
      owner,
      repo,
      prNumber,
      prTitle,
      prDescription,
      codeDiff,
    } = req.body;

    console.log(
      `[analyze-pr] repo=${owner || 'unknown'}/${repo || 'unknown'} pr=${prNumber || 'unknown'} diffLength=${typeof codeDiff === 'string' ? codeDiff.length : 0}`
    );

    if (!codeDiff || typeof codeDiff !== 'string') {
      res.status(400).json({
        error: "Missing or invalid 'codeDiff' in request body.",
      });
      return;
    }

    const analysisResult = await analyzePR({
      prTitle,
      prDescription,
      codeDiff,
    });

    res.json({
      success: true,
      data: analysisResult,
    });
  } catch (error) {
    console.error('[analyze-pr] Error analyzing PR:', error);

    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running locally on http://localhost:${PORT}`);
});