import styles from "./essayquizview.module.css";

export const EssayQuizView = ({
  index,
  quizId,
  question,
  userAnswer,
  showAnswer,
  onAnswer,
}) => {
  return (
    <div key={index} className={styles.quizBox}>
      <span>{question?.question}</span>
      <textarea
        className={styles.essayBox}
        placeholder="Your Answer"
        value={showAnswer ? question?.answer : userAnswer ?? ""}
        readOnly={showAnswer}
        onChange={(e) => onAnswer && onAnswer(quizId, index, e.target.value)}
      />
    </div>
  );
};
