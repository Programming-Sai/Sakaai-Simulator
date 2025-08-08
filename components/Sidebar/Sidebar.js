// components/Sidebar.js
"use client";
import { useState } from "react";
import styles from "./sidebar.module.css";

const quizzes = [
  [
    {
      type: "mcq",
      question: "What is the primary goal of creating content on LinkedIn?",
      explanation:
        "The primary goal is to engage the audience and build professional connections.",
      choices: [
        "To drive website traffic",
        "To engage the audience and build professional connections",
        "To increase personal followers",
        "To share personal achievements",
      ],
      answer: "To engage the audience and build professional connections",
    },
    {
      type: "mcq",
      question:
        "Which of the following is a best practice for LinkedIn content creation?",
      explanation:
        "Posting consistently is key to maintaining audience engagement.",
      choices: [
        "Posting sporadically",
        "Posting consistently",
        "Focusing solely on promotional content",
        "Ignoring audience engagement",
      ],
      answer: "Posting consistently",
    },
    {
      type: "mcq",
      question: "What type of content performs well on LinkedIn?",
      explanation:
        "Professional insights and industry news are highly engaging.",
      choices: [
        "Personal stories unrelated to profession",
        "Professional insights and industry news",
        "Overly promotional content",
        "Unrelated news",
      ],
      answer: "Professional insights and industry news",
    },
    {
      type: "mcq",
      question: "How often should you post on LinkedIn to maintain visibility?",
      explanation: "Posting at least once a week helps maintain visibility.",
      choices: ["Daily", "At least once a week", "Monthly", "Quarterly"],
      answer: "At least once a week",
    },
    {
      type: "mcq",
      question:
        "Why is it important to engage with comments on your LinkedIn posts?",
      explanation:
        "Engaging with comments builds relationships and fosters community.",
      choices: [
        "To argue with critics",
        "To ignore negative feedback",
        "To build relationships and foster community",
        "To promote other content",
      ],
      answer: "To build relationships and foster community",
    },
  ],
  [
    {
      type: "sata",
      question: "Which of the following stories or media feature Jack Frost?",
      explanation:
        "Jack Frost appears in various forms of media, including the movie 'Jack Frost' (1998).",
      choices: [
        "The movie 'Jack Frost' (1998)",
        "The novel 'To Kill a Mockingbird'",
        "The folklore of many European cultures",
        "The Disney movie 'Frozen'",
      ],
      answer: [
        "The movie 'Jack Frost' (1998)",
        "The folklore of many European cultures",
      ],
    },
    {
      type: "tf",
      question:
        "Jack Frost is known for being a friendly character in all depictions.",
      explanation:
        "While often depicted as mischievous, Jack Frost is not always friendly in all stories.",
      answer: false,
    },
    {
      type: "sata",
      question: "What are some characteristics often attributed to Jack Frost?",
      explanation:
        "Jack Frost is often seen as mischievous and associated with cold weather.",
      choices: ["Mischievous", "Benevolent", "Cold", "Hot"],
      answer: ["Mischievous", "Cold"],
    },
    {
      type: "tf",
      question: "Jack Frost is a modern character with no roots in folklore.",
      explanation:
        "Jack Frost has roots in traditional folklore, especially in European cultures.",
      answer: false,
    },
    {
      type: "sata",
      question: "In which contexts is Jack Frost commonly referenced?",
      explanation:
        "Jack Frost is commonly referenced in winter contexts and folklore.",
      choices: [
        "Winter stories",
        "Summer tales",
        "Folklore",
        "Historical accounts",
      ],
      answer: ["Winter stories", "Folklore"],
    },
  ],
  [
    {
      type: "tf",
      question: "Isaac Newton invented the reflecting telescope.",
      explanation:
        "Newton built the first practical reflecting telescope in 1668.",
      answer: true,
    },
    {
      type: "sata",
      question: "Which contributions are attributed to Isaac Newton?",
      explanation:
        "Newton's major contributions include his laws of motion and work on calculus.",
      choices: [
        "Development of Calculus",
        "Discovery of X-Rays",
        "Laws of Motion",
        "Theory of Evolution",
      ],
      answer: ["Development of Calculus", "Laws of Motion"],
    },
    {
      type: "tf",
      question:
        "Isaac Newton's work on calculus was published before his work on optics.",
      explanation:
        "Newton's work on calculus was not published until after his work on optics.",
      answer: false,
    },
    {
      type: "sata",
      question: "What are some of Newton's notable achievements?",
      explanation:
        "Newton is known for his work on the laws of motion, universal gravitation, and his contributions to the field of optics.",
      choices: [
        "Laws of Motion",
        "Universal Gravitation",
        "Opticks",
        "Principia Mathematica",
      ],
      answer: [
        "Laws of Motion",
        "Universal Gravitation",
        "Opticks",
        "Principia Mathematica",
      ],
    },
  ],
  [
    {
      type: "mcq",
      question: "What is the primary goal of creating content on LinkedIn?",
      explanation:
        "The primary goal is to engage the audience and build professional connections.",
      choices: [
        "To drive website traffic",
        "To engage the audience and build professional connections",
        "To increase personal followers",
        "To share personal achievements",
      ],
      answer: "To engage the audience and build professional connections",
    },
    {
      type: "mcq",
      question:
        "Which of the following is a best practice for LinkedIn content creation?",
      explanation:
        "Posting consistently is key to maintaining audience engagement.",
      choices: [
        "Posting sporadically",
        "Posting consistently",
        "Focusing solely on promotional content",
        "Ignoring audience engagement",
      ],
      answer: "Posting consistently",
    },
    {
      type: "mcq",
      question: "What type of content performs well on LinkedIn?",
      explanation:
        "Professional insights and industry news are highly engaging.",
      choices: [
        "Personal stories unrelated to profession",
        "Professional insights and industry news",
        "Overly promotional content",
        "Unrelated news",
      ],
      answer: "Professional insights and industry news",
    },
    {
      type: "mcq",
      question: "How often should you post on LinkedIn to maintain visibility?",
      explanation: "Posting at least once a week helps maintain visibility.",
      choices: ["Daily", "At least once a week", "Monthly", "Quarterly"],
      answer: "At least once a week",
    },
    {
      type: "mcq",
      question:
        "Why is it important to engage with comments on your LinkedIn posts?",
      explanation:
        "Engaging with comments builds relationships and fosters community.",
      choices: [
        "To argue with critics",
        "To ignore negative feedback",
        "To build relationships and foster community",
        "To promote other content",
      ],
      answer: "To build relationships and foster community",
    },
  ],
  [
    {
      type: "sata",
      question: "Which of the following stories or media feature Jack Frost?",
      explanation:
        "Jack Frost appears in various forms of media, including the movie 'Jack Frost' (1998).",
      choices: [
        "The movie 'Jack Frost' (1998)",
        "The novel 'To Kill a Mockingbird'",
        "The folklore of many European cultures",
        "The Disney movie 'Frozen'",
      ],
      answer: [
        "The movie 'Jack Frost' (1998)",
        "The folklore of many European cultures",
      ],
    },
    {
      type: "tf",
      question:
        "Jack Frost is known for being a friendly character in all depictions.",
      explanation:
        "While often depicted as mischievous, Jack Frost is not always friendly in all stories.",
      answer: false,
    },
    {
      type: "sata",
      question: "What are some characteristics often attributed to Jack Frost?",
      explanation:
        "Jack Frost is often seen as mischievous and associated with cold weather.",
      choices: ["Mischievous", "Benevolent", "Cold", "Hot"],
      answer: ["Mischievous", "Cold"],
    },
    {
      type: "tf",
      question: "Jack Frost is a modern character with no roots in folklore.",
      explanation:
        "Jack Frost has roots in traditional folklore, especially in European cultures.",
      answer: false,
    },
    {
      type: "sata",
      question: "In which contexts is Jack Frost commonly referenced?",
      explanation:
        "Jack Frost is commonly referenced in winter contexts and folklore.",
      choices: [
        "Winter stories",
        "Summer tales",
        "Folklore",
        "Historical accounts",
      ],
      answer: ["Winter stories", "Folklore"],
    },
  ],
  [
    {
      type: "tf",
      question: "Isaac Newton invented the reflecting telescope.",
      explanation:
        "Newton built the first practical reflecting telescope in 1668.",
      answer: true,
    },
    {
      type: "sata",
      question: "Which contributions are attributed to Isaac Newton?",
      explanation:
        "Newton's major contributions include his laws of motion and work on calculus.",
      choices: [
        "Development of Calculus",
        "Discovery of X-Rays",
        "Laws of Motion",
        "Theory of Evolution",
      ],
      answer: ["Development of Calculus", "Laws of Motion"],
    },
    {
      type: "tf",
      question:
        "Isaac Newton's work on calculus was published before his work on optics.",
      explanation:
        "Newton's work on calculus was not published until after his work on optics.",
      answer: false,
    },
    {
      type: "sata",
      question: "What are some of Newton's notable achievements?",
      explanation:
        "Newton is known for his work on the laws of motion, universal gravitation, and his contributions to the field of optics.",
      choices: [
        "Laws of Motion",
        "Universal Gravitation",
        "Opticks",
        "Principia Mathematica",
      ],
      answer: [
        "Laws of Motion",
        "Universal Gravitation",
        "Opticks",
        "Principia Mathematica",
      ],
    },
  ],
  [
    {
      type: "mcq",
      question: "What is the primary goal of creating content on LinkedIn?",
      explanation:
        "The primary goal is to engage the audience and build professional connections.",
      choices: [
        "To drive website traffic",
        "To engage the audience and build professional connections",
        "To increase personal followers",
        "To share personal achievements",
      ],
      answer: "To engage the audience and build professional connections",
    },
    {
      type: "mcq",
      question:
        "Which of the following is a best practice for LinkedIn content creation?",
      explanation:
        "Posting consistently is key to maintaining audience engagement.",
      choices: [
        "Posting sporadically",
        "Posting consistently",
        "Focusing solely on promotional content",
        "Ignoring audience engagement",
      ],
      answer: "Posting consistently",
    },
    {
      type: "mcq",
      question: "What type of content performs well on LinkedIn?",
      explanation:
        "Professional insights and industry news are highly engaging.",
      choices: [
        "Personal stories unrelated to profession",
        "Professional insights and industry news",
        "Overly promotional content",
        "Unrelated news",
      ],
      answer: "Professional insights and industry news",
    },
    {
      type: "mcq",
      question: "How often should you post on LinkedIn to maintain visibility?",
      explanation: "Posting at least once a week helps maintain visibility.",
      choices: ["Daily", "At least once a week", "Monthly", "Quarterly"],
      answer: "At least once a week",
    },
    {
      type: "mcq",
      question:
        "Why is it important to engage with comments on your LinkedIn posts?",
      explanation:
        "Engaging with comments builds relationships and fosters community.",
      choices: [
        "To argue with critics",
        "To ignore negative feedback",
        "To build relationships and foster community",
        "To promote other content",
      ],
      answer: "To build relationships and foster community",
    },
  ],
  [
    {
      type: "sata",
      question: "Which of the following stories or media feature Jack Frost?",
      explanation:
        "Jack Frost appears in various forms of media, including the movie 'Jack Frost' (1998).",
      choices: [
        "The movie 'Jack Frost' (1998)",
        "The novel 'To Kill a Mockingbird'",
        "The folklore of many European cultures",
        "The Disney movie 'Frozen'",
      ],
      answer: [
        "The movie 'Jack Frost' (1998)",
        "The folklore of many European cultures",
      ],
    },
    {
      type: "tf",
      question:
        "Jack Frost is known for being a friendly character in all depictions.",
      explanation:
        "While often depicted as mischievous, Jack Frost is not always friendly in all stories.",
      answer: false,
    },
    {
      type: "sata",
      question: "What are some characteristics often attributed to Jack Frost?",
      explanation:
        "Jack Frost is often seen as mischievous and associated with cold weather.",
      choices: ["Mischievous", "Benevolent", "Cold", "Hot"],
      answer: ["Mischievous", "Cold"],
    },
    {
      type: "tf",
      question: "Jack Frost is a modern character with no roots in folklore.",
      explanation:
        "Jack Frost has roots in traditional folklore, especially in European cultures.",
      answer: false,
    },
    {
      type: "sata",
      question: "In which contexts is Jack Frost commonly referenced?",
      explanation:
        "Jack Frost is commonly referenced in winter contexts and folklore.",
      choices: [
        "Winter stories",
        "Summer tales",
        "Folklore",
        "Historical accounts",
      ],
      answer: ["Winter stories", "Folklore"],
    },
  ],
  [
    {
      type: "tf",
      question: "Isaac Newton invented the reflecting telescope.",
      explanation:
        "Newton built the first practical reflecting telescope in 1668.",
      answer: true,
    },
    {
      type: "sata",
      question: "Which contributions are attributed to Isaac Newton?",
      explanation:
        "Newton's major contributions include his laws of motion and work on calculus.",
      choices: [
        "Development of Calculus",
        "Discovery of X-Rays",
        "Laws of Motion",
        "Theory of Evolution",
      ],
      answer: ["Development of Calculus", "Laws of Motion"],
    },
    {
      type: "tf",
      question:
        "Isaac Newton's work on calculus was published before his work on optics.",
      explanation:
        "Newton's work on calculus was not published until after his work on optics.",
      answer: false,
    },
    {
      type: "sata",
      question: "What are some of Newton's notable achievements?",
      explanation:
        "Newton is known for his work on the laws of motion, universal gravitation, and his contributions to the field of optics.",
      choices: [
        "Laws of Motion",
        "Universal Gravitation",
        "Opticks",
        "Principia Mathematica",
      ],
      answer: [
        "Laws of Motion",
        "Universal Gravitation",
        "Opticks",
        "Principia Mathematica",
      ],
    },
  ],
  [
    {
      type: "mcq",
      question: "What is the primary goal of creating content on LinkedIn?",
      explanation:
        "The primary goal is to engage the audience and build professional connections.",
      choices: [
        "To drive website traffic",
        "To engage the audience and build professional connections",
        "To increase personal followers",
        "To share personal achievements",
      ],
      answer: "To engage the audience and build professional connections",
    },
    {
      type: "mcq",
      question:
        "Which of the following is a best practice for LinkedIn content creation?",
      explanation:
        "Posting consistently is key to maintaining audience engagement.",
      choices: [
        "Posting sporadically",
        "Posting consistently",
        "Focusing solely on promotional content",
        "Ignoring audience engagement",
      ],
      answer: "Posting consistently",
    },
    {
      type: "mcq",
      question: "What type of content performs well on LinkedIn?",
      explanation:
        "Professional insights and industry news are highly engaging.",
      choices: [
        "Personal stories unrelated to profession",
        "Professional insights and industry news",
        "Overly promotional content",
        "Unrelated news",
      ],
      answer: "Professional insights and industry news",
    },
    {
      type: "mcq",
      question: "How often should you post on LinkedIn to maintain visibility?",
      explanation: "Posting at least once a week helps maintain visibility.",
      choices: ["Daily", "At least once a week", "Monthly", "Quarterly"],
      answer: "At least once a week",
    },
    {
      type: "mcq",
      question:
        "Why is it important to engage with comments on your LinkedIn posts?",
      explanation:
        "Engaging with comments builds relationships and fosters community.",
      choices: [
        "To argue with critics",
        "To ignore negative feedback",
        "To build relationships and foster community",
        "To promote other content",
      ],
      answer: "To build relationships and foster community",
    },
  ],
  [
    {
      type: "sata",
      question: "Which of the following stories or media feature Jack Frost?",
      explanation:
        "Jack Frost appears in various forms of media, including the movie 'Jack Frost' (1998).",
      choices: [
        "The movie 'Jack Frost' (1998)",
        "The novel 'To Kill a Mockingbird'",
        "The folklore of many European cultures",
        "The Disney movie 'Frozen'",
      ],
      answer: [
        "The movie 'Jack Frost' (1998)",
        "The folklore of many European cultures",
      ],
    },
    {
      type: "tf",
      question:
        "Jack Frost is known for being a friendly character in all depictions.",
      explanation:
        "While often depicted as mischievous, Jack Frost is not always friendly in all stories.",
      answer: false,
    },
    {
      type: "sata",
      question: "What are some characteristics often attributed to Jack Frost?",
      explanation:
        "Jack Frost is often seen as mischievous and associated with cold weather.",
      choices: ["Mischievous", "Benevolent", "Cold", "Hot"],
      answer: ["Mischievous", "Cold"],
    },
    {
      type: "tf",
      question: "Jack Frost is a modern character with no roots in folklore.",
      explanation:
        "Jack Frost has roots in traditional folklore, especially in European cultures.",
      answer: false,
    },
    {
      type: "sata",
      question: "In which contexts is Jack Frost commonly referenced?",
      explanation:
        "Jack Frost is commonly referenced in winter contexts and folklore.",
      choices: [
        "Winter stories",
        "Summer tales",
        "Folklore",
        "Historical accounts",
      ],
      answer: ["Winter stories", "Folklore"],
    },
  ],
  [
    {
      type: "tf",
      question: "Isaac Newton invented the reflecting telescope.",
      explanation:
        "Newton built the first practical reflecting telescope in 1668.",
      answer: true,
    },
    {
      type: "sata",
      question: "Which contributions are attributed to Isaac Newton?",
      explanation:
        "Newton's major contributions include his laws of motion and work on calculus.",
      choices: [
        "Development of Calculus",
        "Discovery of X-Rays",
        "Laws of Motion",
        "Theory of Evolution",
      ],
      answer: ["Development of Calculus", "Laws of Motion"],
    },
    {
      type: "tf",
      question:
        "Isaac Newton's work on calculus was published before his work on optics.",
      explanation:
        "Newton's work on calculus was not published until after his work on optics.",
      answer: false,
    },
    {
      type: "sata",
      question: "What are some of Newton's notable achievements?",
      explanation:
        "Newton is known for his work on the laws of motion, universal gravitation, and his contributions to the field of optics.",
      choices: [
        "Laws of Motion",
        "Universal Gravitation",
        "Opticks",
        "Principia Mathematica",
      ],
      answer: [
        "Laws of Motion",
        "Universal Gravitation",
        "Opticks",
        "Principia Mathematica",
      ],
    },
  ],
  [
    {
      type: "mcq",
      question: "What is the primary goal of creating content on LinkedIn?",
      explanation:
        "The primary goal is to engage the audience and build professional connections.",
      choices: [
        "To drive website traffic",
        "To engage the audience and build professional connections",
        "To increase personal followers",
        "To share personal achievements",
      ],
      answer: "To engage the audience and build professional connections",
    },
    {
      type: "mcq",
      question:
        "Which of the following is a best practice for LinkedIn content creation?",
      explanation:
        "Posting consistently is key to maintaining audience engagement.",
      choices: [
        "Posting sporadically",
        "Posting consistently",
        "Focusing solely on promotional content",
        "Ignoring audience engagement",
      ],
      answer: "Posting consistently",
    },
    {
      type: "mcq",
      question: "What type of content performs well on LinkedIn?",
      explanation:
        "Professional insights and industry news are highly engaging.",
      choices: [
        "Personal stories unrelated to profession",
        "Professional insights and industry news",
        "Overly promotional content",
        "Unrelated news",
      ],
      answer: "Professional insights and industry news",
    },
    {
      type: "mcq",
      question: "How often should you post on LinkedIn to maintain visibility?",
      explanation: "Posting at least once a week helps maintain visibility.",
      choices: ["Daily", "At least once a week", "Monthly", "Quarterly"],
      answer: "At least once a week",
    },
    {
      type: "mcq",
      question:
        "Why is it important to engage with comments on your LinkedIn posts?",
      explanation:
        "Engaging with comments builds relationships and fosters community.",
      choices: [
        "To argue with critics",
        "To ignore negative feedback",
        "To build relationships and foster community",
        "To promote other content",
      ],
      answer: "To build relationships and foster community",
    },
  ],
  [
    {
      type: "sata",
      question: "Which of the following stories or media feature Jack Frost?",
      explanation:
        "Jack Frost appears in various forms of media, including the movie 'Jack Frost' (1998).",
      choices: [
        "The movie 'Jack Frost' (1998)",
        "The novel 'To Kill a Mockingbird'",
        "The folklore of many European cultures",
        "The Disney movie 'Frozen'",
      ],
      answer: [
        "The movie 'Jack Frost' (1998)",
        "The folklore of many European cultures",
      ],
    },
    {
      type: "tf",
      question:
        "Jack Frost is known for being a friendly character in all depictions.",
      explanation:
        "While often depicted as mischievous, Jack Frost is not always friendly in all stories.",
      answer: false,
    },
    {
      type: "sata",
      question: "What are some characteristics often attributed to Jack Frost?",
      explanation:
        "Jack Frost is often seen as mischievous and associated with cold weather.",
      choices: ["Mischievous", "Benevolent", "Cold", "Hot"],
      answer: ["Mischievous", "Cold"],
    },
    {
      type: "tf",
      question: "Jack Frost is a modern character with no roots in folklore.",
      explanation:
        "Jack Frost has roots in traditional folklore, especially in European cultures.",
      answer: false,
    },
    {
      type: "sata",
      question: "In which contexts is Jack Frost commonly referenced?",
      explanation:
        "Jack Frost is commonly referenced in winter contexts and folklore.",
      choices: [
        "Winter stories",
        "Summer tales",
        "Folklore",
        "Historical accounts",
      ],
      answer: ["Winter stories", "Folklore"],
    },
  ],
  [
    {
      type: "tf",
      question: "Isaac Newton invented the reflecting telescope.",
      explanation:
        "Newton built the first practical reflecting telescope in 1668.",
      answer: true,
    },
    {
      type: "sata",
      question: "Which contributions are attributed to Isaac Newton?",
      explanation:
        "Newton's major contributions include his laws of motion and work on calculus.",
      choices: [
        "Development of Calculus",
        "Discovery of X-Rays",
        "Laws of Motion",
        "Theory of Evolution",
      ],
      answer: ["Development of Calculus", "Laws of Motion"],
    },
    {
      type: "tf",
      question:
        "Isaac Newton's work on calculus was published before his work on optics.",
      explanation:
        "Newton's work on calculus was not published until after his work on optics.",
      answer: false,
    },
    {
      type: "sata",
      question: "What are some of Newton's notable achievements?",
      explanation:
        "Newton is known for his work on the laws of motion, universal gravitation, and his contributions to the field of optics.",
      choices: [
        "Laws of Motion",
        "Universal Gravitation",
        "Opticks",
        "Principia Mathematica",
      ],
      answer: [
        "Laws of Motion",
        "Universal Gravitation",
        "Opticks",
        "Principia Mathematica",
      ],
    },
  ],
  [
    {
      type: "mcq",
      question: "What is the primary goal of creating content on LinkedIn?",
      explanation:
        "The primary goal is to engage the audience and build professional connections.",
      choices: [
        "To drive website traffic",
        "To engage the audience and build professional connections",
        "To increase personal followers",
        "To share personal achievements",
      ],
      answer: "To engage the audience and build professional connections",
    },
    {
      type: "mcq",
      question:
        "Which of the following is a best practice for LinkedIn content creation?",
      explanation:
        "Posting consistently is key to maintaining audience engagement.",
      choices: [
        "Posting sporadically",
        "Posting consistently",
        "Focusing solely on promotional content",
        "Ignoring audience engagement",
      ],
      answer: "Posting consistently",
    },
    {
      type: "mcq",
      question: "What type of content performs well on LinkedIn?",
      explanation:
        "Professional insights and industry news are highly engaging.",
      choices: [
        "Personal stories unrelated to profession",
        "Professional insights and industry news",
        "Overly promotional content",
        "Unrelated news",
      ],
      answer: "Professional insights and industry news",
    },
    {
      type: "mcq",
      question: "How often should you post on LinkedIn to maintain visibility?",
      explanation: "Posting at least once a week helps maintain visibility.",
      choices: ["Daily", "At least once a week", "Monthly", "Quarterly"],
      answer: "At least once a week",
    },
    {
      type: "mcq",
      question:
        "Why is it important to engage with comments on your LinkedIn posts?",
      explanation:
        "Engaging with comments builds relationships and fosters community.",
      choices: [
        "To argue with critics",
        "To ignore negative feedback",
        "To build relationships and foster community",
        "To promote other content",
      ],
      answer: "To build relationships and foster community",
    },
  ],
  [
    {
      type: "sata",
      question: "Which of the following stories or media feature Jack Frost?",
      explanation:
        "Jack Frost appears in various forms of media, including the movie 'Jack Frost' (1998).",
      choices: [
        "The movie 'Jack Frost' (1998)",
        "The novel 'To Kill a Mockingbird'",
        "The folklore of many European cultures",
        "The Disney movie 'Frozen'",
      ],
      answer: [
        "The movie 'Jack Frost' (1998)",
        "The folklore of many European cultures",
      ],
    },
    {
      type: "tf",
      question:
        "Jack Frost is known for being a friendly character in all depictions.",
      explanation:
        "While often depicted as mischievous, Jack Frost is not always friendly in all stories.",
      answer: false,
    },
    {
      type: "sata",
      question: "What are some characteristics often attributed to Jack Frost?",
      explanation:
        "Jack Frost is often seen as mischievous and associated with cold weather.",
      choices: ["Mischievous", "Benevolent", "Cold", "Hot"],
      answer: ["Mischievous", "Cold"],
    },
    {
      type: "tf",
      question: "Jack Frost is a modern character with no roots in folklore.",
      explanation:
        "Jack Frost has roots in traditional folklore, especially in European cultures.",
      answer: false,
    },
    {
      type: "sata",
      question: "In which contexts is Jack Frost commonly referenced?",
      explanation:
        "Jack Frost is commonly referenced in winter contexts and folklore.",
      choices: [
        "Winter stories",
        "Summer tales",
        "Folklore",
        "Historical accounts",
      ],
      answer: ["Winter stories", "Folklore"],
    },
  ],
  [
    {
      type: "tf",
      question: "Isaac Newton invented the reflecting telescope.",
      explanation:
        "Newton built the first practical reflecting telescope in 1668.",
      answer: true,
    },
    {
      type: "sata",
      question: "Which contributions are attributed to Isaac Newton?",
      explanation:
        "Newton's major contributions include his laws of motion and work on calculus.",
      choices: [
        "Development of Calculus",
        "Discovery of X-Rays",
        "Laws of Motion",
        "Theory of Evolution",
      ],
      answer: ["Development of Calculus", "Laws of Motion"],
    },
    {
      type: "tf",
      question:
        "Isaac Newton's work on calculus was published before his work on optics.",
      explanation:
        "Newton's work on calculus was not published until after his work on optics.",
      answer: false,
    },
    {
      type: "sata",
      question: "What are some of Newton's notable achievements?",
      explanation:
        "Newton is known for his work on the laws of motion, universal gravitation, and his contributions to the field of optics.",
      choices: [
        "Laws of Motion",
        "Universal Gravitation",
        "Opticks",
        "Principia Mathematica",
      ],
      answer: [
        "Laws of Motion",
        "Universal Gravitation",
        "Opticks",
        "Principia Mathematica",
      ],
    },
  ],
  [
    {
      type: "mcq",
      question: "What is the primary goal of creating content on LinkedIn?",
      explanation:
        "The primary goal is to engage the audience and build professional connections.",
      choices: [
        "To drive website traffic",
        "To engage the audience and build professional connections",
        "To increase personal followers",
        "To share personal achievements",
      ],
      answer: "To engage the audience and build professional connections",
    },
    {
      type: "mcq",
      question:
        "Which of the following is a best practice for LinkedIn content creation?",
      explanation:
        "Posting consistently is key to maintaining audience engagement.",
      choices: [
        "Posting sporadically",
        "Posting consistently",
        "Focusing solely on promotional content",
        "Ignoring audience engagement",
      ],
      answer: "Posting consistently",
    },
    {
      type: "mcq",
      question: "What type of content performs well on LinkedIn?",
      explanation:
        "Professional insights and industry news are highly engaging.",
      choices: [
        "Personal stories unrelated to profession",
        "Professional insights and industry news",
        "Overly promotional content",
        "Unrelated news",
      ],
      answer: "Professional insights and industry news",
    },
    {
      type: "mcq",
      question: "How often should you post on LinkedIn to maintain visibility?",
      explanation: "Posting at least once a week helps maintain visibility.",
      choices: ["Daily", "At least once a week", "Monthly", "Quarterly"],
      answer: "At least once a week",
    },
    {
      type: "mcq",
      question:
        "Why is it important to engage with comments on your LinkedIn posts?",
      explanation:
        "Engaging with comments builds relationships and fosters community.",
      choices: [
        "To argue with critics",
        "To ignore negative feedback",
        "To build relationships and foster community",
        "To promote other content",
      ],
      answer: "To build relationships and foster community",
    },
  ],
  [
    {
      type: "sata",
      question: "Which of the following stories or media feature Jack Frost?",
      explanation:
        "Jack Frost appears in various forms of media, including the movie 'Jack Frost' (1998).",
      choices: [
        "The movie 'Jack Frost' (1998)",
        "The novel 'To Kill a Mockingbird'",
        "The folklore of many European cultures",
        "The Disney movie 'Frozen'",
      ],
      answer: [
        "The movie 'Jack Frost' (1998)",
        "The folklore of many European cultures",
      ],
    },
    {
      type: "tf",
      question:
        "Jack Frost is known for being a friendly character in all depictions.",
      explanation:
        "While often depicted as mischievous, Jack Frost is not always friendly in all stories.",
      answer: false,
    },
    {
      type: "sata",
      question: "What are some characteristics often attributed to Jack Frost?",
      explanation:
        "Jack Frost is often seen as mischievous and associated with cold weather.",
      choices: ["Mischievous", "Benevolent", "Cold", "Hot"],
      answer: ["Mischievous", "Cold"],
    },
    {
      type: "tf",
      question: "Jack Frost is a modern character with no roots in folklore.",
      explanation:
        "Jack Frost has roots in traditional folklore, especially in European cultures.",
      answer: false,
    },
    {
      type: "sata",
      question: "In which contexts is Jack Frost commonly referenced?",
      explanation:
        "Jack Frost is commonly referenced in winter contexts and folklore.",
      choices: [
        "Winter stories",
        "Summer tales",
        "Folklore",
        "Historical accounts",
      ],
      answer: ["Winter stories", "Folklore"],
    },
  ],
  [
    {
      type: "tf",
      question: "Isaac Newton invented the reflecting telescope.",
      explanation:
        "Newton built the first practical reflecting telescope in 1668.",
      answer: true,
    },
    {
      type: "sata",
      question: "Which contributions are attributed to Isaac Newton?",
      explanation:
        "Newton's major contributions include his laws of motion and work on calculus.",
      choices: [
        "Development of Calculus",
        "Discovery of X-Rays",
        "Laws of Motion",
        "Theory of Evolution",
      ],
      answer: ["Development of Calculus", "Laws of Motion"],
    },
    {
      type: "tf",
      question:
        "Isaac Newton's work on calculus was published before his work on optics.",
      explanation:
        "Newton's work on calculus was not published until after his work on optics.",
      answer: false,
    },
    {
      type: "sata",
      question: "What are some of Newton's notable achievements?",
      explanation:
        "Newton is known for his work on the laws of motion, universal gravitation, and his contributions to the field of optics.",
      choices: [
        "Laws of Motion",
        "Universal Gravitation",
        "Opticks",
        "Principia Mathematica",
      ],
      answer: [
        "Laws of Motion",
        "Universal Gravitation",
        "Opticks",
        "Principia Mathematica",
      ],
    },
  ],
  [
    {
      type: "mcq",
      question: "What is the primary goal of creating content on LinkedIn?",
      explanation:
        "The primary goal is to engage the audience and build professional connections.",
      choices: [
        "To drive website traffic",
        "To engage the audience and build professional connections",
        "To increase personal followers",
        "To share personal achievements",
      ],
      answer: "To engage the audience and build professional connections",
    },
    {
      type: "mcq",
      question:
        "Which of the following is a best practice for LinkedIn content creation?",
      explanation:
        "Posting consistently is key to maintaining audience engagement.",
      choices: [
        "Posting sporadically",
        "Posting consistently",
        "Focusing solely on promotional content",
        "Ignoring audience engagement",
      ],
      answer: "Posting consistently",
    },
    {
      type: "mcq",
      question: "What type of content performs well on LinkedIn?",
      explanation:
        "Professional insights and industry news are highly engaging.",
      choices: [
        "Personal stories unrelated to profession",
        "Professional insights and industry news",
        "Overly promotional content",
        "Unrelated news",
      ],
      answer: "Professional insights and industry news",
    },
    {
      type: "mcq",
      question: "How often should you post on LinkedIn to maintain visibility?",
      explanation: "Posting at least once a week helps maintain visibility.",
      choices: ["Daily", "At least once a week", "Monthly", "Quarterly"],
      answer: "At least once a week",
    },
    {
      type: "mcq",
      question:
        "Why is it important to engage with comments on your LinkedIn posts?",
      explanation:
        "Engaging with comments builds relationships and fosters community.",
      choices: [
        "To argue with critics",
        "To ignore negative feedback",
        "To build relationships and foster community",
        "To promote other content",
      ],
      answer: "To build relationships and foster community",
    },
  ],
  [
    {
      type: "sata",
      question: "Which of the following stories or media feature Jack Frost?",
      explanation:
        "Jack Frost appears in various forms of media, including the movie 'Jack Frost' (1998).",
      choices: [
        "The movie 'Jack Frost' (1998)",
        "The novel 'To Kill a Mockingbird'",
        "The folklore of many European cultures",
        "The Disney movie 'Frozen'",
      ],
      answer: [
        "The movie 'Jack Frost' (1998)",
        "The folklore of many European cultures",
      ],
    },
    {
      type: "tf",
      question:
        "Jack Frost is known for being a friendly character in all depictions.",
      explanation:
        "While often depicted as mischievous, Jack Frost is not always friendly in all stories.",
      answer: false,
    },
    {
      type: "sata",
      question: "What are some characteristics often attributed to Jack Frost?",
      explanation:
        "Jack Frost is often seen as mischievous and associated with cold weather.",
      choices: ["Mischievous", "Benevolent", "Cold", "Hot"],
      answer: ["Mischievous", "Cold"],
    },
    {
      type: "tf",
      question: "Jack Frost is a modern character with no roots in folklore.",
      explanation:
        "Jack Frost has roots in traditional folklore, especially in European cultures.",
      answer: false,
    },
    {
      type: "sata",
      question: "In which contexts is Jack Frost commonly referenced?",
      explanation:
        "Jack Frost is commonly referenced in winter contexts and folklore.",
      choices: [
        "Winter stories",
        "Summer tales",
        "Folklore",
        "Historical accounts",
      ],
      answer: ["Winter stories", "Folklore"],
    },
  ],
  [
    {
      type: "tf",
      question: "Isaac Newton invented the reflecting telescope.",
      explanation:
        "Newton built the first practical reflecting telescope in 1668.",
      answer: true,
    },
    {
      type: "sata",
      question: "Which contributions are attributed to Isaac Newton?",
      explanation:
        "Newton's major contributions include his laws of motion and work on calculus.",
      choices: [
        "Development of Calculus",
        "Discovery of X-Rays",
        "Laws of Motion",
        "Theory of Evolution",
      ],
      answer: ["Development of Calculus", "Laws of Motion"],
    },
    {
      type: "tf",
      question:
        "Isaac Newton's work on calculus was published before his work on optics.",
      explanation:
        "Newton's work on calculus was not published until after his work on optics.",
      answer: false,
    },
    {
      type: "sata",
      question: "What are some of Newton's notable achievements?",
      explanation:
        "Newton is known for his work on the laws of motion, universal gravitation, and his contributions to the field of optics.",
      choices: [
        "Laws of Motion",
        "Universal Gravitation",
        "Opticks",
        "Principia Mathematica",
      ],
      answer: [
        "Laws of Motion",
        "Universal Gravitation",
        "Opticks",
        "Principia Mathematica",
      ],
    },
  ],
];

export default function Sidebar() {
  const maxQuizzes = 10;

  const [usage, setUsage] = useState(maxQuizzes);
  return (
    <div className={styles.wrapper + " panel"}>
      <div className={styles.usageContainer}>
        <div className={styles.usageStats}>
          <p>{usage}</p>
          <p>{maxQuizzes}</p>
        </div>
        <div className={styles.usageProgressContainer}>
          <div
            className={styles.usageProgress}
            style={{ "--usage": `${(usage / maxQuizzes) * 100}%` }}
          />
        </div>
      </div>
      <button className={styles.newButton}>✚ New Quiz</button>
      <h3>Quizzes</h3>
      {!quizzes || quizzes.length === 0 ? (
        <p className="lead">No quizzes yet — hit "Generate" to get started.</p>
      ) : (
        <ul className={styles.list}>
          {quizzes.map((quiz, i) => (
            <li className={styles.listItem} key={i} role="button" tabIndex={0}>
              <span
                className={styles.listItemText}
                title={quiz?.[0]?.question ?? "Untitled quiz"}
              >
                {quiz?.[0]?.question ?? "Untitled quiz"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
