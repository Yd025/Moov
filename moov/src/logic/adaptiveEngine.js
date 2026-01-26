/**
 * Adaptive Difficulty Engine
 * 
 * Monitors user performance in real-time and adjusts exercise parameters
 * to maintain optimal challenge level without frustration.
 * 
 * Features:
 * - Real-time performance monitoring
 * - Automatic difficulty adjustment
 * - Form quality tracking
 * - Fatigue detection
 * - Personalized encouragement
 */

/**
 * Performance thresholds for adjustments
 */
const THRESHOLDS = {
  // Range of motion thresholds
  ROM_STRUGGLING: 0.7,      // Below 70% of target = struggling
  ROM_EXCELLING: 1.1,       // Above 110% of target = excelling
  
  // Form quality thresholds
  FORM_POOR: 0.5,           // Below 50% = poor form
  FORM_GOOD: 0.8,           // Above 80% = good form
  
  // Rep timing thresholds (seconds)
  REP_TOO_SLOW: 8,          // Taking more than 8s per rep = struggling
  REP_TOO_FAST: 0.5,        // Less than 0.5s = probably not doing it properly
  
  // Window sizes for averaging
  RECENT_WINDOW: 5,         // Last 5 reps for recent performance
  SESSION_WINDOW: 20,       // Last 20 reps for session performance
  
  // Fatigue detection
  FATIGUE_DECLINE_RATE: 0.15,  // 15% decline in performance indicates fatigue
};

/**
 * Adjustment factors
 */
const ADJUSTMENTS = {
  // Angle/range adjustments
  ANGLE_REDUCE: 0.85,       // Reduce target angle by 15%
  ANGLE_INCREASE: 1.1,      // Increase target angle by 10%
  
  // Rep count adjustments
  REPS_REDUCE: 0.75,        // Reduce reps by 25%
  REPS_INCREASE: 1.2,       // Increase reps by 20%
  
  // Rest time recommendations (seconds)
  REST_NORMAL: 5,
  REST_EXTENDED: 10,
  REST_FATIGUE: 20,
};

/**
 * Encouragement types based on performance
 */
const ENCOURAGEMENT_TYPES = {
  STRUGGLING: 'struggling',
  IMPROVING: 'improving',
  STEADY: 'steady',
  EXCELLING: 'excelling',
  FATIGUED: 'fatigued',
};

/**
 * AdaptiveEngine class
 * Manages real-time performance monitoring and difficulty adjustment
 */
export class AdaptiveEngine {
  constructor(userProfile = {}) {
    this.userProfile = userProfile;
    this.baselineCapabilities = userProfile.movementBox || null;
    
    // Session metrics
    this.sessionMetrics = {
      startTime: Date.now(),
      completedReps: 0,
      skippedExercises: 0,
      totalExercises: 0,
      repTimes: [],
      formQualityScores: [],
      rangeOfMotionHistory: [],
      angleHistory: [],
    };
    
    // Current exercise metrics
    this.currentExercise = null;
    this.exerciseMetrics = {
      startTime: null,
      reps: 0,
      targetReps: 0,
      repTimes: [],
      formScores: [],
      romScores: [],
      anglesAchieved: [],
    };
    
    // Adjustment history
    this.adjustmentHistory = [];
  }

  /**
   * Starts tracking a new exercise
   * @param {Object} exercise - Exercise object
   */
  startExercise(exercise) {
    this.currentExercise = exercise;
    this.exerciseMetrics = {
      startTime: Date.now(),
      reps: 0,
      targetReps: exercise.reps || 10,
      repTimes: [],
      formScores: [],
      romScores: [],
      anglesAchieved: [],
    };
    this.sessionMetrics.totalExercises++;
  }

