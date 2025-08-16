import React from "react";
import styles from "./tfquizview.module.css";

export const TFQuizView = ({
  index,
  quizId,
  question,
  userAnswer,
  showAnswer,
  onAnswer,
}) => {
  const isUserCorrect = userAnswer === question?.answer;

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
    if (optionValue === userAnswer && !isUserCorrect) {
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
    <div key={index} className={styles.quizBox}>
      <p>{question?.question}</p>
      <div className={styles.choices}>
        <span>
          <label style={getOptionStyle(true)}>
            <input
              checked={
                showAnswer ? question?.answer === true : userAnswer === true
              }
              type="radio"
              name={`question-${quizId}-${index}`}
              onChange={(e) => onAnswer && onAnswer(quizId, index, true)}
            />
            &nbsp;&nbsp;&nbsp; A. &nbsp;True
          </label>
        </span>

        <span>
          <label style={getOptionStyle(false)}>
            <input
              checked={
                showAnswer ? question?.answer === false : userAnswer === false
              }
              type="radio"
              name={`question-${quizId}-${index}`}
              onChange={(e) => onAnswer && onAnswer(quizId, index, false)}
            />
            &nbsp;&nbsp;&nbsp; B. &nbsp;False
          </label>
        </span>
      </div>
      {showAnswer ? (
        <span> {question?.explanation} </span>
      ) : (
        <span
          className={styles.reset}
          onClick={() => onAnswer && onAnswer(quizId, index, null)}
        >
          {" "}
          Reset Selection{" "}
        </span>
      )}
    </div>
  );
};
