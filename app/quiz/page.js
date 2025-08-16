"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import { MCQQuizView } from "@/components/MCQ/MCQQuizView";
import { SATAQuizView } from "@/components/SATA/SATAQuizView";
import { TFQuizView } from "@/components/TF/TFQuizView";
import { FITBQuizView } from "@/components/FITB/FITBQuizView";
import { EssayQuizView } from "@/components/Essay/EssayQuizView";
import { useSearchParams } from "next/navigation";
import { useData } from "@/context/DataContext";

export default function Quiz() {
  const { data, setAnswer } = useData();
  const searchParams = useSearchParams();
  const genId = searchParams.get("genId");
  const questionMapping = {
    fitb: (key, question, userAnswer, showAnswer, quizId) => (
      <FITBQuizView
        index={key}
        quizId={quizId}
        question={question}
        userAnswer={userAnswer}
        showAnswer={showAnswer}
        onAnswer={setAnswer}
      />
    ),
    mcq: (key, question, userAnswer, showAnswer, quizId) => (
      <MCQQuizView
        index={key}
        quizId={quizId}
        question={question}
        userAnswer={userAnswer}
        showAnswer={showAnswer}
        onAnswer={setAnswer}
      />
    ),
    sata: (key, question, userAnswer, showAnswer, quizId) => (
      <SATAQuizView
        index={key}
        quizId={quizId}
        question={question}
        userAnswer={userAnswer}
        showAnswer={showAnswer}
        onAnswer={setAnswer}
      />
    ),
    tf: (key, question, userAnswer, showAnswer, quizId) => (
      <TFQuizView
        index={key}
        quizId={quizId}
        question={question}
        userAnswer={userAnswer}
        showAnswer={showAnswer}
        onAnswer={setAnswer}
      />
    ),
    essay: (key, question, userAnswer, showAnswer, quizId) => (
      <EssayQuizView
        index={key}
        quizId={quizId}
        question={question}
        userAnswer={userAnswer}
        showAnswer={showAnswer}
        onAnswer={setAnswer}
      />
    ),
  };
  const [index, setIndex] = useState(0);
  const questions = data?.quizzes[genId] || [];

  return (
    <div className={styles.quizContainer}>
      {/* <div>Timer</div> */}
      <div className={styles.quizProgress}>
        <p>
          Question {index + 1} of {questions.length}{" "}
        </p>
        <p style={{ opacity: 0.5 }}> | </p>
        <p> 1 point(s)</p>
      </div>

      {questions[index] && questionMapping[questions[index].type] ? (
        questionMapping[questions[index].type](
          index,
          questions[index], // question (object)
          data.answers?.[genId]?.[index] ?? null, // userAnswer
          false, // showAnswer
          genId // quizId
        )
      ) : (
        <p>No question available</p>
      )}

      {/* Padding for view and cickable area expansion. */}
      <div className={styles.quizButtons}>
        <button onClick={() => setIndex((i) => i - 1)} disabled={index === 0}>
          Previous
        </button>
        <button
          onClick={() => setIndex((i) => i + 1)}
          disabled={index === questions.length - 1}
        >
          Next
        </button>
        <button>Submit for Grading</button>
      </div>
    </div>
  );
}
