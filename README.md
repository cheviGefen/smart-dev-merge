# 🛡️ AI-Powered PR Gatekeeper

An automated, intelligent continuous integration (CI) gatekeeper that analyzes GitHub Pull Requests using AI to assess risk levels, leave descriptive security/architectural insights, and automate branch merge workflows.

Built with **TypeScript**, **Node.js**, **Express**, and integrated with the **OpenAI API (Structured Outputs)** and **GitHub Octokit**.

---

## 🚀 How It Works

Every time a developer opens or updates a Pull Request targeting the `develop` branch, a GitHub Action is triggered. It gathers the PR metadata and the raw `git diff`, then sends a secure webhook to our TypeScript backend.

[GitHub PR Event] ──> [GitHub Action] ──(Webhook with Diff)──> [TS Backend Server]
│
(OpenAI API)
│
[Auto-Approve / Block] <── (Octokit Action) ◄── [Risk Classification]┘


The system evaluates the changes and enforces code-review policies based on three structured risk levels:

| Risk Level | Action Enforced | Description |
| :---: | :--- | :--- |
| **🟢 LOW** | **Automatic Approve** | Minor fixes, documentation, formatting, or safe refactoring. Merges without human bottleneck. |
| **🟡 MEDIUM** | **Human Review Required** | Moderate logical updates, style changes, or core additions. Leaves an AI assessment but requires eyes. |
| **🔴 HIGH** | **Request Changes (Block)** | Structural changes, dependency updates, potential security risks, or destructive code. Blocked until fixed. |

---

## 🛠️ Tech Stack

* **Backend:** Node.js, TypeScript, Express
* **AI Engine:** OpenAI API (`gpt-4o-mini`) leveraging *Structured JSON Outputs* for guaranteed schema integrity.
* **CI/CD & Automation:** GitHub Actions, `@octokit/rest` (GitHub REST API Client)
* **Development Tools:** `ts-node-dev`, `dotenv`

---