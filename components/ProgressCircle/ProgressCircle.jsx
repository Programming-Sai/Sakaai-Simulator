// components/ProgressCircle.jsx
import React from "react";
import styles from "./progresscircle.module.css";

export default function ProgressCircle({
  progress = 0, // percentage (0-100)
  size = 120,
  strokeWidth = 10,
  trackColor = "#ddd",
  progressColor = "tomato",
  textColor = "white",
  text = null, // custom text, defaults to progress + "%"
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg className={styles.circle} width={size} height={size}>
      {/* Background track */}
      <circle
        className={styles.bg}
        stroke={trackColor}
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      {/* Progress arc */}
      <circle
        className={styles.progress}
        stroke={progressColor}
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      {/* Center text */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize={size * 0.18} // scales with size
        fill={textColor}
        className={styles.text}
      >
        {text ?? `${progress}%`}
      </text>
    </svg>
  );
}
