# 🤖 Smart Dev Merge

Smart Dev Merge is an AI-powered PR gatekeeper that reviews GitHub pull requests and classifies their merge risk using a Gemini-based model. The system helps teams decide whether a PR is safe to merge automatically, needs human review, or should be blocked.

This project combines a lightweight Express server, a GitHub Actions workflow, and a TypeScript-based AI analysis pipeline.

---

## ✨ What the project does

When a pull request targets the `develop` branch, the workflow:

1. Fetches the diff between the PR branch and the base branch.
2. Sends the PR metadata + diff to the backend API.
3. Uses AI to evaluate the change risk.
4. Writes the result to the GitHub Actions summary for review.

The AI returns one of three outcomes:

| Risk | Meaning | Action |
|---|---|---|
| 🟢 LOW | Safe and low-impact changes | Can be approved automatically |
| 🟡 MEDIUM | Moderate risk, requires attention | Human review recommended |
| 🔴 HIGH | Potentially dangerous or breaking changes | Block / request changes |

---

## 🧠 Architecture flow

```text
GitHub PR Event
   ↓
GitHub Actions Workflow
   ↓
Fetch diff + PR metadata
   ↓
POST /analyze-pr
   ↓
Express API
   ↓
Gemini AI analysis
   ↓
Risk result (LOW / MEDIUM / HIGH)
```

---

## 🛠️ Technologies used

- **Node.js** – runtime for the backend service
- **TypeScript** – typed server and AI logic
- **Express** – REST API server
- **@google/genai** – integration with Gemini AI
- **dotenv** – environment variable management
- **ts-node-dev** – hot-reload development server
- **Docker** – containerized runtime setup
- **GitHub Actions** – CI workflow for pull request automation
- **curl + jq** – payload sending and response handling in the workflow
- **GitHub PR events** – automatic trigger on PR updates

---

## 📁 Project structure

```text
.
├── src/
│   ├── main.ts          # Express API entry point
│   └── aiAgent.ts       # Gemini-based PR risk analysis logic
├── demo-app/
│   └── app.ts           # demo/test file used to validate behavior
├── .github/workflows/
│   └── pr-analyzer.yml  # GitHub Actions workflow
├── DockerFile           # Docker build/runtime instructions
├── package.json         # scripts and dependencies
└── README.md            # project documentation
```

---

## 🚀 Getting started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env` file with your API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

> You can also use `GOOGLE_API_KEY` if that is your preferred environment variable name.

### 3) Run locally

```bash
npm run dev
```

The server will start on:

```text
http://localhost:3000
```

### 4) Test the API

#### Health check

```bash
curl http://localhost:3000/ping
```

Expected response:

```text
pong! The server is alive.
```

#### Analyze a PR payload

```bash
curl -X POST http://localhost:3000/analyze-pr \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "your-org",
    "repo": "your-repo",
    "prNumber": 1,
    "prTitle": "Fix login bug",
    "prDescription": "Updates validation logic",
    "codeDiff": "diff --git a/app.js b/app.js\n+console.log('hello')"
  }'
```

---

## 🐳 Docker usage

Build the image:

```bash
docker build -t smart-dev-merge .
```

Run the container:

```bash
docker run -p 3000:3000 --env-file .env smart-dev-merge
```

---

## 🔐 API behavior

The server exposes:

- `GET /ping` – checks if the service is running
- `POST /analyze-pr` – analyzes a PR diff and returns a structured AI result

The response includes:

```json
{
  "success": true,
  "data": {
    "risk": "LOW",
    "reason": "This change appears safe and isolated."
  }
}
```

---

## ✅ Why this helps teams

- Reduces manual review load for low-risk changes
- Improves consistency of PR evaluation
- Adds AI-driven reasoning for technical and security concerns
- Creates a clear rule-based safety layer before merge

---

## 🧪 Demo / testing note

The [demo-app/app.ts](demo-app/app.ts) file is intended for testing and validation scenarios. It can be used to simulate different code changes and verify that the gatekeeping flow behaves correctly for low, medium, and high-risk cases.

---