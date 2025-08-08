import React from "react";
import styles from "./sataquizview.module.css";

export const SATAQuizView = () => {
  const question = {
    type: "sata",
    question: "Which of the following are true about Mount Everest?",
    explanation:
      "Mount Everest is known for being the highest mountain above sea level, located in the Himalayas on the border between Nepal and Tibet, China. Climbing routes exist on both the Nepalese side and the Tibetan side.",
    choices: [
      "It is located entirely in Nepal.",
      "It is the highest mountain above sea level.",
      "The mountain has a climbing route from the Tibetan side.",
      "The mountain has a climbing route from the Tibetan side.",
      "It is considered the most difficult mountain to climb.",
    ],
    answer: [
      "It is the highest mountain above sea level.",
      "The mountain has a climbing route from the Tibetan side.",
    ],
  };
  return (
    <div className={styles.quizBox}>
      <p>{question?.question}</p>
      <div className={styles.choices}>
        {question?.choices.map((choice, i) => (
          <span key={i}>
            <label>
              <input type="checkbox" name={question?.type} /> &nbsp;&nbsp;&nbsp;
              {String.fromCharCode(65 + i)}. &nbsp;{choice}
            </label>
          </span>
        ))}
      </div>
      <span className={styles.reset}> Reset Selection </span>
    </div>
  );
};
