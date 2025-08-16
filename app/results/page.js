"use client";
import React from "react";
import styles from "./page.module.css";
import ProgressCircle from "@/components/ProgressCircle/ProgressCircle";
import { MCQQuizView } from "@/components/MCQ/MCQQuizView";
import { SATAQuizView } from "@/components/SATA/SATAQuizView";
import { TFQuizView } from "@/components/TF/TFQuizView";
import { FITBQuizView } from "@/components/FITB/FITBQuizView";
import { EssayQuizView } from "@/components/Essay/EssayQuizView";
import { useTheme } from "@/context/ThemeContext";
import { useSearchParams } from "next/navigation";
import { useData } from "@/context/DataContext";

export default function Results() {
  const { theme } = useTheme();
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
  const questions = data?.quizzes[genId] || [];

  const answers = data?.answers?.[genId] || {};

  const currentFilter = "all";
  return (
    <div className={styles.resultContatiner}>
      <h2>Quiz Results</h2>
      <div className={styles.center}>
        <ProgressCircle
          textColor={theme === "dark" ? "white" : "black"}
          progress={70}
        />
      </div>

      <div className={styles.breakdowns}>
        <ProgressCircle
          textColor={theme === "dark" ? "white" : "black"}
          progress={70}
          size={80}
          strokeWidth={5}
          progressColor="red"
          text={"3/10"}
        />
        <ProgressCircle
          textColor={theme === "dark" ? "white" : "black"}
          progress={70}
          size={80}
          strokeWidth={5}
          progressColor="lightgreen"
          text={"7/10"}
        />
        <ProgressCircle
          textColor={theme === "dark" ? "white" : "black"}
          progress={50}
          size={80}
          strokeWidth={5}
          progressColor="gold"
          text={"5"}
        />
      </div>
      <div className={styles.resultsButtons}>
        <button>Retake Quiz</button>
        <button>View </button>
        <button>Back Home</button>
      </div>
      <div className={styles.resultFilterContainer}>
        <div
          className={
            styles.filter +
            " " +
            (currentFilter === "correct" ? styles.filterActive : "")
          }
        >
          Correct
        </div>
        <div
          className={
            styles.filter +
            " " +
            (currentFilter === "all" ? styles.filterActive : "")
          }
        >
          All
        </div>
        <div
          className={
            styles.filter +
            " " +
            (currentFilter === "wrong" ? styles.filterActive : "")
          }
        >
          Wrong
        </div>
      </div>
      <div className={styles.quizzes}>
        {questions?.map((quiz, i) => {
          const Renderer = questionMapping[quiz.type];
          if (!Renderer) return null;
          return (
            <div key={`${genId}-${i}`}>
              {Renderer(
                i,
                questions[i], // question object
                answers[i] ?? null, // userAnswer
                true, // showAnswer
                genId // quizId
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