  /**
   * Records performance data for a completed rep
   * @param {Object} metrics - Rep performance metrics
   * @returns {Object} Adjustment recommendations
   */
  recordRepPerformance(metrics) {
    const {
      repTime = 2,
      angleAchieved = null,
      targetAngle = null,
      formScore = 1,
      landmarks = null,
    } = metrics;
    
    const now = Date.now();
    const lastRepTime = this.exerciseMetrics.repTimes.length > 0
      ? this.exerciseMetrics.repTimes[this.exerciseMetrics.repTimes.length - 1].timestamp
      : this.exerciseMetrics.startTime;
    const actualRepTime = (now - lastRepTime) / 1000;
    
    // Record to exercise metrics
    this.exerciseMetrics.reps++;
    this.exerciseMetrics.repTimes.push({ time: actualRepTime, timestamp: now });
    this.exerciseMetrics.formScores.push(formScore);
    
    // Calculate ROM if angles are available
    let romScore = 1;
    if (angleAchieved !== null && targetAngle !== null && targetAngle !== 0) {
      romScore = angleAchieved / targetAngle;
      this.exerciseMetrics.romScores.push(romScore);
      this.exerciseMetrics.anglesAchieved.push(angleAchieved);
    }
    
    // Record to session metrics
    this.sessionMetrics.completedReps++;
    this.sessionMetrics.repTimes.push(actualRepTime);
    this.sessionMetrics.formQualityScores.push(formScore);
    this.sessionMetrics.rangeOfMotionHistory.push(romScore);
    if (angleAchieved !== null) {
      this.sessionMetrics.angleHistory.push(angleAchieved);
    }
    
    // Calculate and return adjustments
    return this.calculateAdjustments();
  }

  /**
   * Calculates adjustment recommendations based on recent performance
   * @returns {Object} Adjustment recommendations
   */
  calculateAdjustments() {
    const recentForm = this.getRecentAverage('formScores', THRESHOLDS.RECENT_WINDOW);
    const recentROM = this.getRecentAverage('romScores', THRESHOLDS.RECENT_WINDOW);
    const recentRepTime = this.getRecentAverage('repTimes', THRESHOLDS.RECENT_WINDOW, 'time');
    
    const adjustments = {
      // Angle/target modifications
      angleModifier: 1.0,
      
      // Rep count modifications
      repModifier: 1.0,
      suggestedReps: this.exerciseMetrics.targetReps,
      
      // Rest recommendations
      suggestRest: false,
      restDuration: ADJUSTMENTS.REST_NORMAL,
      
      // Encouragement
      encouragementType: ENCOURAGEMENT_TYPES.STEADY,
      
      // Verbal cue suggestions
      suggestedCue: null,
      
      // Performance summary
      performance: {
        formQuality: recentForm,
        rangeOfMotion: recentROM,
        repTime: recentRepTime,
        repsCompleted: this.exerciseMetrics.reps,
        repsRemaining: Math.max(0, this.exerciseMetrics.targetReps - this.exerciseMetrics.reps),
      },
    };
    
    // Check for struggling (ROM < 70% or poor form)
    if (recentROM < THRESHOLDS.ROM_STRUGGLING || recentForm < THRESHOLDS.FORM_POOR) {
      adjustments.angleModifier = ADJUSTMENTS.ANGLE_REDUCE;
      adjustments.repModifier = ADJUSTMENTS.REPS_REDUCE;
      adjustments.suggestedReps = Math.max(3, Math.floor(this.exerciseMetrics.targetReps * ADJUSTMENTS.REPS_REDUCE));
      adjustments.encouragementType = ENCOURAGEMENT_TYPES.STRUGGLING;
      adjustments.suggestedCue = this.getStrugglingCue(recentForm, recentROM);
    }
    // Check for excelling (ROM > 110% with good form)
    else if (recentROM > THRESHOLDS.ROM_EXCELLING && recentForm > THRESHOLDS.FORM_GOOD) {
      adjustments.angleModifier = ADJUSTMENTS.ANGLE_INCREASE;
      adjustments.repModifier = ADJUSTMENTS.REPS_INCREASE;
      adjustments.suggestedReps = Math.min(20, Math.ceil(this.exerciseMetrics.targetReps * ADJUSTMENTS.REPS_INCREASE));
      adjustments.encouragementType = ENCOURAGEMENT_TYPES.EXCELLING;
      adjustments.suggestedCue = this.getExcellingCue();
    }
    // Check for fatigue
    else if (this.isPerformanceDeclining()) {
      adjustments.suggestRest = true;
      adjustments.restDuration = ADJUSTMENTS.REST_FATIGUE;
      adjustments.repModifier = ADJUSTMENTS.REPS_REDUCE;
      adjustments.encouragementType = ENCOURAGEMENT_TYPES.FATIGUED;
      adjustments.suggestedCue = "Take a breather if you need to. You're doing great!";
    }
    // Check if form could be better
    else if (recentForm < THRESHOLDS.FORM_GOOD && recentForm >= THRESHOLDS.FORM_POOR) {
      adjustments.suggestedCue = "Focus on your form - quality over speed!";
    }
    // Check for improvement
    else if (this.isPerformanceImproving()) {
      adjustments.encouragementType = ENCOURAGEMENT_TYPES.IMPROVING;
      adjustments.suggestedCue = this.getImprovingCue();
    }
    
    // Store adjustment in history
    this.adjustmentHistory.push({
      timestamp: Date.now(),
      adjustments: { ...adjustments },
      repNumber: this.exerciseMetrics.reps,
    });
    
    return adjustments;
  }

