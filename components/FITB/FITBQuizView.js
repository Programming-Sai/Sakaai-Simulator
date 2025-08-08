import styles from "./fitbquizview.module.css";

export const FITBQuizView = () => {
  const question = {
    type: "fitb",
    question:
      "Mount Everest is located in the _______________________ mountain range.",
    explanation:
      "Mount Everest is situated in the Himalayan mountain range in Asia.",
    answer: "Himalayan",
  };

  const questionParts = question?.question.split(/_{3,}/);

  return (
    <div className={styles.quizBox}>
      <span>{questionParts[0]}</span>&nbsp;
      <input
        placeholder="| "
        type="text"
        className={styles.fitbInput}
        name={question?.type}
      />
      &nbsp;<span>{questionParts[1]}</span>
    </div>
  );
};
