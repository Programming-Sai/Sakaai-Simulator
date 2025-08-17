import React from "react";
import styles from "./solvedsofar.module.css";

export default function SolvedSoFar({ questions, answers }) {
  console.log(answers, answers[0]);
  return (
    <div className={styles.ssfContainer}>
      <div>Explanation</div>
      <div>
        {questions &&
          questions?.map((question, idx) => (
            <span key={idx}>
              <p>{idx + 1}. </p>
              {console.log("Answers: ", answers[idx])}
              <input type="radio" checked={!!answers[0]} readOnly />
            </span>
          ))}
      </div>
    </div>
  );
}
