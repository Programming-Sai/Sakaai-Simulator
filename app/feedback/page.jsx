import React from "react";
import styles from "./page.module.css";
import FeedbackComponent from "@/components/FeedbackComponent/FeedbackComponent";

export default function Feedback() {
  return (
    <div className={styles.feedbackContainer}>
      <FeedbackComponent width={70} right={14.5} />
    </div>
  );
}
