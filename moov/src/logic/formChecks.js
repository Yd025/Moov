/**
 * Form Validation Functions
 * 
 * Reusable functions for checking user form during exercises.
 * Each function takes MediaPipe landmarks and returns validation result.
 * 
 * MediaPipe Pose Landmark Indices Reference:
 * 0: nose, 1-6: eyes and ears
 * 11: left_shoulder, 12: right_shoulder
 * 13: left_elbow, 14: right_elbow
 * 15: left_wrist, 16: right_wrist
 * 23: left_hip, 24: right_hip
 * 25: left_knee, 26: right_knee
 * 27: left_ankle, 28: right_ankle
 */

/**
 * Validation result structure
 * @typedef {Object} FormCheckResult
 * @property {boolean} isCorrect - Whether form is correct
 * @property {string} feedback - Feedback message if incorrect
 * @property {string} severity - 'info' | 'warning' | 'error'
 * @property {number} score - Quality score 0-1
 */

/**
 * Thresholds for form checks
 */
const THRESHOLDS = {
  // Shoulder level difference (normalized Y coordinate)
  SHOULDER_LEVEL_TOLERANCE: 0.05,
  
  // Elbow straightness (degrees from 180)
  ELBOW_STRAIGHT_TOLERANCE: 20,
  ELBOW_BENT_MIN: 30,
  ELBOW_BENT_MAX: 120,
  
  // Back straightness (shoulder-hip-knee alignment)
  BACK_STRAIGHT_TOLERANCE: 15,
  
  // Knee alignment (knee over ankle in X)
  KNEE_ALIGNMENT_TOLERANCE: 0.08,
  
  // Wrist neutral (wrist-elbow alignment)
  WRIST_NEUTRAL_TOLERANCE: 0.1,
  
  // Head neutral (nose aligned with shoulders)
  HEAD_NEUTRAL_TOLERANCE: 0.1,
  
  // Symmetry (left-right difference)
  SYMMETRY_TOLERANCE: 0.15,
  
  // Minimum visibility for reliable detection
  MIN_VISIBILITY: 0.5,
};

/**
 * Calculates angle between three points in degrees
 * @param {Object} p1 - First point {x, y}
 * @param {Object} vertex - Middle point (vertex) {x, y}
 * @param {Object} p3 - Third point {x, y}
 * @returns {number} Angle in degrees (0-180)
 */
function calculateAngle(p1, vertex, p3) {
  if (!p1 || !vertex || !p3) return null;
  
  const radians = Math.atan2(p3.y - vertex.y, p3.x - vertex.x) - 
                  Math.atan2(p1.y - vertex.y, p1.x - vertex.x);
  let angle = Math.abs(radians * 180.0 / Math.PI);
  
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  
  return angle;
}

/**
 * Gets a landmark with visibility check
 * @param {Array} landmarks - MediaPipe landmarks array
 * @param {number} index - Landmark index
 * @param {number} minVisibility - Minimum visibility threshold
 * @returns {Object|null} Landmark or null if not visible
 */
function getLandmark(landmarks, index, minVisibility = THRESHOLDS.MIN_VISIBILITY) {
  if (!landmarks || !landmarks[index]) return null;
  
  const lm = landmarks[index];
  if (lm.visibility < minVisibility) return null;
  
  return lm;
}

/**
 * Checks if shoulders are level (horizontally aligned)
 * @param {Array} landmarks - MediaPipe pose landmarks
 * @returns {FormCheckResult} Validation result
 */
