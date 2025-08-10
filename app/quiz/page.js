import React from "react";
import styles from "./page.module.css";
import { MCQQuizView } from "@/components/MCQ/MCQQuizView";
import { SATAQuizView } from "@/components/SATA/SATAQuizView";
import { TFQuizView } from "@/components/TF/TFQuizView";
import { FITBQuizView } from "@/components/FITB/FITBQuizView";
import { EssayQuizView } from "@/components/Essay/EssayQuizView";

export default function Quiz() {
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

  return (
    <div className={styles.quizContainer}>
      {/* <div>Timer</div> */}
      <div className={styles.quizProgress}>
        <p>Question 100 of 100 </p>
        <p style={{ opacity: 0.5 }}> | </p>
        <p> 1 point(s)</p>
      </div>

      {/* <MCQQuizView />
      <EssayQuizView />
      <FITBQuizView />
      <TFQuizView />
      <SATAQuizView /> */}

      {questions?.map((quiz, i) =>
        questionMapping[quiz?.type](i, quiz, null, false)
      )}
      {/* Padding for view and cickable area expansion. */}
      <div className={styles.quizButtons}>
        <button>Previous</button>
        <button>Next</button>
        <button>Submit for Grading</button>
      </div>
    </div>
  );
}
