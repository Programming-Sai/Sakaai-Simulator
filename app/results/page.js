"use client";
import React, { useMemo, useState } from "react";
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
import Link from "next/link";

export default function Results() {
  const { theme } = useTheme();
  const { data, setAnswer, resetAnswers } = useData();
  const searchParams = useSearchParams();
  const genId = searchParams.get("genId");
  const [currentFilter, setCurrentFilter] = useState("all");

  const questionMapping = {
    fitb: (key, question, userAnswer, showAnswer, quizId) => (
      <FITBQuizView
        key={`${quizId}-${key}`}
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
        key={`${quizId}-${key}`}
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
        key={`${quizId}-${key}`}
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
        key={`${quizId}-${key}`}
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
        key={`${quizId}-${key}`}
        index={key}
        quizId={quizId}
        question={question}
        userAnswer={userAnswer}
        showAnswer={showAnswer}
        onAnswer={setAnswer}
      />
    ),
  };

  const questions = data?.quizzes?.[genId] || {};
  const answers = data?.answers?.[genId] || {};

  // helpers --------------------------------------------------------
  const normalize = (u) => {
    // user answer could be primitive or { answer: ... }
    if (u === null || u === undefined) return null;
    return u && typeof u === "object" && "answer" in u ? u.answer : u;
  };

  // unordered array equality (treat arrays as sets)
  const arraysEqualUnordered = (a, b) => {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    const sa = new Set(a.map((x) => String(x).trim().toLowerCase()));
    return b.every((x) => sa.has(String(x).trim().toLowerCase()));
  };

  // determine correctness for a single question
  const isCorrectFor = (question, userRaw) => {
    const user = normalize(userRaw);
    if (user == null || user === "") return null; // unanswered

    const qType = (question?.type || "").toLowerCase();
    const correct = question?.answer;

    if (qType === "sata") {
      // expect arrays. if backend sometimes gives string, normalize to array with single element
      const corr = Array.isArray(correct) ? correct : [correct];
      const usr = Array.isArray(user) ? user : [user];
      return arraysEqualUnordered(corr, usr);
    }

    if (qType === "tf") {
      const corr =
        typeof correct === "string" ? correct === "true" : Boolean(correct);
      const usr = typeof user === "string" ? user === "true" : Boolean(user);
      return usr === corr;
    }

    // mcq / fitb: compare strings case-insensitive
    if (qType === "mcq" || qType === "fitb") {
      const corr = String(correct ?? "")
        .trim()
        .toLowerCase();
      const usr = String(user ?? "")
        .trim()
        .toLowerCase();
      return corr !== "" && usr === corr;
    }

    // essay: not auto-graded unless keywords exist
    if (qType === "essay") {
      const kws = Array.isArray(question?.keywords) ? question.keywords : [];
      if (!kws.length) return null;
      const txt = String(user ?? "").toLowerCase();
      return kws.every((kw) => txt.includes(String(kw).toLowerCase()));
    }

    // fallback strict equality
    return String(user) === String(correct);
  };

  // memoized computation of per-question results and counts
  const { perQuestion, counts } = useMemo(() => {
    const pq = questions.map((q, i) => {
      const user = answers[i];
      const correct = isCorrectFor(q, user); // true | false | null
      return { index: i, question: q, user, correct };
    });

    const correctCount = pq.filter((p) => p.correct === true).length;
    const wrongCount = pq.filter((p) => p.correct === false).length;
    const unansweredCount = pq.filter((p) => p.correct === null).length;

    return {
      perQuestion: pq,
      counts: {
        total: questions.length,
        correctCount,
        wrongCount,
        unansweredCount,
      },
    };
  }, [questions, answers]);

  // filtered list
  const filtered = useMemo(() => {
    if (currentFilter === "all") return perQuestion;
    if (currentFilter === "correct")
      return perQuestion.filter((p) => p.correct === true);
    if (currentFilter === "wrong")
      return perQuestion.filter((p) => p.correct === false);
    if (currentFilter === "unanswered")
      return perQuestion.filter((p) => p.correct === null);
    return perQuestion;
  }, [perQuestion, currentFilter]);

  // safe percent calc
  const percentCorrect =
    counts.total > 0
      ? Math.round((counts.correctCount / counts.total) * 100)
      : 0;
  const percentWrong =
    counts.total > 0 ? Math.round((counts.wrongCount / counts.total) * 100) : 0;

  // render ---------------------------------------------------------
  return (
    <div className={styles.resultContatiner}>
      <h2>Quiz Results</h2>

      <div className={styles.center}>
        <ProgressCircle
          textColor={theme === "dark" ? "white" : "black"}
          progress={percentCorrect}
          progressColor={percentCorrect >= 50 ? "lightgreen" : "red"}
        />
      </div>

      <div className={styles.breakdowns}>
        <ProgressCircle
          textColor={theme === "dark" ? "white" : "black"}
          progress={percentWrong}
          size={80}
          strokeWidth={5}
          progressColor="red"
          text={`${counts.wrongCount}/${counts.total}`}
        />
        <ProgressCircle
          textColor={theme === "dark" ? "white" : "black"}
          progress={percentCorrect}
          size={80}
          strokeWidth={5}
          progressColor="lightgreen"
          text={`${counts.correctCount}/${counts.total}`}
        />
        <ProgressCircle
          textColor={theme === "dark" ? "white" : "black"}
          progress={
            counts.total
              ? Math.round((counts.unansweredCount / counts.total) * 100)
              : 0
          }
          size={80}
          strokeWidth={5}
          progressColor="grey"
          text={`${counts.unansweredCount}`}
        />
      </div>

      <div className={styles.resultsButtons}>
        <button>
          <Link
            onClick={() => resetAnswers(genId)}
            href={`/quiz?genId=${encodeURIComponent(genId)}`}
          >
            Retake Quiz
          </Link>
        </button>

        <button>
          <Link href="/">Back Home</Link>
        </button>
      </div>

      <div className={styles.resultFilterContainer}>
        {[
          ["all", "All"],
          ["correct", "Correct"],
          ["wrong", "Wrong"],
          ["unanswered", "Unanswered"],
        ].map(([id, label]) => (
          <div
            key={id}
            onClick={() => setCurrentFilter(id)}
            className={`${styles.filter} ${
              currentFilter === id ? styles.filterActive : ""
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      <div className={styles.quizzes}>
        {filtered.map((p) => {
          const Renderer = questionMapping[p.question.type];
          if (!Renderer) return null;
          return (
            <div key={`${genId}-${p.index}`} style={{ marginBottom: 12 }}>
              {Renderer(
                p.index,
                p.question,
                // pass the raw stored answer (child components are tolerant)
                p.user ?? null,
                true,
                genId
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
