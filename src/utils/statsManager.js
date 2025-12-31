/**
 * Statistics management for user progress and question tracking
 */

const STORAGE_KEY = 'flashcard_quiz_stats';

/**
 * Load stats from localStorage
 * @returns {Object} Stats object
 */
export const loadStats = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }

  // Return default stats structure
  return {
    user_stats: {
      total_questions_answered: 0,
      correct_answers: 0,
      wrong_answers: 0,
      skip_count: 0,
      accuracy: 0,
      study_sessions: 0,
      total_time_spent: 0,
      last_session: null
    },
    question_stats: {}
  };
};

/**
 * Save stats to localStorage
 * @param {Object} stats - Stats object to save
 */
export const saveStats = (stats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error('Error saving stats:', error);
  }
};

/**
 * Update question statistics after answering
 * @param {Object} stats - Current stats object
 * @param {string} questionId - Question ID
 * @param {boolean} isCorrect - Whether answer was correct
 * @param {boolean} isSkipped - Whether question was skipped
 * @returns {Object} Updated stats object
 */
export const updateQuestionStats = (stats, questionId, isCorrect, isSkipped = false) => {
  const newStats = { ...stats };
  
  // Initialize question stats if doesn't exist
  if (!newStats.question_stats[questionId]) {
    newStats.question_stats[questionId] = {
      times_shown: 0,
      times_correct: 0,
      times_wrong: 0,
      times_skipped: 0,
      mastery_level: 0,
      last_shown: null,
      next_review: null
    };
  }

  const questionStat = newStats.question_stats[questionId];

  // Update question-level stats
  questionStat.times_shown += 1;
  questionStat.last_shown = new Date().toISOString();

  if (isSkipped) {
    questionStat.times_skipped += 1;
    newStats.user_stats.skip_count += 1;
  } else if (isCorrect) {
    questionStat.times_correct += 1;
    newStats.user_stats.correct_answers += 1;
  } else {
    questionStat.times_wrong += 1;
    newStats.user_stats.wrong_answers += 1;
  }

  // Calculate mastery level
  const correctRatio = questionStat.times_correct / questionStat.times_shown;
  questionStat.mastery_level = Math.round(correctRatio * 100);

  // Calculate next review date (spaced repetition)
  const dayMultiplier = Math.max(1, Math.floor(questionStat.mastery_level / 20));
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + dayMultiplier);
  questionStat.next_review = nextReview.toISOString();

  // Update user-level stats
  newStats.user_stats.total_questions_answered += 1;
  
  // Recalculate accuracy
  const totalAnswered = newStats.user_stats.correct_answers + newStats.user_stats.wrong_answers;
  if (totalAnswered > 0) {
    newStats.user_stats.accuracy = Math.round(
      (newStats.user_stats.correct_answers / totalAnswered) * 100
    );
  }

  return newStats;
};

/**
 * Start a new quiz session
 * @param {Object} stats - Current stats object
 * @returns {Object} Updated stats object with new session
 */
export const startNewSession = (stats) => {
  const newStats = { ...stats };
  newStats.user_stats.study_sessions += 1;
  newStats.user_stats.last_session = new Date().toISOString();
  return newStats;
};

/**
 * Export stats as JSON file
 * @param {Object} stats - Stats object to export
 */
export const exportStatsAsJSON = (stats) => {
  const dataStr = JSON.stringify(stats, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `flashcard-stats-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
};

/**
 * Import stats from JSON file
 * @param {File} file - JSON file to import
 * @returns {Promise<Object>} Imported stats object
 */
export const importStatsFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const stats = JSON.parse(e.target.result);
        // Validate structure
        if (!stats.user_stats || !stats.question_stats) {
          throw new Error('Geçersiz stats dosyası');
        }
        resolve(stats);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Dosya okuma hatası'));
    reader.readAsText(file);
  });
};

/**
 * Reset all stats
 * @returns {Object} Fresh stats object
 */
export const resetStats = () => {
  const freshStats = loadStats();
  freshStats.user_stats = {
    total_questions_answered: 0,
    correct_answers: 0,
    wrong_answers: 0,
    skip_count: 0,
    accuracy: 0,
    study_sessions: 0,
    total_time_spent: 0,
    last_session: null
  };
  freshStats.question_stats = {};
  saveStats(freshStats);
  return freshStats;
};

/**
 * Get summary statistics
 * @param {Object} stats - Stats object
 * @returns {Object} Summary object
 */
export const getSummaryStats = (stats) => {
  const totalQuestions = Object.keys(stats.question_stats).length;
  const masteredQuestions = Object.values(stats.question_stats)
    .filter(q => q.mastery_level >= 80).length;
  
  return {
    totalQuestions,
    masteredQuestions,
    accuracy: stats.user_stats.accuracy,
    totalAnswered: stats.user_stats.total_questions_answered,
    studySessions: stats.user_stats.study_sessions
  };
};
