import React from "react";
import styles from "./mcqquizview.module.css";

export const MCQQuizView = ({
  index,
  quizId,
  question,
  userAnswer,
  showAnswer,
  onAnswer,
}) => {
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
    <div key={index} className={styles.quizBox}>
      <p>{question.question}</p>
      <div className={styles.choices}>
        {question.choices.map((choice, i) => (
          <span key={i}>
            <label style={getOptionStyle(choice)}>
              <input
                checked={
                  showAnswer
                    ? choice === question?.answer
                    : userAnswer === choice
                }
                type="radio"
                name={`question-${quizId}-${index}`}
                onChange={(e) => onAnswer && onAnswer(quizId, index, choice)}
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
