import React from "react";
import styles from "./quiztypeselector.module.css";

export const QuizTypeSelector = () => {
  return (
    <div
      title="Quiz Type, eg. mcq, sata, fitb, tf, essay"
      className={styles.qtcontainer}
    >
      <div className={styles.selected}>
        {/* <span>
          <p>Eassy</p>
          <div>✕</div>
        </span>
        <span>
          <p>True or False</p>
          <div>✕</div>
        </span>
        <span>
          <p>Fill in the Blanks</p>
          <div>✕</div>
        </span>
        <span>
          <p>Multiple Choice Questions</p>
          <div>✕</div>
        </span>
        <span>
          <p>Select All That Apply</p>
          <div>✕</div>
        </span> */}
        <p>Select Quiz Type</p>
      </div>
      {/* <div className={styles.options}>
        <div>Multiple Choice Questions (MCQs)</div>
        <div>Select All That Apply (SATA)</div>
        <div>Fill In The Blanks (FITB)</div>
        <div>True or False (TF)</div>
        <div>Eassay</div>
      </div> */}
    </div>
  );
};
