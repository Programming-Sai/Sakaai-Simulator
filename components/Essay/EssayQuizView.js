import styles from "./essayquizview.module.css";

export const EssayQuizView = () => {
  const showAnswer = false;
  const question = {
    type: "essay",
    question:
      "Describe the geographical and environmental characteristics of Mount Everest.",
    explanation:
      "Mount Everest, located in the Himalayas, is the highest mountain on Earth. Its geographical characteristics include extreme altitude, snow-capped peaks, and challenging climbing routes. Environmentally, it faces issues like climate change, melting glaciers, and human impact from tourism.",
    keywords: [
      "Himalayas",
      "altitude",
      "snow-capped",
      "climate change",
      "glaciers",
      "tourism impact",
    ],
  };

  return (
    <div className={styles.quizBox}>
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
