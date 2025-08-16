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
  const { data } = useData();
  const searchParams = useSearchParams();
  const genId = searchParams.get("genId");
  const questionMapping = {
    fitb: (key, question, userAnswer, showAnswer) => (
      <FITBQuizView
        key={key}
        question={question}
        userAnswer={userAnswer}
        showAnswer={showAnswer}
      />
    ),
    mcq: (key, question, userAnswer, showAnswer) => (
      <MCQQuizView
        key={key}
        question={question}
        userAnswer={userAnswer}
        showAnswer={showAnswer}
      />
    ),
    sata: (key, question, userAnswer, showAnswer) => (
      <SATAQuizView
        key={key}
        question={question}
        userAnswer={userAnswer}
        showAnswer={showAnswer}
      />
    ),
    tf: (key, question, userAnswer, showAnswer) => (
      <TFQuizView
        key={key}
        question={question}
        userAnswer={userAnswer}
        showAnswer={showAnswer}
      />
    ),
    essay: (key, question, userAnswer, showAnswer) => (
      <EssayQuizView
        key={key}
        question={question}
        userAnswer={userAnswer}
        showAnswer={showAnswer}
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
          questions[index],
          null,
          false
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
