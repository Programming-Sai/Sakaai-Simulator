import styles from "./fitbquizview.module.css";

export const FITBQuizView = ({
  index,
  quizId,
  question,
  userAnswer,
  showAnswer,
  onAnswer,
}) => {
  const text = question?.question ?? "";
  const questionParts = text.split(/_{3,}/);

  return (
    <div key={index} className={styles.quizBox}>
      <span>{questionParts[0]}</span>&nbsp;
      <input
        placeholder="| "
        type="text"
        className={styles.fitbInput}
        name={question?.type}
        value={showAnswer ? question?.answer : userAnswer ?? ""}
        readOnly={showAnswer}
        onChange={(e) =>
          !showAnswer && onAnswer && onAnswer(quizId, index, e.target.value)
        }
      />
      &nbsp;<span>{questionParts[1]}</span>
      <br />
      <br />
      <br />
      {showAnswer && <span> {question?.explanation} </span>}
    </div>
  );
};
