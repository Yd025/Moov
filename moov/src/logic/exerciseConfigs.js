/**
 * Exercise Tracking Configurations
 * 
 * Defines MediaPipe tracking parameters for each exercise including:
 * - Landmark indices for angle calculation
 * - Target angles for rep phases (start/peak)
 * - Bilateral tracking settings
 * - Form validation rules
 * 
 * MediaPipe Pose Landmark Indices:
 * 0: nose, 11: left_shoulder, 12: right_shoulder
 * 13: left_elbow, 14: right_elbow, 15: left_wrist, 16: right_wrist
 * 23: left_hip, 24: right_hip, 25: left_knee, 26: right_knee
 * 27: left_ankle, 28: right_ankle
 */

/**
 * Tracking types
 */
export const TRACKING_TYPES = {
  ANGLE: 'angle',           // Track joint angle
  POSITION: 'position',     // Track landmark position
  ROTATION: 'rotation',     // Track rotational movement
  TIMER: 'timer',           // Timer-based (isometric holds)
  MANUAL: 'manual',         // Manual rep counting
};

/**
 * Form check types
 */
export const FORM_CHECKS = {
  SHOULDER_LEVEL: 'shoulder_level',
  ELBOW_STRAIGHT: 'elbow_straight',
  ELBOW_BENT: 'elbow_bent',
  BACK_STRAIGHT: 'back_straight',
  KNEE_ALIGNED: 'knee_aligned',
  WRIST_NEUTRAL: 'wrist_neutral',
  HEAD_NEUTRAL: 'head_neutral',
  SYMMETRY: 'symmetry',
};

/**
 * Exercise configurations for MediaPipe tracking
 */
