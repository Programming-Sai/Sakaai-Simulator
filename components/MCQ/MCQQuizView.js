import React from "react";
import styles from "./mcqquizview.module.css";

export const MCQQuizView = ({ key, question, userAnswer, showAnswer }) => {
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
      <p>{question.question}</p>
      <div className={styles.choices}>
        {question.choices.map((choice, i) => (
          <span key={i}>
            <label style={getOptionStyle(choice)}>
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
