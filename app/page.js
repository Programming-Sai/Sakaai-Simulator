// app/page.js
import React from "react";
import styles from "./page.module.css";
import { QuizTypeSelector } from "@/components/QiuzTypeSelector/QuizTypeSelector";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.setupContainer}>
      {/* <Link href="/feedback">Hello</Link> */}
      <form className={styles.params}>
        <input
          title="Topic, eg. Computer Architecture"
          className={styles.topic}
          type="text"
          placeholder="Topic"
        />
        <QuizTypeSelector />
        <input
          type="number"
          max={30}
          min={1}
          className={styles.number}
          placeholder="Number of Questions"
          title="Number of Question, max: 30"
        />
        <span className={styles.error}>
          Values Must Be Between <b>1</b> and <b>30</b>
        </span>
        <input
          type="number"
          max={8}
          min={4}
          className={styles.number}
          placeholder="Number of Possible Answers"
          title="Number of Possible Answers, max: 8"
        />
        <span className={styles.error}>
          Values Must Be Between <b>4</b> and <b>8</b>
        </span>
        <div className={styles.checkBox}>
          <label title="Should the Answers be included?">
            <input className={styles.check} checked={true} type="checkbox" />
            Answers Required
          </label>
          <label title="Should the Explanations be included?">
            <input className={styles.check} checked={true} type="checkbox" />
            Explanation Required
          </label>
        </div>
      </form>

      <textarea
        className={styles.generate}
        placeholder="eg. Generate some questions on Linked List ..."
      />
      <button className={styles.generateButton} title="Generate Quiz?">
        🡡
      </button>
    </div>
  );
}
