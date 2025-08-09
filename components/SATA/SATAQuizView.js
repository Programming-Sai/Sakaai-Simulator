import React from "react";
import styles from "./sataquizview.module.css";

export const SATAQuizView = ({ key, question, userAnswer, showAnswer }) => {
  const getOptionStyle = (optionValue) => {
    if (!showAnswer) return {};

    const isCorrect = question?.answer.includes(optionValue);
    const isUserChoice = userAnswer?.answer.includes(optionValue);

    if (isCorrect) {
      // Always highlight correct answers green
      return {
        backgroundColor: "rgba(0,255,0,0.2)",
        padding: 5,
        borderRadius: 5,
      };
    }

    if (!isCorrect && isUserChoice) {
      // Highlight user's wrong choices red
      return {
        backgroundColor: "rgba(255,0,0,0.2)",
        padding: 5,
        borderRadius: 5,
      };
    }

    return {};
  };
  return (
    <div key={key} className={styles.quizBox}>
      <p>{question?.question}</p>
      <div className={styles.choices}>
        {question?.choices.map((choice, i) => (
          <span key={i}>
            <label style={getOptionStyle(choice)}>
              <input
                type="checkbox"
                name={question?.type}
                checked={showAnswer && question?.answer.includes(choice)}
              />{" "}
              &nbsp;&nbsp;&nbsp;
              {String.fromCharCode(65 + i)}. &nbsp;{choice}
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
