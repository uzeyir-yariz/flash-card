import Papa from 'papaparse';

/**
 * Parse CSV file and convert to question-answer format
 * @param {File} file - CSV file to parse
 * @returns {Promise<Array>} Array of question objects
 */
export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      encoding: 'UTF-8',
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const questions = results.data
            .filter(row => row.length >= 2 && row[0] && row[1])
            .map((row, index) => ({
              id: `q_${index}_${Date.now()}`,
              question: row[0].trim(),
              answer: row[1].trim(),
            }));

          if (questions.length === 0) {
            reject(new Error('CSV dosyası geçersiz veya boş'));
            return;
          }

          resolve(questions);
        } catch (error) {
          reject(new Error('CSV işleme hatası: ' + error.message));
        }
      },
      error: (error) => {
        reject(new Error('CSV okuma hatası: ' + error.message));
      }
    });
  });
};

/**
 * Parse multiple CSV files
 * @param {FileList} files - Multiple CSV files
 * @returns {Promise<Array>} Combined array of all questions
 */
export const parseMultipleCSV = async (files) => {
  const filesArray = Array.from(files);
  const promises = filesArray.map(file => parseCSV(file));
  
  try {
    const results = await Promise.all(promises);
    return results.flat();
  } catch (error) {
    throw error;
  }
};

/**
 * Validate CSV format
 * @param {File} file - File to validate
 * @returns {boolean} True if valid CSV
 */
export const validateCSV = (file) => {
  if (!file) return false;
  const validExtensions = ['.csv', '.txt'];
  const fileName = file.name.toLowerCase();
  return validExtensions.some(ext => fileName.endsWith(ext));
};