export function checkShoulderLevel(landmarks) {
  const leftShoulder = getLandmark(landmarks, 11);
  const rightShoulder = getLandmark(landmarks, 12);
  
  if (!leftShoulder || !rightShoulder) {
    return {
      isCorrect: true,
      feedback: '',
      severity: 'info',
      score: 1,
    };
  }
  
  const yDiff = Math.abs(leftShoulder.y - rightShoulder.y);
  const isLevel = yDiff <= THRESHOLDS.SHOULDER_LEVEL_TOLERANCE;
  
  // Calculate score (1 = perfect, 0 = very uneven)
  const score = Math.max(0, 1 - (yDiff / (THRESHOLDS.SHOULDER_LEVEL_TOLERANCE * 3)));
  
  let feedback = '';
  let severity = 'info';
  
  if (!isLevel) {
    if (leftShoulder.y < rightShoulder.y) {
      feedback = 'Lower your left shoulder slightly';
    } else {
      feedback = 'Lower your right shoulder slightly';
    }
    severity = yDiff > THRESHOLDS.SHOULDER_LEVEL_TOLERANCE * 2 ? 'warning' : 'info';
  }
  
  return {
    isCorrect: isLevel,
    feedback,
    severity,
    score,
  };
}

/**
 * Checks if elbow is straight (extended)
 * @param {Array} landmarks - MediaPipe pose landmarks
 * @param {string} side - 'left' | 'right' | 'both'
 * @returns {FormCheckResult} Validation result
 */
export function checkElbowStraight(landmarks, side = 'both') {
  const results = [];
  
  if (side === 'left' || side === 'both') {
    const shoulder = getLandmark(landmarks, 11);
    const elbow = getLandmark(landmarks, 13);
    const wrist = getLandmark(landmarks, 15);
    
    if (shoulder && elbow && wrist) {
      const angle = calculateAngle(shoulder, elbow, wrist);
      const deviation = Math.abs(180 - angle);
      const isStraight = deviation <= THRESHOLDS.ELBOW_STRAIGHT_TOLERANCE;
      const score = Math.max(0, 1 - (deviation / (THRESHOLDS.ELBOW_STRAIGHT_TOLERANCE * 3)));
      
      results.push({
        side: 'left',
        isStraight,
        deviation,
        score,
        angle,
      });
    }
  }
  
  if (side === 'right' || side === 'both') {
    const shoulder = getLandmark(landmarks, 12);
    const elbow = getLandmark(landmarks, 14);
    const wrist = getLandmark(landmarks, 16);
    
    if (shoulder && elbow && wrist) {
      const angle = calculateAngle(shoulder, elbow, wrist);
      const deviation = Math.abs(180 - angle);
      const isStraight = deviation <= THRESHOLDS.ELBOW_STRAIGHT_TOLERANCE;
      const score = Math.max(0, 1 - (deviation / (THRESHOLDS.ELBOW_STRAIGHT_TOLERANCE * 3)));
      
      results.push({
        side: 'right',
        isStraight,
        deviation,
        score,
        angle,
      });
    }
  }
  
  if (results.length === 0) {
    return { isCorrect: true, feedback: '', severity: 'info', score: 1 };
  }
  
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  const allStraight = results.every(r => r.isStraight);
  
  let feedback = '';
  let severity = 'info';
  
  if (!allStraight) {
    const bent = results.find(r => !r.isStraight);
    if (bent) {
      feedback = `Straighten your ${bent.side} arm more`;
      severity = bent.deviation > THRESHOLDS.ELBOW_STRAIGHT_TOLERANCE * 2 ? 'warning' : 'info';
    }
  }
  
  return {
    isCorrect: allStraight,
    feedback,
    severity,
    score: avgScore,
    details: results,
  };
}

/**
 * Checks if elbow is properly bent (for curling exercises)
 * @param {Array} landmarks - MediaPipe pose landmarks
 * @param {string} side - 'left' | 'right' | 'both'
 * @returns {FormCheckResult} Validation result
 */
