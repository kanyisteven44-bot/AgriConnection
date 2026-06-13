/**
 * Calculates the strength of a password on a scale of 0 to 4.
 * @param {string} pass - The password to evaluate.
 * @returns {number} - The strength score.
 */
export const calculatePasswordStrength = (pass) => {
  let score = 0;
  if (!pass) {
    return 0;
  }
  if (pass.length >= 8) score++;
  if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++;
  if (/\d/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  return score;
};