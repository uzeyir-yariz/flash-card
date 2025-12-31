import React from 'react';
import { exportStatsAsJSON } from '../utils/statsManager';
import './Results.css';

const Results = ({ results, onReturnHome, onRetryWrong, stats }) => {
  const { score, totalQuestions, correctAnswers, accuracy, answeredQuestions } = results;
  
  const wrongQuestions = answeredQuestions.filter(q => !q.isCorrect);
  const skippedQuestions = answeredQuestions.filter(q => q.isSkipped);

  const getPerformanceMessage = () => {
    if (accuracy >= 90) return { emoji: '🎉', text: 'Mükemmel!' };
    if (accuracy >= 75) return { emoji: '✨', text: 'Harika!' };
    if (accuracy >= 60) return { emoji: '👍', text: 'İyi!' };
    if (accuracy >= 40) return { emoji: '💪', text: 'Daha iyi olabilir!' };
    return { emoji: '📚', text: 'Çalışmaya devam!' };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="results-container">
      <div className="results-content">
        {/* Score Summary */}
        <div className="score-summary fade-in">
          <div className="performance-badge">
            <span className="performance-emoji">{performance.emoji}</span>
            <h2>{performance.text}</h2>
          </div>

          <div className="score-circle">
            <svg viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--border-color)"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--accent-success)"
                strokeWidth="8"
                strokeDasharray={`${accuracy * 2.827} 282.7`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="score-text">
              <span className="score-percentage">{accuracy}%</span>
              <span className="score-label">Doğruluk</span>
            </div>
          </div>

          <div className="score-details">
            <div className="score-detail">
              <span className="detail-value">{totalQuestions}</span>
              <span className="detail-label">Toplam Soru</span>
            </div>
            <div className="score-detail success">
              <span className="detail-value">{correctAnswers}</span>
              <span className="detail-label">Doğru</span>
            </div>
            <div className="score-detail error">
              <span className="detail-value">{wrongQuestions.length}</span>
              <span className="detail-label">Yanlış</span>
            </div>
            {skippedQuestions.length > 0 && (
              <div className="score-detail warning">
                <span className="detail-value">{skippedQuestions.length}</span>
                <span className="detail-label">Geçildi</span>
              </div>
            )}
          </div>
        </div>

        {/* Wrong Answers */}
        {wrongQuestions.length > 0 && (
          <div className="wrong-answers fade-in">
            <h3>❌ Yanlış Cevaplar ({wrongQuestions.length})</h3>
            <div className="wrong-list">
              {wrongQuestions.map((q, index) => (
                <div key={index} className="wrong-item card">
                  <p className="wrong-question">{q.question}</p>
                  {!q.isSkipped && (
                    <div className="wrong-answer">
                      <span className="label">Sizin cevabınız:</span>
                      <span className="user-answer">{q.userAnswer}</span>
                    </div>
                  )}
                  <div className="correct-answer">
                    <span className="label">Doğru cevap:</span>
                    <span className="correct-text">{q.correctAnswer}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="results-actions fade-in">
          {wrongQuestions.length > 0 && (
            <button className="btn-error" onClick={onRetryWrong}>
              🔄 Yanlışları Tekrar Et ({wrongQuestions.length})
            </button>
          )}
          <button className="btn-primary" onClick={onReturnHome}>
            🏠 Ana Menü
          </button>
          <button className="btn-secondary" onClick={() => exportStatsAsJSON(stats)}>
            💾 İstatistikleri İndir
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
