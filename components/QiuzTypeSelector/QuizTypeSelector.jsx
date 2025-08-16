import React, { useEffect, useRef, useState } from "react";
import styles from "./quiztypeselector.module.css";

export const QuizTypeSelector = ({ value, onChange }) => {
  const TYPE_OPTIONS = [
    { key: "mcq", label: "Multiple Choice Questions (MCQ)" },
    { key: "sata", label: "Select All That Apply (SATA)" },
    { key: "fitb", label: "Fill In The Blanks (FITB)" },
    { key: "tf", label: "True or False (TF)" },
    { key: "essay", label: "Essay" },
  ];

  const [internal, setInternal] = useState([]);
  const selected = Array.isArray(value) ? value : internal;
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      // If opening, move focus into the container so :focus-within is true too
      if (next && rootRef.current) rootRef.current.focus();
      return next;
    });
  };
  useEffect(() => {
    console.log("Value: ", value);
  }, [selected]);

  // toggle a type in selected list
  const toggleType = (key) => {
    const exists = selected.includes(key);
    const next = exists
      ? selected.filter((k) => k !== key)
      : [...selected, key];
    if (typeof onChange === "function") onChange(next);
    if (!Array.isArray(value)) setInternal(next); // update internal only if uncontrolled
  };

  const removeType = (key) => {
    const next = selected.filter((k) => k !== key);
    if (typeof onChange === "function") onChange(next);
    if (!Array.isArray(value)) setInternal(next);
  };

  return (
    <div
      title="Quiz Type, eg. mcq, sata, fitb, tf, essay"
      className={`${styles.qtcontainer}`}
      tabIndex={0} // camelCase
      ref={rootRef}
    >
      <div
        className={styles.selected}
        role="button"
        tabIndex={-1}
        onClick={toggle}
        aria-expanded={open}
      >
        {selected &&
          selected.length > 0 &&
          selected.map((key, i) => {
            const opt = TYPE_OPTIONS.find((o) => o.key === key) || {
              key: key,
              label: key,
            };

            return (
              <span key={i}>
                <p>{opt.label}</p>
                <div onClick={() => removeType(opt.key)} aria-hidden={false}>
                  ✕
                </div>
              </span>
            );
          })}
        {selected.length < 1 && <p>Select Quiz Type</p>}
      </div>
      <div className={styles.options}>
        {TYPE_OPTIONS.map((option, i) => (
          <div key={i} onClick={() => toggleType(option.key)}>
            {option?.label}
          </div>
        ))}
      </div>
    </div>
  );
};
