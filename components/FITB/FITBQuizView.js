import styles from "./fitbquizview.module.css";

export const FITBQuizView = ({ key, question, showAnswer }) => {
  const questionParts = question?.question.split(/_{3,}/);

  return (
    <div key={key} className={styles.quizBox}>
      <span>{questionParts[0]}</span>&nbsp;
      <input
        placeholder="| "
        type="text"
        className={styles.fitbInput}
        name={question?.type}
        value={showAnswer ? question?.answer : ""}
        readOnly={showAnswer}
      />
      &nbsp;<span>{questionParts[1]}</span>
      <br />
      <br />
      <br />
      {showAnswer && <span> {question?.explanation} </span>}
    </div>
  );
};
