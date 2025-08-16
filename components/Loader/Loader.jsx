import React from "react";
import styles from "./loader.module.css";
import { useData } from "@/context/DataContext";

export default function Loader() {
  const { isLoading } = useData();
  return (
    <div className={`${styles.container} ${isLoading && styles.active}`}>
      <div className={styles.loader}>
        <div>Please Wait...</div>
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 48 48"
            aria-hidden="true"
            role="img"
          >
            <title>Loading</title>
            {/* <!-- center = (24,24), orbit radius = 10, 8 dots around the circle --> */}
            <circle cx="34.000" cy="24.000" r="2.6" fill="currentColor">
              <animate
                attributeName="opacity"
                values="0.25;1;0.25"
                dur="1s"
                repeatCount="indefinite"
                begin="0s"
              />
            </circle>
            <circle cx="31.071" cy="31.071" r="2.6" fill="currentColor">
              <animate
                attributeName="opacity"
                values="0.25;1;0.25"
                dur="1s"
                repeatCount="indefinite"
                begin="0.125s"
              />
            </circle>
            <circle cx="24.000" cy="34.000" r="2.6" fill="currentColor">
              <animate
                attributeName="opacity"
                values="0.25;1;0.25"
                dur="1s"
                repeatCount="indefinite"
                begin="0.25s"
              />
            </circle>
            <circle cx="16.929" cy="31.071" r="2.6" fill="currentColor">
              <animate
                attributeName="opacity"
                values="0.25;1;0.25"
                dur="1s"
                repeatCount="indefinite"
                begin="0.375s"
              />
            </circle>
            <circle cx="14.000" cy="24.000" r="2.6" fill="currentColor">
              <animate
                attributeName="opacity"
                values="0.25;1;0.25"
                dur="1s"
                repeatCount="indefinite"
                begin="0.5s"
              />
            </circle>
            <circle cx="16.929" cy="16.929" r="2.6" fill="currentColor">
              <animate
                attributeName="opacity"
                values="0.25;1;0.25"
                dur="1s"
                repeatCount="indefinite"
                begin="0.625s"
              />
            </circle>
            <circle cx="24.000" cy="14.000" r="2.6" fill="currentColor">
              <animate
                attributeName="opacity"
                values="0.25;1;0.25"
                dur="1s"
                repeatCount="indefinite"
                begin="0.75s"
              />
            </circle>
            <circle cx="31.071" cy="16.929" r="2.6" fill="currentColor">
              <animate
                attributeName="opacity"
                values="0.25;1;0.25"
                dur="1s"
                repeatCount="indefinite"
                begin="0.875s"
              />
            </circle>
          </svg>
        </div>
      </div>
    </div>
  );
}
