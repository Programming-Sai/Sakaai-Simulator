import React, { useState } from "react";
import styles from "./solvedsofar.module.css";

/**
 * SolvedSoFar
 * props:
 *  - questions: array of question objects
 *  - answers: object mapping questionIndex -> answer (can be primitive or array)
 */
export default function SolvedSoFar({
  questions,
  answers,
  setIndex,
  allowGoto,
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.ssfContainer}>
      <h4
        onClick={() => setOpen((prev) => !prev)}
        className={styles.questionProgressButton}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M7 10l5 5 5-5H7z" />
        </svg>
        Question Progress
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M7 10l5 5 5-5H7z" />
        </svg>
      </h4>

      <div className={`${styles.ssfBox} ${open && styles.active}`}>
        <div className={styles.progressData}>
          <h3>Question Progress</h3>
          <span>
            <input type="radio" checked={false} readOnly />
            <p>Unanswered Question</p>
          </span>
          <span>
            <input type="radio" checked={true} readOnly />
            <p>Answered Question</p>
          </span>
          <p>
            {questions?.length} Question{questions?.length > 1 && "s"}
          </p>
        </div>
        <div className={styles.solvedBox}>
          {questions &&
            questions?.map((question, idx) => (
              <div
                key={idx}
                className={styles.solved}
                onClick={allowGoto ? () => setIndex(idx) : () => {}}
                style={allowGoto ? { cursor: "pointer" } : {}}
              >
                <p>{idx + 1}</p>
                <input
                  type="radio"
                  checked={answers[idx] !== null && answers[idx] !== undefined}
                  readOnly
                  style={allowGoto ? { cursor: "pointer" } : {}}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
1;
