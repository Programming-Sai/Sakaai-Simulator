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

export default function Results() {
  const { theme } = useTheme();

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
  const questions = [
    {
      type: "essay",
      question:
        "Describe the geographical and environmental characteristics of Mount Everest.",
      explanation:
        "Mount Everest, located in the Himalayas, is the highest mountain on Earth. Its geographical characteristics include extreme altitude, snow-capped peaks, and challenging climbing routes. Environmentally, it faces issues like climate change, melting glaciers, and human impact from tourism.",
      keywords: [
        "Himalayas",
        "altitude",
        "snow-capped",
        "climate change",
        "glaciers",
        "tourism impact",
      ],
    },
    {
      type: "fitb",
      question:
        "Mount Everest is located in the _______________________ mountain range.",
      explanation:
        "Mount Everest is situated in the Himalayan mountain range in Asia.",
      answer: "Himalayan",
    },
    {
      type: "mcq",
      question: "What is the primary goal of creating content on LinkedIn?",
      explanation:
        "The primary goal is to engage the audience and build professional connections.",
      choices: [
        "To drive website traffic",
        "To engage the audience and build professional connections",
        "To increase personal followers",
        "To share personal achievements",
      ],
      answer: "To engage the audience and build professional connections",
    },
    {
      type: "sata",
      question: "Which of the following are true about Mount Everest?",
      explanation:
        "Mount Everest is known for being the highest mountain above sea level, located in the Himalayas on the border between Nepal and Tibet, China. Climbing routes exist on both the Nepalese side and the Tibetan side.",
      choices: [
        "It is located entirely in Nepal.",
        "It is the highest mountain above sea level.",
        "The mountain has a climbing route from the Tibetan side.",
        "It is considered the most difficult mountain to climb.",
      ],
      answer: [
        "It is the highest mountain above sea level.",
        "The mountain has a climbing route from the Tibetan side.",
      ],
    },
    {
      type: "tf",
      question: "Mount Everest is the highest mountain in the world.",
      explanation:
        "Mount Everest, located in the Himalayas on the border between Nepal and Tibet, China, is widely recognized as the highest mountain in the world, with a peak at 8,848.86 meters (29,031.7 feet) above sea level.",
      answer: true,
    },
  ];
  const userAnswers = [
    {
      index: 0,
      answer: "High altitude, snow-capped peaks, melting glaciers", // essay (string)
    },
    {
      index: 1,
      answer: "Himalayan", // fitb (string)
    },
    {
      index: 2,
      answer: "To drive website traffic", // mcq (string)
    },
    {
      index: 3,
      answer: [
        "It is the highest mountain above sea level.",
        "The mountain has a climbing route from the Tibetan side.",
        "It is considered the most difficult mountain to climb.",
      ], // sata (array of strings)
    },
    {
      index: 4,
      answer: false, // tf (boolean)
    },
  ];

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
        {questions?.map((quiz, i) =>
          questionMapping[quiz?.type](i, quiz, userAnswers[i], true)
        )}
      </div>
    </div>
  );
}
