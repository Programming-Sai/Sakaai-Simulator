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
        // value={userAnswer ?? ""}
        value={showAnswer ? question?.explanation : userAnswer ?? ""}
        readOnly={showAnswer}
        onChange={(e) =>
          !showAnswer && onAnswer && onAnswer(quizId, index, e.target.value)
        }
      />
      <br />
      <br />
      <br />
      {showAnswer && (
        <span>
          <b>Your Response: </b>
          {userAnswer}{" "}
        </span>
      )}
    </div>
  );
};
