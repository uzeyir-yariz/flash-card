import React, { useState } from 'react';
import { parseCSV, parseMultipleCSV, validateCSV } from '../utils/csvParser';
import { getSummaryStats } from '../utils/statsManager';
import './Home.css';

const Home = ({ onStartQuiz, stats }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const summary = getSummaryStats(stats);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(validateCSV);

    if (validFiles.length === 0) {
      setError('Geçerli CSV dosyası seçin');
      return;
    }

    setSelectedFiles(validFiles);
    setError(null);
  };

  const handleStartQuiz = async () => {
    if (selectedFiles.length === 0) {
      setError('Lütfen en az bir CSV dosyası seçin');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const questions = await parseMultipleCSV(selectedFiles);

      if (questions.length === 0) {
        setError('CSV dosyalarında soru bulunamadı');
        setIsLoading(false);
        return;
      }

      const settings = {
        questionCount: questionCount === 0 ? questions.length : Math.min(questionCount, questions.length),
        timeLimit: timeLimit === 0 ? null : timeLimit
      };

      onStartQuiz(questions, settings);
    } catch (err) {
      setError(err.message || 'Dosya okuma hatası');
      setIsLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <header className="home-header fade-in">
          <h1>📚 Flashcard Quiz</h1>
          <p className="text-secondary">Akıllı öğrenme sistemi ile bilginizi test edin</p>
        </header>

        {/* Stats Summary */}
        {summary.totalQuestions > 0 && (
          <div className="stats-summary card fade-in">
            <h3>📊 İstatistikleriniz</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{summary.totalQuestions}</span>
                <span className="stat-label">Toplam Soru</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{summary.accuracy}%</span>
                <span className="stat-label">Doğruluk</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{summary.masteredQuestions}</span>
                <span className="stat-label">Öğrenildi</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{summary.studySessions}</span>
                <span className="stat-label">Oturum</span>
              </div>
            </div>
          </div>
        )}

        {/* File Upload */}
        <div className="upload-section card fade-in">
          <h3>📁 CSV Dosyası Seç</h3>
          <p className="text-secondary text-sm">Bir veya birden fazla CSV dosyası yükleyin</p>
          
          <input
            type="file"
            id="csv-upload"
            accept=".csv,.txt"
            multiple
            onChange={handleFileSelect}
          />
          <label htmlFor="csv-upload" className="upload-button btn-primary">
            {selectedFiles.length > 0 
              ? `${selectedFiles.length} dosya seçildi` 
              : 'Dosya Seç'}
          </label>

          {selectedFiles.length > 0 && (
            <div className="selected-files">
              {selectedFiles.map((file, index) => (
                <div key={index} className="file-tag">
                  📄 {file.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="settings-section card fade-in">
          <h3>⚙️ Ayarlar</h3>

          <div className="setting-group">
            <label>Soru Sayısı</label>
            <div className="button-group">
              <button
                className={questionCount === 10 ? 'active' : ''}
                onClick={() => setQuestionCount(10)}
              >
                10
              </button>
              <button
                className={questionCount === 20 ? 'active' : ''}
                onClick={() => setQuestionCount(20)}
              >
                20
              </button>
              <button
                className={questionCount === 50 ? 'active' : ''}
                onClick={() => setQuestionCount(50)}
              >
                50
              </button>
              <button
                className={questionCount === 0 ? 'active' : ''}
                onClick={() => setQuestionCount(0)}
              >
                Sonsuz
              </button>
            </div>
          </div>

          <div className="setting-group">
            <label>Süre Limiti</label>
            <div className="button-group">
              <button
                className={timeLimit === 10 ? 'active' : ''}
                onClick={() => setTimeLimit(10)}
              >
                10s
              </button>
              <button
                className={timeLimit === 20 ? 'active' : ''}
                onClick={() => setTimeLimit(20)}
              >
                20s
              </button>
              <button
                className={timeLimit === 30 ? 'active' : ''}
                onClick={() => setTimeLimit(30)}
              >
                30s
              </button>
              <button
                className={timeLimit === 0 ? 'active' : ''}
                onClick={() => setTimeLimit(0)}
              >
                Sınırsız
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message fade-in">
            ⚠️ {error}
          </div>
        )}

        {/* Start Button */}
        <button
          className="start-button btn-primary"
          onClick={handleStartQuiz}
          disabled={selectedFiles.length === 0 || isLoading}
        >
          {isLoading ? 'Yükleniyor...' : '🚀 Quiz\'e Başla'}
        </button>
      </div>
    </div>
  );
};

export default Home;