  /**
   * Gets average of recent values from exercise metrics
   */
  getRecentAverage(metricName, windowSize, subKey = null) {
    const data = this.exerciseMetrics[metricName] || [];
    if (data.length === 0) return 1;
    
    const recent = data.slice(-windowSize);
    const values = subKey ? recent.map(item => item[subKey]) : recent;
    
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Gets average from session metrics
   */
  getSessionAverage(metricName, windowSize = THRESHOLDS.SESSION_WINDOW) {
    const data = this.sessionMetrics[metricName] || [];
    if (data.length === 0) return 1;
    
    const recent = data.slice(-windowSize);
    return recent.reduce((sum, val) => sum + val, 0) / recent.length;
  }

  /**
   * Checks if performance is declining (fatigue indicator)
   */
  isPerformanceDeclining() {
    const scores = this.exerciseMetrics.formScores;
    if (scores.length < 6) return false;
    
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    // Check if second half is significantly worse than first half
    return (firstAvg - secondAvg) / firstAvg > THRESHOLDS.FATIGUE_DECLINE_RATE;
  }

  /**
   * Checks if performance is improving
   */
  isPerformanceImproving() {
    const scores = this.exerciseMetrics.formScores;
    if (scores.length < 4) return false;
    
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    // Check if second half is better than first half
    return secondAvg > firstAvg * 1.1;
  }

  /**
   * Gets a cue for when user is struggling
   */
  getStrugglingCue(formScore, romScore) {
    if (romScore < THRESHOLDS.ROM_STRUGGLING) {
      return "Try a smaller movement - even small movements count!";
    }
    if (formScore < THRESHOLDS.FORM_POOR) {
      return "Slow down and focus on the movement. You've got this!";
    }
    return "Take your time. Every rep matters!";
  }

  /**
   * Gets a cue for when user is excelling
   */
  getExcellingCue() {
    const cues = [
      "Excellent form! You're doing amazing!",
      "Wow, great range of motion!",
      "You're crushing it! Keep going!",
      "Perfect! Ready for a bigger challenge?",
    ];
    return cues[Math.floor(Math.random() * cues.length)];
  }

  /**
   * Gets a cue for when user is improving
   */
  getImprovingCue() {
    const cues = [
      "You're getting better with each rep!",
      "Nice improvement! Keep it up!",
      "That's the way! Your form is improving!",
      "Great progress!",
    ];
    return cues[Math.floor(Math.random() * cues.length)];
  }

  /**
   * Records a skipped exercise
   */
  recordSkippedExercise() {
    this.sessionMetrics.skippedExercises++;
  }

  /**
   * Gets session summary
   */
  getSessionSummary() {
    const duration = (Date.now() - this.sessionMetrics.startTime) / 1000 / 60; // minutes
    const avgForm = this.getSessionAverage('formQualityScores');
    const avgROM = this.getSessionAverage('rangeOfMotionHistory');
    
    return {
      duration: Math.round(duration),
      totalReps: this.sessionMetrics.completedReps,
      totalExercises: this.sessionMetrics.totalExercises,
      skippedExercises: this.sessionMetrics.skippedExercises,
      averageFormQuality: Math.round(avgForm * 100),
      averageRangeOfMotion: Math.round(avgROM * 100),
      adjustmentsMade: this.adjustmentHistory.length,
    };
  }

  /**
   * Gets exercise summary
   */
  getExerciseSummary() {
    if (!this.currentExercise) return null;
    
    return {
      exerciseName: this.currentExercise.name,
      completedReps: this.exerciseMetrics.reps,
      targetReps: this.exerciseMetrics.targetReps,
      completionRate: this.exerciseMetrics.reps / this.exerciseMetrics.targetReps,
      averageFormScore: this.getRecentAverage('formScores', 100),
      averageROM: this.getRecentAverage('romScores', 100),
      totalTime: (Date.now() - this.exerciseMetrics.startTime) / 1000,
    };
  }

  /**
   * Suggests modifications for the next exercise based on session performance
   */
  suggestNextExerciseModifications() {
    const sessionForm = this.getSessionAverage('formQualityScores');
    const sessionROM = this.getSessionAverage('rangeOfMotionHistory');
    
    const mods = {
      rangeModifier: 'full',
      speedModifier: 'normal',
      repsModifier: 'standard',
    };
    
    // If struggling overall, suggest easier modifications
    if (sessionForm < THRESHOLDS.FORM_GOOD || sessionROM < THRESHOLDS.ROM_STRUGGLING) {
      mods.rangeModifier = 'partial';
      mods.speedModifier = 'slow';
      mods.repsModifier = 'low';
    }
    // If excelling overall, suggest harder modifications
    else if (sessionForm > 0.9 && sessionROM > THRESHOLDS.ROM_EXCELLING) {
      mods.rangeModifier = 'extended';
      mods.speedModifier = 'normal';
      mods.repsModifier = 'high';
    }
    
    return mods;
  }

  /**
   * Resets for a new session
   */
  reset() {
    this.sessionMetrics = {
      startTime: Date.now(),
      completedReps: 0,
      skippedExercises: 0,
      totalExercises: 0,
      repTimes: [],
      formQualityScores: [],
      rangeOfMotionHistory: [],
      angleHistory: [],
    };
    this.currentExercise = null;
    this.exerciseMetrics = {
      startTime: null,
      reps: 0,
      targetReps: 0,
      repTimes: [],
      formScores: [],
      romScores: [],
      anglesAchieved: [],
    };
    this.adjustmentHistory = [];
  }
}

/**
 * Creates and returns a new AdaptiveEngine instance
 * @param {Object} userProfile - User's profile
 * @returns {AdaptiveEngine} New engine instance
 */
export function createAdaptiveEngine(userProfile) {
  return new AdaptiveEngine(userProfile);
}

/**
 * Hook-friendly function to get adjustments
 * Useful for functional components
 */
export function calculateQuickAdjustment(performance) {
  const {
    completedReps = 0,
    targetReps = 10,
    avgFormScore = 1,
    avgROM = 1,
  } = performance;
  
  const completionRate = completedReps / targetReps;
  
  // Quick determination
  if (avgROM < THRESHOLDS.ROM_STRUGGLING || avgFormScore < THRESHOLDS.FORM_POOR) {
    return {
      recommendation: 'easier',
      angleModifier: ADJUSTMENTS.ANGLE_REDUCE,
      message: 'Try smaller movements',
    };
  }
  
  if (avgROM > THRESHOLDS.ROM_EXCELLING && avgFormScore > THRESHOLDS.FORM_GOOD && completionRate >= 1) {
    return {
      recommendation: 'harder',
      angleModifier: ADJUSTMENTS.ANGLE_INCREASE,
      message: 'Great job! Try going bigger!',
    };
  }
  
  return {
    recommendation: 'same',
    angleModifier: 1.0,
    message: 'Perfect pace!',
  };
}
