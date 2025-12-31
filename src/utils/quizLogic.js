/**
 * Core quiz logic and question management
 */

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled copy of array
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Generate 3 wrong answers (distractors) from other questions
 * @param {Object} currentQuestion - Current question object
 * @param {Array} allQuestions - All available questions
 * @returns {Array} Array of 3 distractor answers
 */
export const generateDistractors = (currentQuestion, allQuestions) => {
  // Get all other answers
  const otherAnswers = allQuestions
    .filter(q => q.id !== currentQuestion.id)
    .map(q => q.answer);

  // Shuffle and take first 3
  const shuffled = shuffleArray(otherAnswers);
  return shuffled.slice(0, 3);
};

/**
 * Create answer options (1 correct + 3 wrong)
 * @param {Object} question - Question object
 * @param {Array} allQuestions - All questions for generating distractors
 * @returns {Array} Array of 4 shuffled answer options
 */
export const createAnswerOptions = (question, allQuestions) => {
  const distractors = generateDistractors(question, allQuestions);
  const options = [
    { text: question.answer, isCorrect: true },
    ...distractors.map(distractor => ({ text: distractor, isCorrect: false }))
  ];

  return shuffleArray(options);
};

/**
 * Calculate mastery level for a question (0-100)
 * @param {Object} stats - Question statistics
 * @returns {number} Mastery level percentage
 */
export const calculateMastery = (stats) => {
  if (!stats || stats.times_shown === 0) return 0;

  const correctRatio = stats.times_correct / stats.times_shown;
  const baseScore = correctRatio * 100;

  // Bonus for consecutive correct answers
  const recentBonus = stats.times_correct >= 3 ? 10 : 0;

  // Penalty for recent wrong answers
  const wrongPenalty = stats.times_wrong > stats.times_correct ? -10 : 0;

  return Math.max(0, Math.min(100, baseScore + recentBonus + wrongPenalty));
};

/**
 * Select next question using spaced repetition algorithm
 * @param {Array} questions - All questions
 * @param {Object} questionStats - Statistics for all questions
 * @param {Array} answeredIds - IDs of already answered questions in this session
 * @returns {Object} Next question to show
 */
export const selectNextQuestion = (questions, questionStats, answeredIds) => {
  // Filter out already answered questions
  const unanswered = questions.filter(q => !answeredIds.includes(q.id));

  if (unanswered.length === 0) return null;

  // Calculate priority scores for each question
  const scored = unanswered.map(question => {
    const stats = questionStats[question.id] || {
      times_shown: 0,
      times_correct: 0,
      times_wrong: 0,
      mastery_level: 0
    };

    // Priority calculation:
    // - Lower mastery = higher priority
    // - Never shown = medium priority
    // - Wrong answers = highest priority
    let priority = 0;

    if (stats.times_shown === 0) {
      priority = 50; // New questions get medium priority
    } else {
      priority = 100 - stats.mastery_level; // Inverse of mastery
      if (stats.times_wrong > stats.times_correct) {
        priority += 30; // Boost for wrong answers
      }
    }

    return { question, priority };
  });

  // Sort by priority (highest first) and add some randomness
  scored.sort((a, b) => {
    const diff = b.priority - a.priority;
    // Add small random factor to prevent always showing same question
    return diff + (Math.random() - 0.5) * 10;
  });

  return scored[0].question;
};

/**
 * Get questions prioritized by mastery level (low mastery first)
 * @param {Array} questions - All questions
 * @param {Object} questionStats - Statistics for all questions
 * @returns {Array} Sorted questions
 */
export const prioritizeQuestions = (questions, questionStats) => {
  return [...questions].sort((a, b) => {
    const statsA = questionStats[a.id] || { mastery_level: 0 };
    const statsB = questionStats[b.id] || { mastery_level: 0 };
    return statsA.mastery_level - statsB.mastery_level;
  });
};

/**
 * Filter questions that were answered incorrectly
 * @param {Array} questions - All questions
 * @param {Object} questionStats - Statistics for all questions
 * @returns {Array} Questions with wrong answers
 */
export const getWrongAnswerQuestions = (questions, questionStats) => {
  return questions.filter(q => {
    const stats = questionStats[q.id];
    return stats && stats.times_wrong > 0;
  });
};
