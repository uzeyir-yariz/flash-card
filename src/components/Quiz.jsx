import React, { useState, useEffect } from 'react';
import QuestionCard from './QuestionCard';
import AnswerCard from './AnswerCard';
import './Quiz.css';

const Quiz = ({ 
  questions, 
  settings, 
  onQuizComplete,
  onUpdateStats 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answerOptions, setAnswerOptions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);

  // Initialize quiz
  useEffect(() => {
    if (questions && questions.length > 0) {
      loadQuestion(0);
    }
  }, [questions]);

  // Timer logic
  useEffect(() => {
    if (settings.timeLimit && timeLeft !== null && timeLeft > 0 && !isRevealed) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isRevealed) {
      handleSkip();
    }
  }, [timeLeft, isRevealed]);

  const loadQuestion = (index) => {
    if (index >= questions.length) {
      handleQuizComplete();
      return;
    }

    const question = questions[index];
    setCurrentQuestion(question);

    // Generate answer options
    const options = generateAnswerOptions(question, questions);
    setAnswerOptions(options);
    
    setSelectedAnswer(null);
    setIsRevealed(false);
    
    // Reset timer
    if (settings.timeLimit) {
      setTimeLeft(settings.timeLimit);
    }
  };

  const generateAnswerOptions = (question, allQuestions) => {
    // Get 3 random wrong answers from other questions
    const otherAnswers = allQuestions
      .filter(q => q.id !== question.id)
      .map(q => q.answer);
    
    const shuffled = [...otherAnswers].sort(() => Math.random() - 0.5);
    const distractors = shuffled.slice(0, 3);

    // Combine correct answer with distractors
    const options = [
      { text: question.answer, isCorrect: true },
      ...distractors.map(d => ({ text: d, isCorrect: false }))
    ];

    // Shuffle all options
    return options.sort(() => Math.random() - 0.5);
  };

  const handleAnswerClick = (index) => {
    if (isRevealed) return;

    setSelectedAnswer(index);
    setIsRevealed(true);

    const isCorrect = answerOptions[index].isCorrect;
    
    if (isCorrect) {
      setScore(score + 1);
    }

    // Update stats
    onUpdateStats(currentQuestion.id, isCorrect, false);

    // Save answered question
    setAnsweredQuestions([...answeredQuestions, {
      question: currentQuestion.question,
      userAnswer: answerOptions[index].text,
      correctAnswer: currentQuestion.answer,
      isCorrect
    }]);

    // Auto advance after delay
    setTimeout(() => {
      handleNext();
    }, 2000);
  };

  const handleSkip = () => {
    setIsRevealed(true);
    
    // Mark as skipped in stats
    onUpdateStats(currentQuestion.id, false, true);

    // Save skipped question
    setAnsweredQuestions([...answeredQuestions, {
      question: currentQuestion.question,
      userAnswer: null,
      correctAnswer: currentQuestion.answer,
      isCorrect: false,
      isSkipped: true
    }]);

    setTimeout(() => {
      handleNext();
    }, 1500);
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    
    if (settings.questionCount && nextIndex >= settings.questionCount) {
      handleQuizComplete();
    } else if (nextIndex >= questions.length) {
      handleQuizComplete();
    } else {
      setCurrentIndex(nextIndex);
      loadQuestion(nextIndex);
    }
  };

  const handleQuizComplete = () => {
    const totalQuestions = answeredQuestions.length;
    const correctAnswers = answeredQuestions.filter(q => q.isCorrect).length;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    onQuizComplete({
      score,
      totalQuestions,
      correctAnswers,
      accuracy,
      answeredQuestions
    });
  };

  if (!currentQuestion) {
    return <div className="quiz-loading">Yükleniyor...</div>;
  }

  const totalQuestions = settings.questionCount || questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="quiz-container">
      {/* Top Bar */}
      <div className="quiz-header">
        <div className="quiz-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="progress-text">
            {currentIndex + 1} / {totalQuestions}
          </span>
        </div>
        
        {settings.timeLimit && timeLeft !== null && (
          <div className={`timer ${timeLeft <= 5 ? 'timer-warning' : ''}`}>
            ⏱️ {timeLeft}s
          </div>
        )}
        
        <div className="score">
          🎯 {score} doğru
        </div>
      </div>

      {/* Question Card */}
      <QuestionCard
        question={currentQuestion.question}
        questionNumber={currentIndex + 1}
        totalQuestions={totalQuestions}
      />

      {/* Answer Options */}
      <div className="answers-grid">
        {answerOptions.map((option, index) => (
          <AnswerCard
            key={index}
            answer={option.text}
            isSelected={selectedAnswer === index}
            isRevealed={isRevealed}
            isCorrect={option.isCorrect}
            onClick={() => handleAnswerClick(index)}
            disabled={isRevealed}
          />
        ))}
      </div>

      {/* Skip Button */}
      {!isRevealed && (
        <button className="skip-button btn-secondary" onClick={handleSkip}>
          Bilmiyorum / Geç
        </button>
      )}

      {/* Feedback */}
      {isRevealed && (
        <div className={`feedback fade-in ${selectedAnswer !== null && answerOptions[selectedAnswer]?.isCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
          {selectedAnswer !== null && answerOptions[selectedAnswer]?.isCorrect ? (
            <p>✓ Doğru!</p>
          ) : (
            <p>✗ Yanlış! Doğru cevap: <strong>{currentQuestion.answer}</strong></p>
          )}
        </div>
      )}
    </div>
  );
};

export default Quiz;