export function checkElbowBent(landmarks, side = 'both') {
  const results = [];
  
  const checkSide = (shoulderIdx, elbowIdx, wristIdx, sideName) => {
    const shoulder = getLandmark(landmarks, shoulderIdx);
    const elbow = getLandmark(landmarks, elbowIdx);
    const wrist = getLandmark(landmarks, wristIdx);
    
    if (shoulder && elbow && wrist) {
      const angle = calculateAngle(shoulder, elbow, wrist);
      const deviation = Math.abs(180 - angle);
      const isBent = deviation >= THRESHOLDS.ELBOW_BENT_MIN && deviation <= THRESHOLDS.ELBOW_BENT_MAX;
      
      // Score based on how well bent (optimal around 90 degrees = deviation of 90)
      const optimalDeviation = 90;
      const deviationFromOptimal = Math.abs(deviation - optimalDeviation);
      const score = Math.max(0, 1 - (deviationFromOptimal / 90));
      
      results.push({
        side: sideName,
        isBent,
        deviation,
        score,
        angle,
      });
    }
  };
  
  if (side === 'left' || side === 'both') {
    checkSide(11, 13, 15, 'left');
  }
  if (side === 'right' || side === 'both') {
    checkSide(12, 14, 16, 'right');
  }
  
  if (results.length === 0) {
    return { isCorrect: true, feedback: '', severity: 'info', score: 1 };
  }
  
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  const allBent = results.every(r => r.isBent);
  
  let feedback = '';
  let severity = 'info';
  
  if (!allBent) {
    const notBent = results.find(r => !r.isBent);
    if (notBent) {
      if (notBent.deviation < THRESHOLDS.ELBOW_BENT_MIN) {
        feedback = `Bend your ${notBent.side} elbow more`;
      } else {
        feedback = `Keep your ${notBent.side} elbow closer to your body`;
      }
      severity = 'info';
    }
  }
  
  return {
    isCorrect: allBent,
    feedback,
    severity,
    score: avgScore,
    details: results,
  };
}

/**
 * Checks if back/spine is straight
 * Uses shoulder-hip alignment as approximation
 * @param {Array} landmarks - MediaPipe pose landmarks
 * @returns {FormCheckResult} Validation result
 */
export function checkBackStraight(landmarks) {
  const leftShoulder = getLandmark(landmarks, 11);
  const rightShoulder = getLandmark(landmarks, 12);
  const leftHip = getLandmark(landmarks, 23);
  const rightHip = getLandmark(landmarks, 24);
  
  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) {
    return { isCorrect: true, feedback: '', severity: 'info', score: 1 };
  }
  
  // Calculate midpoints
  const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
  const hipMidX = (leftHip.x + rightHip.x) / 2;
  
  // Check horizontal alignment (leaning forward/backward)
  const xDiff = Math.abs(shoulderMidX - hipMidX);
  const isStraight = xDiff <= 0.1; // Tolerance for slight natural curve
  
  const score = Math.max(0, 1 - (xDiff / 0.3));
  
  let feedback = '';
  let severity = 'info';
  
  if (!isStraight) {
    if (shoulderMidX < hipMidX) {
      feedback = 'Sit up straighter - you\'re leaning forward';
    } else {
      feedback = 'Sit up straighter - you\'re leaning back';
    }
    severity = xDiff > 0.15 ? 'warning' : 'info';
  }
  
  return {
    isCorrect: isStraight,
    feedback,
    severity,
    score,
  };
}

/**
 * Checks if knee is properly aligned over ankle
 * @param {Array} landmarks - MediaPipe pose landmarks
 * @param {string} side - 'left' | 'right' | 'both'
 * @returns {FormCheckResult} Validation result
 */
