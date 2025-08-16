import React from "react";
import styles from "./sataquizview.module.css";

export const SATAQuizView = ({
  index,
  quizId,
  question,
  userAnswer,
  showAnswer,
  onAnswer,
}) => {
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
    <div key={index} className={styles.quizBox}>
      <p>{question?.question}</p>
      <div className={styles.choices}>
        {question?.choices.map((choice, i) => (
          <span key={i}>
            <label style={getOptionStyle(choice)}>
              <input
                checked={
                  showAnswer
                    ? question?.answer?.includes(choice)
                    : userAnswer?.includes(choice)
                }
                type="checkbox"
                name={`question-${quizId}-${index}`}
                onChange={(e) =>
                  onAnswer && onAnswer(quizId, index, choice, { multi: true })
                }
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
        <span
          className={styles.reset}
          onClick={() => onAnswer && onAnswer(quizId, index, [])}
        >
          {" "}
          Reset Selection{" "}
        </span>
      )}
    </div>
  );
};
