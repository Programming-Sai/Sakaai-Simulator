import React from "react";
import styles from "./tfquizview.module.css";

export const TFQuizView = () => {
  const showAnswer = false;

  const question = {
    type: "tf",
    question: "Mount Everest is the highest mountain in the world.",
    explanation:
      "Mount Everest, located in the Himalayas on the border between Nepal and Tibet, China, is widely recognized as the highest mountain in the world, with a peak at 8,848.86 meters (29,031.7 feet) above sea level.",
    answer: true,
  };
  return (
    <div className={styles.quizBox}>
      <p>{question?.question}</p>
      <div className={styles.choices}>
        <span>
          <label>
            <input
              name={question?.type}
              type="radio"
              checked={showAnswer && question?.answer === true}
            />
            &nbsp;&nbsp;&nbsp; A. &nbsp;True
          </label>
        </span>

        <span>
          <label>
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