export function checkKneeAlignment(landmarks, side = 'both') {
  const results = [];
  
  const checkSide = (kneeIdx, ankleIdx, sideName) => {
    const knee = getLandmark(landmarks, kneeIdx);
    const ankle = getLandmark(landmarks, ankleIdx);
    
    if (knee && ankle) {
      const xDiff = Math.abs(knee.x - ankle.x);
      const isAligned = xDiff <= THRESHOLDS.KNEE_ALIGNMENT_TOLERANCE;
      const score = Math.max(0, 1 - (xDiff / (THRESHOLDS.KNEE_ALIGNMENT_TOLERANCE * 3)));
      
      results.push({
        side: sideName,
        isAligned,
        xDiff,
        score,
        kneePastAnkle: knee.x < ankle.x, // For detecting knee going too far forward
      });
    }
  };
  
  if (side === 'left' || side === 'both') {
    checkSide(25, 27, 'left');
  }
  if (side === 'right' || side === 'both') {
    checkSide(26, 28, 'right');
  }
  
  if (results.length === 0) {
    return { isCorrect: true, feedback: '', severity: 'info', score: 1 };
  }
  
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  const allAligned = results.every(r => r.isAligned);
  
  let feedback = '';
  let severity = 'info';
  
  if (!allAligned) {
    const misaligned = results.find(r => !r.isAligned);
    if (misaligned) {
      if (misaligned.kneePastAnkle) {
        feedback = `Keep your ${misaligned.side} knee behind your toes`;
        severity = 'warning'; // This is a safety concern
      } else {
        feedback = `Align your ${misaligned.side} knee over your ankle`;
      }
    }
  }
  
  return {
    isCorrect: allAligned,
    feedback,
    severity,
    score: avgScore,
    details: results,
  };
}

/**
 * Checks if wrist is in neutral position (aligned with forearm)
 * @param {Array} landmarks - MediaPipe pose landmarks
 * @param {string} side - 'left' | 'right' | 'both'
 * @returns {FormCheckResult} Validation result
 */
export function checkWristNeutral(landmarks, side = 'both') {
  const results = [];
  
  const checkSide = (elbowIdx, wristIdx, sideName) => {
    const elbow = getLandmark(landmarks, elbowIdx);
    const wrist = getLandmark(landmarks, wristIdx);
    
    if (elbow && wrist) {
      // Check if wrist is roughly aligned with elbow
      const yDiff = Math.abs(wrist.y - elbow.y);
      const isNeutral = true; // Simplified check - full wrist tracking needs hand landmarks
      const score = 1;
      
      results.push({
        side: sideName,
        isNeutral,
        score,
      });
    }
  };
  
  if (side === 'left' || side === 'both') {
    checkSide(13, 15, 'left');
  }
  if (side === 'right' || side === 'both') {
    checkSide(14, 16, 'right');
  }
  
  if (results.length === 0) {
    return { isCorrect: true, feedback: '', severity: 'info', score: 1 };
  }
  
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  const allNeutral = results.every(r => r.isNeutral);
  
  return {
    isCorrect: allNeutral,
    feedback: allNeutral ? '' : 'Keep your wrists straight',
    severity: 'info',
    score: avgScore,
    details: results,
  };
}

/**
 * Checks if head is in neutral position
 * @param {Array} landmarks - MediaPipe pose landmarks
 * @returns {FormCheckResult} Validation result
 */
export function checkHeadNeutral(landmarks) {
  const nose = getLandmark(landmarks, 0);
  const leftShoulder = getLandmark(landmarks, 11);
  const rightShoulder = getLandmark(landmarks, 12);
  
  if (!nose || !leftShoulder || !rightShoulder) {
    return { isCorrect: true, feedback: '', severity: 'info', score: 1 };
  }
  
  // Check if nose is centered between shoulders
  const shoulderMidX = (leftShoulder.x + rightShoulder.x) / 2;
  const xDiff = Math.abs(nose.x - shoulderMidX);
  
  const isNeutral = xDiff <= THRESHOLDS.HEAD_NEUTRAL_TOLERANCE;
  const score = Math.max(0, 1 - (xDiff / (THRESHOLDS.HEAD_NEUTRAL_TOLERANCE * 3)));
  
  let feedback = '';
  let severity = 'info';
  
  if (!isNeutral) {
    if (nose.x < shoulderMidX) {
      feedback = 'Center your head - it\'s tilted left';
    } else {
      feedback = 'Center your head - it\'s tilted right';
    }
    severity = xDiff > THRESHOLDS.HEAD_NEUTRAL_TOLERANCE * 2 ? 'warning' : 'info';
  }
  
  return {
    isCorrect: isNeutral,
    feedback,
    severity,
    score,
  };
}

