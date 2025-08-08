// app/page.js
export default function Home() {
  return (
    <div className="panel">
      <h1 className="h1">Welcome to Sakaai Simulator</h1>
      <p className="lead">
        Generate quizzes, answer them, and get instant feedback. Use the left
        sidebar for history.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <a href="/setup">
          <button className="panel">Generate Quiz</button>
        </a>
        <a href="/quiz">
          <button className="panel">Open Last Quiz</button>
        </a>
      </div>
    </div>
  );
}
