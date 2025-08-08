import React from "react";
import styles from "./page.module.css";
import { MCQQuizView } from "@/components/MCQ/MCQQuizView";
import { SATAQuizView } from "@/components/SATA/SATAQuizView";
import { TFQuizView } from "@/components/TF/TFQuizView";
import { FITBQuizView } from "@/components/FITB/FITBQuizView";
import { EssayQuizView } from "@/components/Essay/EssayQuizView";

export default function Quiz() {
  return (
    <div className={styles.quizContainer}>
      {/* <div>Timer</div> */}
      <div className={styles.quizProgress}>
        <p>Question 100 of 100 </p>
        <p style={{ opacity: 0.5 }}> | </p>
        <p> 1 point(s)</p>
      </div>

      <MCQQuizView />
      <EssayQuizView />
      <FITBQuizView />
      <TFQuizView />
      <SATAQuizView />
      {/* PAdding for view and cickable area expansion. */}
      <div className={styles.quizButtons}>
        <button>Previous</button>
        <button>Next</button>
        <button>Submit for Grading</button>
      </div>
    </div>
  );
}