export const EXERCISE_CONFIGS = {
  // ============================================
  // ARM EXERCISES
  // ============================================
  
  arm_raises: {
    id: 'arm_raises',
    name: 'Arm Raises',
    tracking: {
      type: TRACKING_TYPES.ANGLE,
      // Track angle at shoulder: hip-shoulder-elbow
      primaryJoints: {
        point1: 23,   // left hip
        vertex: 11,   // left shoulder
        point3: 13,   // left elbow
      },
      secondaryJoints: {
        point1: 24,   // right hip
        vertex: 12,   // right shoulder
        point3: 14,   // right elbow
      },
      bilateral: true,
      // Rep phases: arm down (160°) -> arm raised (60°)
      repPhases: {
        start: { angle: 160, tolerance: 20 },
        peak: { angle: 60, tolerance: 25 },
      },
      // Min visibility for landmarks
      minVisibility: 0.5,
    },
    formRules: [
      { check: FORM_CHECKS.SHOULDER_LEVEL, message: 'Keep your shoulders level' },
      { check: FORM_CHECKS.ELBOW_STRAIGHT, message: 'Keep your arms straight' },
    ],
    cues: {
      start: "Raise your arms to the side",
      peak: "Hold at shoulder height",
      return: "Lower slowly",
    },
  },

  overhead_arm_raises: {
    id: 'overhead_arm_raises',
    name: 'Overhead Arm Raises',
    tracking: {
      type: TRACKING_TYPES.ANGLE,
      primaryJoints: {
        point1: 23,   // left hip
        vertex: 11,   // left shoulder
        point3: 13,   // left elbow
      },
      secondaryJoints: {
        point1: 24,
        vertex: 12,
        point3: 14,
      },
      bilateral: true,
      repPhases: {
        start: { angle: 160, tolerance: 20 },
        peak: { angle: 20, tolerance: 15 },  // Arms overhead
      },
      minVisibility: 0.5,
    },
    formRules: [
      { check: FORM_CHECKS.SHOULDER_LEVEL, message: 'Keep shoulders level' },
      { check: FORM_CHECKS.ELBOW_STRAIGHT, message: 'Extend arms fully' },
      { check: FORM_CHECKS.BACK_STRAIGHT, message: 'Keep your back straight' },
    ],
    cues: {
      start: "Raise your arms overhead",
      peak: "Reach for the ceiling",
      return: "Lower with control",
    },
  },

  bicep_curls_seated: {
    id: 'bicep_curls_seated',
    name: 'Seated Bicep Curls',
    tracking: {
      type: TRACKING_TYPES.ANGLE,
      // Track elbow angle: shoulder-elbow-wrist
      primaryJoints: {
        point1: 11,   // left shoulder
        vertex: 13,   // left elbow
        point3: 15,   // left wrist
      },
      secondaryJoints: {
        point1: 12,
        vertex: 14,
        point3: 16,
      },
      bilateral: true,
      repPhases: {
        start: { angle: 160, tolerance: 15 },  // Arm extended
        peak: { angle: 45, tolerance: 20 },    // Arm curled
      },
      minVisibility: 0.6,
    },
    formRules: [
      { check: FORM_CHECKS.ELBOW_BENT, message: 'Keep elbows close to your body' },
      { check: FORM_CHECKS.WRIST_NEUTRAL, message: 'Keep wrists straight' },
    ],
    cues: {
      start: "Curl your arms up",
      peak: "Squeeze at the top",
      return: "Lower slowly",
    },
  },

  arm_circles: {
    id: 'arm_circles',
    name: 'Arm Circles',
    tracking: {
      type: TRACKING_TYPES.ROTATION,
      // Track wrist position relative to shoulder for circular motion
      trackPoints: [15, 16],  // wrists
      referencePoints: [11, 12],  // shoulders
      bilateral: true,
      repPhases: {
        // Detect full rotation by tracking position changes
        cycleDetection: true,
      },
      minVisibility: 0.5,
    },
    formRules: [
      { check: FORM_CHECKS.ELBOW_STRAIGHT, message: 'Keep arms extended' },
      { check: FORM_CHECKS.SHOULDER_LEVEL, message: 'Keep shoulders relaxed' },
    ],
    cues: {
      start: "Make circles with your arms",
      ongoing: "Keep the circles smooth and controlled",
    },
  },

  boxing_punches: {
    id: 'boxing_punches',
    name: 'Boxing Punches',
    tracking: {
      type: TRACKING_TYPES.ANGLE,
      primaryJoints: {
        point1: 11,
        vertex: 13,
        point3: 15,
      },
      secondaryJoints: {
        point1: 12,
        vertex: 14,
        point3: 16,
      },
      bilateral: true,
      alternating: true,  // Left then right
      repPhases: {
        start: { angle: 60, tolerance: 20 },   // Arm cocked
        peak: { angle: 160, tolerance: 15 },   // Arm extended (punch)
      },
      minVisibility: 0.5,
    },
    formRules: [
      { check: FORM_CHECKS.SHOULDER_LEVEL, message: 'Keep shoulders square' },
    ],
    cues: {
      start: "Punch forward",
      peak: "Extend fully",
      return: "Pull back to guard",
    },
  },

  // ============================================
  // SHOULDER EXERCISES
  // ============================================

  shoulder_rolls: {
    id: 'shoulder_rolls',
    name: 'Shoulder Rolls',
    tracking: {
      type: TRACKING_TYPES.ROTATION,
      trackPoints: [11, 12],  // shoulders
      referencePoints: [23, 24],  // hips for reference
      bilateral: true,
      repPhases: {
        cycleDetection: true,
        minCycleTime: 1.5,  // At least 1.5 seconds per roll
      },
      minVisibility: 0.5,
    },
    formRules: [
      { check: FORM_CHECKS.HEAD_NEUTRAL, message: 'Keep your head still' },
    ],
    cues: {
      start: "Roll shoulders forward",
      ongoing: "Make big, slow circles",
    },
  },

  shoulder_blade_squeezes: {
    id: 'shoulder_blade_squeezes',
    name: 'Shoulder Blade Squeezes',
    tracking: {
      type: TRACKING_TYPES.POSITION,
      // Track distance between shoulders
      trackPoints: [11, 12],
      measureType: 'distance',
      repPhases: {
        start: { distanceRatio: 1.0, tolerance: 0.1 },   // Normal position
        peak: { distanceRatio: 0.85, tolerance: 0.1 },   // Squeezed (shoulders closer)
      },
      minVisibility: 0.6,
    },
    formRules: [
      { check: FORM_CHECKS.BACK_STRAIGHT, message: 'Sit up tall' },
      { check: FORM_CHECKS.HEAD_NEUTRAL, message: 'Keep chin tucked' },
    ],
    cues: {
      start: "Squeeze shoulder blades together",
      peak: "Hold the squeeze",
      return: "Release slowly",
    },
  },

  // ============================================
  // LEG EXERCISES
  // ============================================

  leg_lifts_seated: {
    id: 'leg_lifts_seated',
    name: 'Seated Leg Lifts',
    tracking: {
      type: TRACKING_TYPES.ANGLE,
      // Track hip angle: shoulder-hip-knee
      primaryJoints: {
        point1: 11,   // left shoulder
        vertex: 23,   // left hip
        point3: 25,   // left knee
      },
      secondaryJoints: {
        point1: 12,
        vertex: 24,
        point3: 26,
      },
      bilateral: true,
      alternating: true,
      repPhases: {
        start: { angle: 90, tolerance: 15 },   // Leg down (seated)
        peak: { angle: 120, tolerance: 20 },   // Leg raised
      },
      minVisibility: 0.5,
    },
    formRules: [
      { check: FORM_CHECKS.BACK_STRAIGHT, message: 'Keep your back against the chair' },
      { check: FORM_CHECKS.KNEE_ALIGNED, message: 'Keep knee pointing forward' },
    ],
    cues: {
      start: "Lift your leg",
      peak: "Hold at the top",
      return: "Lower with control",
    },
  },

  leg_extensions: {
    id: 'leg_extensions',
    name: 'Leg Extensions',
    tracking: {
      type: TRACKING_TYPES.ANGLE,
      // Track knee angle: hip-knee-ankle
      primaryJoints: {
        point1: 23,   // left hip
        vertex: 25,   // left knee
        point3: 27,   // left ankle
      },
      secondaryJoints: {
        point1: 24,
        vertex: 26,
        point3: 28,
      },
      bilateral: true,
      alternating: true,
      repPhases: {
        start: { angle: 90, tolerance: 15 },   // Knee bent
        peak: { angle: 170, tolerance: 15 },   // Leg extended
      },
      minVisibility: 0.5,
    },
    formRules: [
      { check: FORM_CHECKS.BACK_STRAIGHT, message: 'Sit up straight' },
    ],
    cues: {
      start: "Straighten your leg",
      peak: "Fully extend",
      return: "Bend back slowly",
    },
  },

  seated_marching: {
    id: 'seated_marching',
    name: 'Seated Marching',
    tracking: {
      type: TRACKING_TYPES.ANGLE,
      primaryJoints: {
        point1: 11,
        vertex: 23,
        point3: 25,
      },
      secondaryJoints: {
        point1: 12,
        vertex: 24,
        point3: 26,
      },
      bilateral: true,
      alternating: true,
      repPhases: {
        start: { angle: 90, tolerance: 10 },
        peak: { angle: 70, tolerance: 15 },  // Knee lifted higher
      },
      minVisibility: 0.5,
    },
    formRules: [
      { check: FORM_CHECKS.BACK_STRAIGHT, message: 'Keep your back straight' },
    ],
    cues: {
      start: "Lift your knee",
      peak: "High knee!",
      return: "Switch legs",
    },
  },

  ankle_circles: {
    id: 'ankle_circles',
    name: 'Ankle Circles',
    tracking: {
      type: TRACKING_TYPES.ROTATION,
      trackPoints: [27, 28],  // ankles
      referencePoints: [25, 26],  // knees
      bilateral: true,
      repPhases: {
        cycleDetection: true,
        minCycleTime: 1.0,
      },
      minVisibility: 0.4,
    },
    formRules: [],
    cues: {
      start: "Circle your ankles",
      ongoing: "Nice smooth circles",
    },
  },

  // ============================================
  // CORE EXERCISES
  // ============================================

  seated_twists: {
    id: 'seated_twists',
    name: 'Seated Twists',
    tracking: {
      type: TRACKING_TYPES.ROTATION,
      // Track shoulder rotation relative to hips
      trackPoints: [11, 12],  // shoulders
      referencePoints: [23, 24],  // hips
      measureType: 'rotation',
      repPhases: {
        // Detect twist by shoulder-hip alignment changes
        rotationThreshold: 20,  // degrees
        alternating: true,
      },
      minVisibility: 0.5,
    },
    formRules: [
      { check: FORM_CHECKS.BACK_STRAIGHT, message: 'Sit up tall while twisting' },
    ],
    cues: {
      start: "Rotate to the left",
      peak: "Feel the stretch",
      return: "Rotate to the right",
    },
  },

  back_extensions_seated: {
    id: 'back_extensions_seated',
    name: 'Seated Back Extensions',
    tracking: {
      type: TRACKING_TYPES.ANGLE,
      // Track spine angle approximation using shoulder-hip-knee
      primaryJoints: {
        point1: 0,    // nose (for head position)
        vertex: 11,   // shoulder
        point3: 23,   // hip
      },
      repPhases: {
        start: { angle: 160, tolerance: 15 },  // Upright
        peak: { angle: 140, tolerance: 15 },   // Slight extension
      },
      minVisibility: 0.5,
    },
    formRules: [
      { check: FORM_CHECKS.HEAD_NEUTRAL, message: 'Keep your head aligned' },
    ],
    cues: {
      start: "Gently arch your back",
      peak: "Open your chest",
      return: "Return to neutral",
    },
  },

  // ============================================
  // STANDING EXERCISES
  // ============================================

  squats: {
    id: 'squats',
    name: 'Squats',
    tracking: {
      type: TRACKING_TYPES.ANGLE,
      primaryJoints: {
        point1: 23,
        vertex: 25,
        point3: 27,
      },
      secondaryJoints: {
        point1: 24,
        vertex: 26,
        point3: 28,
      },
      bilateral: true,
      repPhases: {
        start: { angle: 170, tolerance: 10 },  // Standing
        peak: { angle: 90, tolerance: 20 },    // Squatted
      },
      minVisibility: 0.6,
    },
    formRules: [
      { check: FORM_CHECKS.KNEE_ALIGNED, message: 'Keep knees over toes' },
      { check: FORM_CHECKS.BACK_STRAIGHT, message: 'Keep your back straight' },
    ],
    cues: {
      start: "Lower down like sitting",
      peak: "Go as low as comfortable",
      return: "Push through heels to stand",
    },
  },

  lunges: {
    id: 'lunges',
    name: 'Lunges',
    tracking: {
      type: TRACKING_TYPES.ANGLE,
      primaryJoints: {
        point1: 23,
        vertex: 25,
        point3: 27,
      },
      alternating: true,
      repPhases: {
        start: { angle: 170, tolerance: 10 },
        peak: { angle: 90, tolerance: 20 },
      },
      minVisibility: 0.5,
    },
    formRules: [
      { check: FORM_CHECKS.KNEE_ALIGNED, message: 'Front knee over ankle' },
      { check: FORM_CHECKS.BACK_STRAIGHT, message: 'Keep torso upright' },
    ],
    cues: {
      start: "Step forward and lower",
      peak: "Both knees at 90 degrees",
      return: "Push back to start",
    },
  },

  calf_raises: {
    id: 'calf_raises',
    name: 'Calf Raises',
    tracking: {
      type: TRACKING_TYPES.POSITION,
      // Track ankle height relative to starting position
      trackPoints: [27, 28],  // ankles
      referencePoints: [29, 30],  // heels
      measureType: 'height',
      repPhases: {
        start: { heightChange: 0, tolerance: 0.02 },
        peak: { heightChange: 0.05, tolerance: 0.02 },  // Raised on toes
      },
      minVisibility: 0.4,
    },
    formRules: [
      { check: FORM_CHECKS.BACK_STRAIGHT, message: 'Stand tall' },
    ],
    cues: {
      start: "Rise up on your toes",
      peak: "Squeeze at the top",
      return: "Lower slowly",
    },
  },

  marching_in_place: {
    id: 'marching_in_place',
    name: 'Marching in Place',
    tracking: {
      type: TRACKING_TYPES.ANGLE,
      primaryJoints: {
        point1: 11,
        vertex: 23,
        point3: 25,
      },
      secondaryJoints: {
        point1: 12,
        vertex: 24,
        point3: 26,
      },
      bilateral: true,
      alternating: true,
      repPhases: {
        start: { angle: 160, tolerance: 15 },
        peak: { angle: 90, tolerance: 20 },
      },
      minVisibility: 0.5,
    },
    formRules: [
      { check: FORM_CHECKS.BACK_STRAIGHT, message: 'Stand tall while marching' },
    ],
    cues: {
      start: "Lift your knee high",
      peak: "Knee to hip height",
      return: "Switch legs",
    },
  },

  // ============================================
  // LYING/SUPINE EXERCISES
  // ============================================

  supine_arm_raises: {
    id: 'supine_arm_raises',
    name: 'Lying Arm Raises',
    tracking: {
      type: TRACKING_TYPES.ANGLE,
      primaryJoints: {
        point1: 23,
        vertex: 11,
        point3: 15,  // Use wrist for better tracking when lying
      },
      secondaryJoints: {
        point1: 24,
        vertex: 12,
        point3: 16,
      },
      bilateral: true,
      repPhases: {
        start: { angle: 90, tolerance: 20 },   // Arms at sides
        peak: { angle: 10, tolerance: 15 },    // Arms overhead
      },
      minVisibility: 0.4,
    },
    formRules: [
      { check: FORM_CHECKS.ELBOW_STRAIGHT, message: 'Keep arms straight' },
    ],
    cues: {
      start: "Raise arms overhead",
      peak: "Reach toward the ceiling",
      return: "Lower to sides",
    },
  },

  supine_leg_raises: {
    id: 'supine_leg_raises',
    name: 'Lying Leg Raises',
    tracking: {
      type: TRACKING_TYPES.ANGLE,
      primaryJoints: {
        point1: 11,
        vertex: 23,
        point3: 27,  // Use ankle for leg raise detection
      },
      secondaryJoints: {
        point1: 12,
        vertex: 24,
        point3: 28,
      },
      bilateral: true,
      alternating: true,
      repPhases: {
        start: { angle: 180, tolerance: 10 },  // Leg flat
        peak: { angle: 90, tolerance: 20 },    // Leg raised 90°
      },
      minVisibility: 0.4,
    },
    formRules: [
      { check: FORM_CHECKS.BACK_STRAIGHT, message: 'Keep lower back pressed down' },
    ],
    cues: {
      start: "Lift your leg",
      peak: "Keep leg straight",
      return: "Lower with control",
    },
  },

  bridge: {
    id: 'bridge',
    name: 'Glute Bridge',
    tracking: {
      type: TRACKING_TYPES.ANGLE,
      // Track hip extension: shoulder-hip-knee
      primaryJoints: {
        point1: 11,
        vertex: 23,
        point3: 25,
      },
      repPhases: {
        start: { angle: 90, tolerance: 15 },   // Hips down
        peak: { angle: 160, tolerance: 15 },   // Hips raised
      },
      minVisibility: 0.5,
    },
    formRules: [
      { check: FORM_CHECKS.SYMMETRY, message: 'Keep hips level' },
    ],
    cues: {
      start: "Lift your hips",
      peak: "Squeeze glutes at top",
      return: "Lower slowly",
    },
  },

  // ============================================
  // TIMER-BASED EXERCISES
  // ============================================

  deep_breathing: {
    id: 'deep_breathing',
    name: 'Deep Breathing',
    tracking: {
      type: TRACKING_TYPES.TIMER,
      timerSettings: {
        inhaleSeconds: 4,
        holdSeconds: 2,
        exhaleSeconds: 4,
        cycleCount: 5,
      },
    },
    formRules: [],
    cues: {
      inhale: "Breathe in deeply",
      hold: "Hold your breath",
      exhale: "Breathe out slowly",
    },
  },

  neck_stretches: {
    id: 'neck_stretches',
    name: 'Neck Stretches',
    tracking: {
      type: TRACKING_TYPES.TIMER,
      timerSettings: {
        holdSeconds: 15,
        sides: ['left', 'right', 'forward'],
      },
    },
    formRules: [
      { check: FORM_CHECKS.SHOULDER_LEVEL, message: 'Keep shoulders relaxed' },
    ],
    cues: {
      start: "Tilt your head slowly",
      hold: "Feel the gentle stretch",
      return: "Return to center",
    },
  },

  hand_squeezes: {
    id: 'hand_squeezes',
    name: 'Hand Squeezes',
    tracking: {
      type: TRACKING_TYPES.TIMER,
      timerSettings: {
        squeezeSeconds: 3,
        releaseSeconds: 2,
        reps: 15,
      },
    },
    formRules: [],
    cues: {
      squeeze: "Squeeze tight",
      release: "Release and relax",
    },
  },
};

