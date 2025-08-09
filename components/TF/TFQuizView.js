import React from "react";
import styles from "./tfquizview.module.css";

export const TFQuizView = ({ key, question, userAnswer, showAnswer }) => {
  const isUserCorrect = userAnswer?.answer === question?.answer;

  const getOptionStyle = (optionValue) => {
    if (!showAnswer) return {};
    if (optionValue === question?.answer) {
      // Correct answer → green
      return {
        backgroundColor: "rgba(0,255,0,0.2)",
        padding: 5,
        borderRadius: 5,
      };
    }
    if (optionValue === userAnswer?.answer && !isUserCorrect) {
      // User's wrong choice → red
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
        <span>
          <label style={getOptionStyle(true)}>
            <input
              name={question?.type}
              type="radio"
              checked={showAnswer && question?.answer === true}
            />
            &nbsp;&nbsp;&nbsp; A. &nbsp;True
          </label>
        </span>

        <span>
          <label style={getOptionStyle(false)}>
            <input
              name={question?.type}
              type="radio"
              checked={showAnswer && question?.answer === false}
            />
            &nbsp;&nbsp;&nbsp; B. &nbsp;False
          </label>
        </span>
      </div>
      {showAnswer ? (
        <span> {question?.explanation} </span>
      ) : (
        <span className={styles.reset}> Reset Selection </span>
      )}
    </div>
  );
};
