import React from "react";
import styles from "./mcqquizview.module.css";

export const MCQQuizView = () => {
  const showAnswer = false;

  const question = {
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
  };
  return (
    <div className={styles.quizBox}>
      <p>{question.question}</p>
      <div className={styles.choices}>
        {question.choices.map((choice, i) => (
          <span key={i}>
            <label>
              <input
                checked={showAnswer && choice === question?.answer}
                type="radio"
                name={question?.type}
              />{" "}
              {String.fromCharCode(65 + i)}. &nbsp;
              {choice}
            </label>
          </span>
        ))}
      </div>
      {showAnswer ? (
        <span> {question?.explanation} </span>
      ) : (
        <span className={styles.reset}> Reset Selection </span>
      )}
    </div>
  );
};
