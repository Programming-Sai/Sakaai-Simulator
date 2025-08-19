<p align="center">
  <a href="https://sakaai-simulator.vercel.app" target="_blank" rel="noopener noreferrer">
    <img
      src="https://raw.githubusercontent.com/Programming-Sai/Sakaai-Simulator/snapmock-output/output_laptop.png"
      srcset="
        https://raw.githubusercontent.com/Programming-Sai/Sakaai-Simulator/snapmock-output/output_mobile.png  767w,
        https://raw.githubusercontent.com/Programming-Sai/Sakaai-Simulator/snapmock-output/output_tablet.png 1023w,
        https://raw.githubusercontent.com/Programming-Sai/Sakaai-Simulator/snapmock-output/output_laptop.png 1280w
      "
      sizes="(max-width: 767px) 100vw,
             (max-width: 1023px) 80vw,
             60vw"
      alt="Sakaai Simulator Preview"
      style="width:100%; height:auto;"
    />
  </a>
</p>

[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://sakaai-simulator.vercel.app)
[![FastAPI](https://img.shields.io/badge/API-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
![Active Development](https://img.shields.io/badge/status-active--development-blue?style=for-the-badge&logo=github)
![Beta](https://img.shields.io/badge/status-beta--testing-yellow?style=for-the-badge&logo=flask)
[![Stars](https://img.shields.io/github/stars/Programming-Sai/Sakaai-Simulator?style=for-the-badge&logo=github)](https://github.com/Programming-Sai/Sakaai-Simulator/stargazers)

# Sakaai Simulator

An AI-powered quiz generator & evaluator inspired by Sakai’s quiz workflow.

| Light Theme                                                        | Dark Theme                                                       |
| ------------------------------------------------------------------ | ---------------------------------------------------------------- |
| ![Light Home](./demo/home-light.jpeg)                              | ![Dark Home](./demo/home-dark.jpeg)                              |
| ![Light Loading](./demo/loading-light.jpeg)                        | ![Dark Loading](./demo/loading-dark.jpeg)                        |
| ![Light Quiz](./demo/quiz-light.jpeg)                              | ![Dark Quiz](./demo/quiz-dark.jpeg)                              |
| ![Light Quiz (Solved Progress)](./demo/quiz-solved-light.jpeg)     | ![Dark Quiz (Solved Progress)](./demo/quiz-solved-dark.jpeg)     |
| ![Light Results](./demo/results-light.jpeg)                        | ![Dark Results](./demo/results-dark.jpeg)                        |
| ![Light Results (Break Down)](./demo/results-breakdown-light.jpeg) | ![Dark Results (Break Down)](./demo/results-breakdown-dark.jpeg) |

**Sakaai Simulator** lets you:

- **Generate** custom quizzes from any topic or text prompt
- **Take** the quiz with a clean, distraction-free interface
- **View** instant feedback (score, correct answers, explanations)
- **Persist** your quiz history in the sidebar
- **Toggle** between light and dark themes

---

## 🚀 Getting Started

1. **Clone** this repo

   ```bash
   git clone https://github.com/Programming-Sai/Sakaai-Simulator.git
   cd Sakaai-Simulator
   git checkout sakaai
   ```

2. **Install** dependencies

   ```bash
   npm install
   ```

3. **Run** the dev server

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔧 What’s Done So Far

- **Backend**:

  - FastAPI health check, quiz-generation, evaluation, and feedback endpoints
  - Deployed on Render’s free tier (auto-wake polling)

- **Frontend**:

  - **Scaffolded** a Next.js App Router project (JS + CSS)

- **CI/CD & Previews**:

  - Vercel auto-deploys on every push to the `sakaai` branch
  - SnapMock workflow captures device-mockup screenshots and pushes to the `snapshots` branch

---

## 📬 Feedback & Contributions

Feedback is power—feel free to open issues or submit PRs. Happy quizzing! 🎉
