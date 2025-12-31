import React from 'react';
import './QuestionCard.css';

const QuestionCard = ({ question, questionNumber, totalQuestions }) => {
  return (
    <div className="question-card fade-in">
      <div className="question-header">
        <span className="question-number">
          Soru {questionNumber} / {totalQuestions}
        </span>
      </div>
      <div className="question-content">
        <p className="question-text">{question}</p>
      </div>
    </div>
  );
};

export default QuestionCard;
