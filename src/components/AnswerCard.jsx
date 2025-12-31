import React from 'react';
import './AnswerCard.css';

const AnswerCard = ({ answer, isSelected, isRevealed, isCorrect, onClick, disabled }) => {
  const getCardClass = () => {
    let classes = 'answer-card';
    
    if (disabled) classes += ' disabled';
    if (isSelected) classes += ' selected';
    
    if (isRevealed) {
      if (isCorrect) {
        classes += ' correct';
      } else if (isSelected && !isCorrect) {
        classes += ' wrong shake';
      }
    }
    
    return classes;
  };

  return (
    <button
      className={getCardClass()}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="answer-text">{answer}</span>
      {isRevealed && isCorrect && (
        <span className="answer-icon">✓</span>
      )}
      {isRevealed && isSelected && !isCorrect && (
        <span className="answer-icon">✗</span>
      )}
    </button>
  );
};

export default AnswerCard;