/**
 * Gets exercise config by ID
 * @param {string} exerciseId - Exercise ID
 * @returns {Object|null} Exercise config or null
 */
export function getExerciseConfig(exerciseId) {
  return EXERCISE_CONFIGS[exerciseId] || null;
}

/**
 * Gets all exercise IDs with tracking support
 * @returns {Array} Array of exercise IDs
 */
export function getTrackableExerciseIds() {
  return Object.entries(EXERCISE_CONFIGS)
    .filter(([_, config]) => config.tracking.type !== TRACKING_TYPES.MANUAL)
    .map(([id]) => id);
}

/**
 * Gets tracking config for an exercise
 * @param {string} exerciseId - Exercise ID
 * @returns {Object|null} Tracking config or null
 */
export function getTrackingConfig(exerciseId) {
  const config = EXERCISE_CONFIGS[exerciseId];
  return config?.tracking || null;
}

/**
 * Gets form rules for an exercise
 * @param {string} exerciseId - Exercise ID
 * @returns {Array} Form rules array
 */
export function getFormRules(exerciseId) {
  const config = EXERCISE_CONFIGS[exerciseId];
  return config?.formRules || [];
}

/**
 * Gets verbal cues for an exercise
 * @param {string} exerciseId - Exercise ID
 * @returns {Object} Cues object
 */
export function getCues(exerciseId) {
  const config = EXERCISE_CONFIGS[exerciseId];
  return config?.cues || {};
}

/**
 * Checks if an exercise supports automatic rep detection
 * @param {string} exerciseId - Exercise ID
 * @returns {boolean} True if auto-detection is supported
 */
export function supportsAutoDetection(exerciseId) {
  const config = EXERCISE_CONFIGS[exerciseId];
  if (!config) return false;
  
  const trackingType = config.tracking?.type;
  return [TRACKING_TYPES.ANGLE, TRACKING_TYPES.POSITION, TRACKING_TYPES.ROTATION].includes(trackingType);
}