/**
 * Checks if left and right sides are symmetrical
 * @param {Array} landmarks - MediaPipe pose landmarks
 * @param {string} bodyPart - 'shoulders' | 'hips' | 'elbows' | 'knees'
 * @returns {FormCheckResult} Validation result
 */
export function checkSymmetry(landmarks, bodyPart = 'shoulders') {
  const pairs = {
    shoulders: [11, 12],
    hips: [23, 24],
    elbows: [13, 14],
    knees: [25, 26],
    wrists: [15, 16],
    ankles: [27, 28],
  };
  
  const indices = pairs[bodyPart];
  if (!indices) {
    return { isCorrect: true, feedback: '', severity: 'info', score: 1 };
  }
  
  const left = getLandmark(landmarks, indices[0]);
  const right = getLandmark(landmarks, indices[1]);
  
  if (!left || !right) {
    return { isCorrect: true, feedback: '', severity: 'info', score: 1 };
  }
  
  // Check Y difference (vertical symmetry)
  const yDiff = Math.abs(left.y - right.y);
  const isSymmetric = yDiff <= THRESHOLDS.SYMMETRY_TOLERANCE;
  const score = Math.max(0, 1 - (yDiff / (THRESHOLDS.SYMMETRY_TOLERANCE * 3)));
  
  let feedback = '';
  let severity = 'info';
  
  if (!isSymmetric) {
    feedback = `Keep your ${bodyPart} level`;
    severity = yDiff > THRESHOLDS.SYMMETRY_TOLERANCE * 2 ? 'warning' : 'info';
  }
  
  return {
    isCorrect: isSymmetric,
    feedback,
    severity,
    score,
  };
}

/**
 * Runs multiple form checks and returns combined result
 * @param {Array} landmarks - MediaPipe pose landmarks
 * @param {Array} checks - Array of check names to run
 * @returns {FormCheckResult} Combined validation result
 */
export function runFormChecks(landmarks, checks) {
  const checkFunctions = {
    shoulder_level: checkShoulderLevel,
    elbow_straight: (lm) => checkElbowStraight(lm, 'both'),
    elbow_bent: (lm) => checkElbowBent(lm, 'both'),
    back_straight: checkBackStraight,
    knee_aligned: (lm) => checkKneeAlignment(lm, 'both'),
    wrist_neutral: (lm) => checkWristNeutral(lm, 'both'),
    head_neutral: checkHeadNeutral,
    symmetry: (lm) => checkSymmetry(lm, 'shoulders'),
  };
  
  const results = [];
  
  for (const check of checks) {
    const checkName = check.check || check;
    const checkFn = checkFunctions[checkName];
    
    if (checkFn) {
      const result = checkFn(landmarks);
      results.push({
        check: checkName,
        ...result,
        message: check.message || result.feedback,
      });
    }
  }
  
  // Find the worst result
  const worstResult = results.reduce((worst, current) => {
    if (!current.isCorrect && worst.isCorrect) return current;
    if (!current.isCorrect && !worst.isCorrect && current.score < worst.score) return current;
    return worst;
  }, { isCorrect: true, feedback: '', severity: 'info', score: 1 });
  
  // Calculate average score
  const avgScore = results.length > 0
    ? results.reduce((sum, r) => sum + r.score, 0) / results.length
    : 1;
  
  return {
    isCorrect: results.every(r => r.isCorrect),
    feedback: worstResult.feedback || worstResult.message || '',
    severity: worstResult.severity,
    score: avgScore,
    details: results,
  };
}

/**
 * Gets overall form quality score from landmarks
 * @param {Array} landmarks - MediaPipe pose landmarks
 * @returns {number} Quality score 0-1
 */
export function getOverallFormScore(landmarks) {
  const checks = [
    'shoulder_level',
    'back_straight',
    'head_neutral',
  ];
  
  const result = runFormChecks(landmarks, checks);
  return result.score;
}
