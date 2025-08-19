// app/page.js
"use client";
import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import { useData } from "@/context/DataContext";
import { QuizTypeSelector } from "@/components/QiuzTypeSelector/QuizTypeSelector";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const { generateQuiz, isLoading, requestId, data, setSetupInstructions } =
    useData();
  const router = useRouter();

  // form state
  const [topic, setTopic] = useState("");
  const [quizTypes, setQuizTypes] = useState([]);
  const [numQuestions, setNumQuestions] = useState();
  const [optionsPerQuestion, setOptionsPerQuestion] = useState();
  const [answerRequired, setAnswerRequired] = useState(true);
  const [explanationRequired, setExplanationRequired] = useState(true);
  const [instructions, setInstructions] = useState("");

  const [error, setError] = useState(null);

  function validate() {
    const max =
      (data && Number(data.config?.max_number_of_questions_per_generation)) ||
      30;

    const n = Number(numQuestions);
    if (!Number.isInteger(n) || n < 1 || n > max) {
      console.log(
        "Current Question Count: ",
        numQuestions,
        data?.config?.max_number_of_questions_per_generation
      );
      return `Number of questions must be between 1 and ${
        data?.config?.max_number_of_questions_per_generation || 30
      }.`;
    }
    if (
      !optionsPerQuestion ||
      optionsPerQuestion < 4 ||
      optionsPerQuestion > 8
    ) {
      return "Options per question must be between 4 and 8.";
    }
    return null;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    // optional: persist the instructions in global data while waiting
    setSetupInstructions(instructions);

    const payload = {
      user_additional_instructions: instructions,
      topic: topic || null,
      quiz_type: quizTypes.length ? quizTypes : null,
      num_questions: Number(numQuestions),
      options_per_question: Number(optionsPerQuestion),
      answer_required: answerRequired,
      explanation_required: explanationRequired,
    };

    const res = await generateQuiz(payload);
    if (!res.ok) {
      setError("Failed to generate quiz. Check console for details.");
    } else {
      // success — your context now has quizzes and history
      router.push(`/quiz?genId=${encodeURIComponent(res.generationId)}`);
      console.log("Generated successfully", res.json);
    }
  }

  return (
    <div className={styles.setupContainer}>
      {/* <Link href="/feedback">FeedBack From Home</Link> */}
      <form className={styles.params} onSubmit={onSubmit}>
        <input
          title="Topic, eg. Computer Architecture"
          className={styles.topic}
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Topic"
        />

        <QuizTypeSelector value={quizTypes} onChange={setQuizTypes} />

        <input
          type="number"
          max={data?.config?.max_number_of_questions_per_generation || 30}
          min={1}
          className={styles.number}
          value={numQuestions}
          onChange={(e) => setNumQuestions(e.target.value)}
          placeholder="Number of Questions"
          title={`Number of Question, max: ${
            data?.config?.max_number_of_questions_per_generation || 30
          }`}
        />
        <input
          type="number"
          max={8}
          min={4}
          className={styles.number}
          value={optionsPerQuestion}
          onChange={(e) => setOptionsPerQuestion(e.target.value)}
          placeholder="Number of Possible Answers"
          title="Number of Possible Answers, max: 8"
        />

        <div className={styles.checkBox}>
          <label title="Should the Answers be included?">
            <input
              className={styles.check}
              checked={answerRequired}
              type="checkbox"
              onChange={(e) => setAnswerRequired(e.target.checked)}
            />
            Answers Required
          </label>
          <label title="Should the Explanations be included?">
            <input
              className={styles.check}
              checked={explanationRequired}
              type="checkbox"
              onChange={(e) => setExplanationRequired(e.target.checked)}
            />
            Explanation Required
          </label>
        </div>
        <div style={{ fontSize: 12, color: "#999" }}>
          Request Id: <code>{requestId}</code>
        </div>

        <textarea
          className={styles.generate}
          placeholder="eg. Generate some questions on Linked List ..."
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit(e);
            }
          }}
        />
        {error && <div className={styles.errorBox}>{error}</div>}

        <button
          className={styles.generateButton}
          title="Generate Quiz?"
          type="submit"
          disabled={isLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 19V5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </button>
      </form>

      {/* <div style={{ marginTop: 20 }}>
        <h3>Preview (last result)</h3>
        <pre
          style={{ whiteSpace: "pre-wrap", maxHeight: 240, overflow: "auto" }}
        >
          {JSON.stringify(data.lastRequestMeta || data.quizzes, null, 2)}
        </pre>
      </div> */}
    </div>
  );
}
