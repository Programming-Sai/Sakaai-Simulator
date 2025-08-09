import styles from "./essayquizview.module.css";

export const EssayQuizView = ({ key, question, userAnswer, showAnswer }) => {
  return (
    <div key={key} className={styles.quizBox}>
      <span>{question?.question}</span>
      <textarea
        className={styles.essayBox}
        placeholder="Your Answer"
        value={showAnswer ? question?.explanation : ""}
        readOnly={showAnswer}
      />
    </div>
  );
};
