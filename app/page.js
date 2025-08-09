// app/page.js
import React from "react";
import styles from "./page.module.css";
import { QuizTypeSelector } from "@/components/QiuzTypeSelector/QuizTypeSelector";

export default function Home() {
  return (
    <div className={styles.setupContainer}>
      <form className={styles.params}>
        <input
          className={styles.topic}
          type="text"
          placeholder="eg. Data Structures & Algorithms"
        />
        <QuizTypeSelector />
        <input
          type="number"
          max={30}
          min={1}
          className={styles.number}
          placeholder="Number of Questions"
        />
        <input
          type="number"
          max={8}
          min={4}
          className={styles.number}
          placeholder="Number of Possible Answers"
        />
        <div className={styles.checkBox}>
          <label>
            <input className={styles.check} checked={true} type="checkbox" />
            Answers Required
          </label>
          <label>
            <input className={styles.check} checked={true} type="checkbox" />
            Explanation Required
          </label>
        </div>
      </form>

      <textarea
        className={styles.generate}
        placeholder="eg. Generate some questions on Linked List ..."
      />
    </div>
  );
}
