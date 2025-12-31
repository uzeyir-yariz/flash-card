import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import Quiz from './components/Quiz';
import Results from './components/Results';
import { 
  loadStats, 
  saveStats, 
  updateQuestionStats, 
  startNewSession 
} from './utils/statsManager';
import './App.css';

function App() {
  const [screen, setScreen] = useState('home'); // 'home', 'quiz', 'results'
  const [questions, setQuestions] = useState([]);
  const [settings, setSettings] = useState({});
  const [stats, setStats] = useState(loadStats());
  const [quizResults, setQuizResults] = useState(null);

  // Save stats whenever they change
  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  const handleStartQuiz = (loadedQuestions, quizSettings) => {
    // Start new session
    const newStats = startNewSession(stats);
    setStats(newStats);

    setQuestions(loadedQuestions);
    setSettings(quizSettings);
    setScreen('quiz');
  };

  const handleUpdateStats = (questionId, isCorrect, isSkipped) => {
    const updatedStats = updateQuestionStats(stats, questionId, isCorrect, isSkipped);
    setStats(updatedStats);
  };

  const handleQuizComplete = (results) => {
    setQuizResults(results);
    setScreen('results');
  };

  const handleReturnHome = () => {
    setScreen('home');
    setQuestions([]);
    setSettings({});
    setQuizResults(null);
  };

  const handleRetryWrong = () => {
    if (!quizResults) return;

    // Get wrong questions
    const wrongQuestionIds = quizResults.answeredQuestions
      .filter(q => !q.isCorrect)
      .map(q => q.question);

    // Filter original questions to get full question objects
    const wrongQuestions = questions.filter(q => 
      wrongQuestionIds.includes(q.question)
    );

    if (wrongQuestions.length === 0) {
      handleReturnHome();
      return;
    }

    // Restart quiz with wrong questions
    const wrongSettings = {
      questionCount: wrongQuestions.length,
      timeLimit: settings.timeLimit
    };

    handleStartQuiz(wrongQuestions, wrongSettings);
  };

  return (
    <div className="app">
      {screen === 'home' && (
        <Home 
          onStartQuiz={handleStartQuiz}
          stats={stats}
        />
      )}

      {screen === 'quiz' && (
        <Quiz
          questions={questions}
          settings={settings}
          onQuizComplete={handleQuizComplete}
          onUpdateStats={handleUpdateStats}
        />
      )}

      {screen === 'results' && quizResults && (
        <Results
          results={quizResults}
          onReturnHome={handleReturnHome}
          onRetryWrong={handleRetryWrong}
          stats={stats}
        />
      )}
    </div>
  );
}

export default App;
