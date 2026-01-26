/**
 * Exercise Template System
 * 
 * A composable system that can generate 48,000+ exercise variations by combining:
 * - 30 base movement patterns
 * - 20 body parts with MediaPipe landmark mappings
 * - 5 position levels (bedridden → fully mobile)
 * - Multiple difficulty modifiers (range, speed, resistance, hold, reps)
 * 
 * This enables personalized exercises for users across the full ability spectrum.
 */

// ============================================
// BASE MOVEMENT PATTERNS (30 patterns)
// ============================================
export const BASE_MOVEMENTS = {
  // Raising movements
  raise: { 
    verb: 'Raise', 
    pastTense: 'Raised',
    trackingType: 'angle_increase',
    description: 'Lift upward against gravity',
    defaultReps: 10,
  },
  lift: { 
    verb: 'Lift', 
    pastTense: 'Lifted',
    trackingType: 'angle_increase',
    description: 'Elevate from resting position',
    defaultReps: 10,
  },
  
  // Lowering movements
  lower: { 
    verb: 'Lower', 
    pastTense: 'Lowered',
    trackingType: 'angle_decrease',
    description: 'Move downward with control',
    defaultReps: 10,
  },
  drop: { 
    verb: 'Drop', 
    pastTense: 'Dropped',
    trackingType: 'angle_decrease',
    description: 'Release downward gently',
    defaultReps: 8,
  },
  
  // Flexion movements
  curl: { 
    verb: 'Curl', 
    pastTense: 'Curled',
    trackingType: 'angle_flex',
    description: 'Bend joint to decrease angle',
    defaultReps: 12,
  },
  bend: { 
    verb: 'Bend', 
    pastTense: 'Bent',
    trackingType: 'angle_flex',
    description: 'Flex at joint',
    defaultReps: 10,
  },
  fold: { 
    verb: 'Fold', 
    pastTense: 'Folded',
    trackingType: 'angle_flex',
    description: 'Bring segments together',
    defaultReps: 8,
  },
  
  // Extension movements
  extend: { 
    verb: 'Extend', 
    pastTense: 'Extended',
    trackingType: 'angle_extend',
    description: 'Straighten joint to increase angle',
    defaultReps: 10,
  },
  straighten: { 
    verb: 'Straighten', 
    pastTense: 'Straightened',
    trackingType: 'angle_extend',
    description: 'Bring to full extension',
    defaultReps: 10,
  },
  reach: { 
    verb: 'Reach', 
    pastTense: 'Reached',
    trackingType: 'angle_extend',
    description: 'Extend outward toward target',
    defaultReps: 10,
  },
  
  // Rotation movements
  rotate: { 
    verb: 'Rotate', 
    pastTense: 'Rotated',
    trackingType: 'rotation',
    description: 'Turn around axis',
    defaultReps: 10,
  },
  twist: { 
    verb: 'Twist', 
    pastTense: 'Twisted',
    trackingType: 'rotation',
    description: 'Rotate torso or limb',
    defaultReps: 10,
  },
  turn: { 
    verb: 'Turn', 
    pastTense: 'Turned',
    trackingType: 'rotation',
    description: 'Rotate to face direction',
    defaultReps: 8,
  },
  
  // Circular movements
  circle: { 
    verb: 'Circle', 
    pastTense: 'Circled',
    trackingType: 'circular',
    description: 'Move in circular path',
    defaultReps: 10,
  },
  roll: { 
    verb: 'Roll', 
    pastTense: 'Rolled',
    trackingType: 'circular',
    description: 'Rotate continuously',
    defaultReps: 10,
  },
  
  // Isometric movements
  squeeze: { 
    verb: 'Squeeze', 
    pastTense: 'Squeezed',
    trackingType: 'isometric',
    description: 'Contract muscles without movement',
    defaultReps: 10,
    defaultHold: 3,
  },
  hold: { 
    verb: 'Hold', 
    pastTense: 'Held',
    trackingType: 'isometric',
    description: 'Maintain position under tension',
    defaultReps: 5,
    defaultHold: 5,
  },
  tighten: { 
    verb: 'Tighten', 
    pastTense: 'Tightened',
    trackingType: 'isometric',
    description: 'Contract and maintain',
    defaultReps: 8,
    defaultHold: 3,
  },
  
  // Stretch movements
  stretch: { 
    verb: 'Stretch', 
    pastTense: 'Stretched',
    trackingType: 'hold',
    description: 'Lengthen muscles gently',
    defaultReps: 5,
    defaultHold: 10,
  },
  lengthen: { 
    verb: 'Lengthen', 
    pastTense: 'Lengthened',
    trackingType: 'hold',
    description: 'Extend to full length',
    defaultReps: 5,
    defaultHold: 8,
  },
  
  // Push/Pull movements
  push: { 
    verb: 'Push', 
    pastTense: 'Pushed',
    trackingType: 'angle_extend',
    description: 'Press away from body',
    defaultReps: 10,
  },
  press: { 
    verb: 'Press', 
    pastTense: 'Pressed',
    trackingType: 'angle_extend',
    description: 'Apply pressure outward',
    defaultReps: 10,
  },
  pull: { 
    verb: 'Pull', 
    pastTense: 'Pulled',
    trackingType: 'angle_flex',
    description: 'Draw toward body',
    defaultReps: 10,
  },
  row: { 
    verb: 'Row', 
    pastTense: 'Rowed',
    trackingType: 'angle_flex',
    description: 'Pull with rowing motion',
    defaultReps: 12,
  },
  
  // Abduction/Adduction
  spread: { 
    verb: 'Spread', 
    pastTense: 'Spread',
    trackingType: 'abduction',
    description: 'Move away from midline',
    defaultReps: 10,
  },
  open: { 
    verb: 'Open', 
    pastTense: 'Opened',
    trackingType: 'abduction',
    description: 'Separate or widen',
    defaultReps: 10,
  },
  close: { 
    verb: 'Close', 
    pastTense: 'Closed',
    trackingType: 'adduction',
    description: 'Bring toward midline',
    defaultReps: 10,
  },
  
  // Breathing
  breathe: { 
    verb: 'Breathe', 
    pastTense: 'Breathed',
    trackingType: 'breathing',
    description: 'Controlled respiration',
    defaultReps: 5,
    defaultHold: 4,
  },
  
  // Tapping/Rhythmic
  tap: { 
    verb: 'Tap', 
    pastTense: 'Tapped',
    trackingType: 'rhythmic',
    description: 'Light rhythmic contact',
    defaultReps: 20,
  },
  march: { 
    verb: 'March', 
    pastTense: 'Marched',
    trackingType: 'alternating',
    description: 'Alternating leg lifts',
    defaultReps: 20,
  },
};

// ============================================
// BODY PARTS WITH LANDMARK MAPPINGS (20+ parts)
// ============================================
export const BODY_PARTS = {
  // Head and neck
  head: {
    name: 'Head',
    landmarks: [0, 7, 8], // nose, left ear, right ear
    bilateral: null,
    category: 'head_neck',
    canTrackAngle: false,
  },
  neck: {
    name: 'Neck',
    landmarks: [0, 11, 12], // nose, shoulders
    bilateral: null,
    category: 'head_neck',
    canTrackAngle: true,
  },
  
  // Shoulders
  left_shoulder: {
    name: 'Left Shoulder',
    landmarks: [11, 13, 23], // shoulder, elbow, hip
    bilateral: 'right_shoulder',
    category: 'upper_body',
    canTrackAngle: true,
    angleJoints: { point1: 13, vertex: 11, point3: 23 },
  },
  right_shoulder: {
    name: 'Right Shoulder',
    landmarks: [12, 14, 24], // shoulder, elbow, hip
    bilateral: 'left_shoulder',
    category: 'upper_body',
    canTrackAngle: true,
    angleJoints: { point1: 14, vertex: 12, point3: 24 },
  },
  
  // Arms (upper arm angle - shoulder to elbow)
  left_upper_arm: {
    name: 'Left Upper Arm',
    landmarks: [11, 13], // shoulder to elbow
    bilateral: 'right_upper_arm',
    category: 'arms',
    canTrackAngle: true,
    angleJoints: { point1: 23, vertex: 11, point3: 13 }, // hip-shoulder-elbow
  },
  right_upper_arm: {
    name: 'Right Upper Arm',
    landmarks: [12, 14],
    bilateral: 'left_upper_arm',
    category: 'arms',
    canTrackAngle: true,
    angleJoints: { point1: 24, vertex: 12, point3: 14 },
  },
  
  // Elbows
  left_elbow: {
    name: 'Left Elbow',
    landmarks: [11, 13, 15], // shoulder, elbow, wrist
    bilateral: 'right_elbow',
    category: 'arms',
    canTrackAngle: true,
    angleJoints: { point1: 11, vertex: 13, point3: 15 },
  },
  right_elbow: {
    name: 'Right Elbow',
    landmarks: [12, 14, 16],
    bilateral: 'left_elbow',
    category: 'arms',
    canTrackAngle: true,
    angleJoints: { point1: 12, vertex: 14, point3: 16 },
  },
  
  // Wrists and hands
  left_wrist: {
    name: 'Left Wrist',
    landmarks: [13, 15, 17, 19, 21], // elbow, wrist, pinky, index, thumb
    bilateral: 'right_wrist',
    category: 'hands',
    canTrackAngle: true,
    angleJoints: { point1: 13, vertex: 15, point3: 19 },
  },
  right_wrist: {
    name: 'Right Wrist',
    landmarks: [14, 16, 18, 20, 22],
    bilateral: 'left_wrist',
    category: 'hands',
    canTrackAngle: true,
    angleJoints: { point1: 14, vertex: 16, point3: 20 },
  },
  left_hand: {
    name: 'Left Hand',
    landmarks: [15, 17, 19, 21], // wrist, pinky, index, thumb
    bilateral: 'right_hand',
    category: 'hands',
    canTrackAngle: false,
  },
  right_hand: {
    name: 'Right Hand',
    landmarks: [16, 18, 20, 22],
    bilateral: 'left_hand',
    category: 'hands',
    canTrackAngle: false,
  },
  
  // Core
  torso: {
    name: 'Torso',
    landmarks: [11, 12, 23, 24], // shoulders and hips
    bilateral: null,
    category: 'core',
    canTrackAngle: true,
    // Angle between shoulder line and hip line for rotation
  },
  core: {
    name: 'Core',
    landmarks: [11, 12, 23, 24],
    bilateral: null,
    category: 'core',
    canTrackAngle: false,
  },
  
  // Hips
  left_hip: {
    name: 'Left Hip',
    landmarks: [11, 23, 25], // shoulder, hip, knee
    bilateral: 'right_hip',
    category: 'lower_body',
    canTrackAngle: true,
    angleJoints: { point1: 11, vertex: 23, point3: 25 },
  },
  right_hip: {
    name: 'Right Hip',
    landmarks: [12, 24, 26],
    bilateral: 'left_hip',
    category: 'lower_body',
    canTrackAngle: true,
    angleJoints: { point1: 12, vertex: 24, point3: 26 },
  },
  
  // Thighs
  left_thigh: {
    name: 'Left Thigh',
    landmarks: [23, 25], // hip to knee
    bilateral: 'right_thigh',
    category: 'legs',
    canTrackAngle: true,
    angleJoints: { point1: 11, vertex: 23, point3: 25 },
  },
  right_thigh: {
    name: 'Right Thigh',
    landmarks: [24, 26],
    bilateral: 'left_thigh',
    category: 'legs',
    canTrackAngle: true,
    angleJoints: { point1: 12, vertex: 24, point3: 26 },
  },
  
  // Knees
  left_knee: {
    name: 'Left Knee',
    landmarks: [23, 25, 27], // hip, knee, ankle
    bilateral: 'right_knee',
    category: 'legs',
    canTrackAngle: true,
    angleJoints: { point1: 23, vertex: 25, point3: 27 },
  },
  right_knee: {
    name: 'Right Knee',
    landmarks: [24, 26, 28],
    bilateral: 'left_knee',
    category: 'legs',
    canTrackAngle: true,
    angleJoints: { point1: 24, vertex: 26, point3: 28 },
  },
  
  // Lower legs
  left_lower_leg: {
    name: 'Left Lower Leg',
    landmarks: [25, 27], // knee to ankle
    bilateral: 'right_lower_leg',
    category: 'legs',
    canTrackAngle: false,
  },
  right_lower_leg: {
    name: 'Right Lower Leg',
    landmarks: [26, 28],
    bilateral: 'left_lower_leg',
    category: 'legs',
    canTrackAngle: false,
  },
  
  // Ankles and feet
  left_ankle: {
    name: 'Left Ankle',
    landmarks: [25, 27, 29, 31], // knee, ankle, heel, toe
    bilateral: 'right_ankle',
    category: 'feet',
    canTrackAngle: true,
    angleJoints: { point1: 25, vertex: 27, point3: 31 },
  },
  right_ankle: {
    name: 'Right Ankle',
    landmarks: [26, 28, 30, 32],
    bilateral: 'left_ankle',
    category: 'feet',
    canTrackAngle: true,
    angleJoints: { point1: 26, vertex: 28, point3: 32 },
  },
  left_foot: {
    name: 'Left Foot',
    landmarks: [27, 29, 31], // ankle, heel, toe
    bilateral: 'right_foot',
    category: 'feet',
    canTrackAngle: false,
  },
  right_foot: {
    name: 'Right Foot',
    landmarks: [28, 30, 32],
    bilateral: 'left_foot',
    category: 'feet',
    canTrackAngle: false,
  },
};

// ============================================
// POSITION LEVELS (5 levels)
// ============================================
export const POSITIONS = {
  bedridden: {
    name: 'Bedridden',
    description: 'Lying down with minimal mobility',
    canSit: false,
    canStand: false,
    canUseLegs: false,
    requiresSupport: true,
    allowedCategories: ['head_neck', 'arms', 'hands', 'core'],
    excludedMovements: ['march', 'squat', 'lunge', 'jump'],
    defaultPosition: 'lying',
  },
  seated_limited: {
    name: 'Seated (Limited)',
    description: 'Seated with limited upper body mobility',
    canSit: true,
    canStand: false,
    canUseLegs: 'limited',
    requiresSupport: true,
    allowedCategories: ['head_neck', 'upper_body', 'arms', 'hands', 'core'],
    excludedMovements: ['march', 'squat', 'lunge', 'jump'],
    defaultPosition: 'seated',
  },
  seated_full: {
    name: 'Seated (Full)',
    description: 'Seated with full upper body and some leg mobility',
    canSit: true,
    canStand: false,
    canUseLegs: true,
    requiresSupport: false,
    allowedCategories: ['head_neck', 'upper_body', 'arms', 'hands', 'core', 'lower_body', 'legs'],
    excludedMovements: ['squat', 'lunge', 'jump'],
    defaultPosition: 'seated',
  },
  standing_assisted: {
    name: 'Standing (Assisted)',
    description: 'Can stand with support, limited balance',
    canSit: true,
    canStand: true,
    canUseLegs: true,
    requiresSupport: true,
    requiresBalance: false,
    allowedCategories: ['head_neck', 'upper_body', 'arms', 'hands', 'core', 'lower_body', 'legs', 'feet'],
    excludedMovements: ['jump'],
    defaultPosition: 'standing',
  },
  fully_mobile: {
    name: 'Fully Mobile',
    description: 'Full range of motion and balance',
    canSit: true,
    canStand: true,
    canUseLegs: true,
    canJump: true,
    requiresSupport: false,
    requiresBalance: true,
    allowedCategories: ['head_neck', 'upper_body', 'arms', 'hands', 'core', 'lower_body', 'legs', 'feet'],
    excludedMovements: [],
    defaultPosition: 'standing',
  },
};

// ============================================
// DIFFICULTY MODIFIERS
// ============================================
export const MODIFIERS = {
  range: {
    micro: { factor: 0.25, label: 'Micro', description: 'Very small range of motion' },
    partial: { factor: 0.5, label: 'Partial', description: 'Half range of motion' },
    full: { factor: 1.0, label: 'Full', description: 'Complete range of motion' },
    extended: { factor: 1.2, label: 'Extended', description: 'Maximum stretch' },
  },
  speed: {
    very_slow: { factor: 0.5, label: 'Very Slow', secondsPerRep: 6 },
    slow: { factor: 0.75, label: 'Slow', secondsPerRep: 4 },
    normal: { factor: 1.0, label: 'Normal', secondsPerRep: 2 },
    fast: { factor: 1.5, label: 'Fast', secondsPerRep: 1 },
  },
  resistance: {
    none: { label: 'No Resistance', equipment: null },
    light: { label: 'Light Resistance', equipment: 'light band or 1-2 lb weights' },
    moderate: { label: 'Moderate Resistance', equipment: 'medium band or 3-5 lb weights' },
    heavy: { label: 'Heavy Resistance', equipment: 'heavy band or 8+ lb weights' },
  },
  hold: {
    none: { seconds: 0, label: 'No Hold' },
    brief: { seconds: 2, label: 'Brief Hold' },
    moderate: { seconds: 5, label: 'Moderate Hold' },
    long: { seconds: 10, label: 'Long Hold' },
  },
  reps: {
    minimal: { count: 3, label: 'Minimal' },
    low: { count: 5, label: 'Low' },
    moderate: { count: 8, label: 'Moderate' },
    standard: { count: 10, label: 'Standard' },
    high: { count: 12, label: 'High' },
    endurance: { count: 15, label: 'Endurance' },
    max: { count: 20, label: 'Maximum' },
  },
};

// ============================================
// EXERCISE GENERATOR
// ============================================

/**
 * Generates a unique exercise ID from components
 */
export function generateExerciseId(movement, bodyPart, position, modifiers = {}) {
  const parts = [movement, bodyPart, position];
  if (modifiers.range && modifiers.range !== 'full') parts.push(modifiers.range);
  if (modifiers.speed && modifiers.speed !== 'normal') parts.push(modifiers.speed);
  return parts.join('_');
}

/**
 * Generates a human-readable exercise name
 */
export function generateExerciseName(movement, bodyPart, modifiers = {}) {
  const movementData = BASE_MOVEMENTS[movement];
  const bodyPartData = BODY_PARTS[bodyPart];
  
  if (!movementData || !bodyPartData) return null;
  
  let name = `${bodyPartData.name} ${movementData.verb}`;
  
  // Add range modifier if not full
  if (modifiers.range && modifiers.range !== 'full') {
    const rangeData = MODIFIERS.range[modifiers.range];
    name = `${rangeData.label} ${name}`;
  }
  
  // Add speed modifier if not normal
  if (modifiers.speed && modifiers.speed !== 'normal') {
    const speedData = MODIFIERS.speed[modifiers.speed];
    name = `${speedData.label} ${name}`;
  }
  
  return name;
}

/**
 * Generates exercise description
 */
export function generateExerciseDescription(movement, bodyPart, position, modifiers = {}) {
  const movementData = BASE_MOVEMENTS[movement];
  const bodyPartData = BODY_PARTS[bodyPart];
  const positionData = POSITIONS[position];
  
  if (!movementData || !bodyPartData || !positionData) return null;
  
  let description = `${movementData.verb} your ${bodyPartData.name.toLowerCase()}`;
  
  if (modifiers.range && modifiers.range !== 'full') {
    const rangeData = MODIFIERS.range[modifiers.range];
    description += ` with ${rangeData.description.toLowerCase()}`;
  }
  
  if (modifiers.hold && modifiers.hold !== 'none') {
    const holdData = MODIFIERS.hold[modifiers.hold];
    description += `, hold for ${holdData.seconds} seconds`;
  }
  
  if (positionData.defaultPosition !== 'standing') {
    description += ` while ${positionData.defaultPosition}`;
  }
  
  return description + '.';
}

/**
 * Checks if a movement is compatible with a body part
 */
export function isMovementCompatible(movement, bodyPart) {
  const movementData = BASE_MOVEMENTS[movement];
  const bodyPartData = BODY_PARTS[bodyPart];
  
  if (!movementData || !bodyPartData) return false;
  
  // Check if the body part can be tracked for this movement type
  const trackingType = movementData.trackingType;
  
  // Isometric and hold movements work with all body parts
  if (['isometric', 'hold', 'breathing'].includes(trackingType)) {
    return true;
  }
  
  // Angle-based movements require trackable joints
  if (['angle_increase', 'angle_decrease', 'angle_flex', 'angle_extend'].includes(trackingType)) {
    return bodyPartData.canTrackAngle;
  }
  
  // Rotation and circular movements
  if (['rotation', 'circular'].includes(trackingType)) {
    return ['head_neck', 'upper_body', 'core', 'hands', 'feet'].includes(bodyPartData.category);
  }
  
  return true;
}

/**
 * Checks if an exercise is suitable for a position level
 */
export function isPositionCompatible(bodyPart, position) {
  const bodyPartData = BODY_PARTS[bodyPart];
  const positionData = POSITIONS[position];
  
  if (!bodyPartData || !positionData) return false;
  
  return positionData.allowedCategories.includes(bodyPartData.category);
}

/**
 * Generates a single exercise from template components
 */
export function generateExercise(movement, bodyPart, position, modifiers = {}) {
  if (!isMovementCompatible(movement, bodyPart)) return null;
  if (!isPositionCompatible(bodyPart, position)) return null;
  
  const movementData = BASE_MOVEMENTS[movement];
  const bodyPartData = BODY_PARTS[bodyPart];
  const positionData = POSITIONS[position];
  
  // Determine reps
  const repsModifier = modifiers.reps || 'standard';
  const reps = MODIFIERS.reps[repsModifier]?.count || movementData.defaultReps || 10;
  
  // Determine hold time
  const holdModifier = modifiers.hold || 'none';
  const holdSeconds = MODIFIERS.hold[holdModifier]?.seconds || movementData.defaultHold || 0;
  
  // Determine speed
  const speedModifier = modifiers.speed || 'normal';
  const secondsPerRep = MODIFIERS.speed[speedModifier]?.secondsPerRep || 2;
  
  // Calculate duration
  const duration = reps * (secondsPerRep + holdSeconds);
  
  // Determine tracking configuration
  let tracking = null;
  if (bodyPartData.canTrackAngle && bodyPartData.angleJoints) {
    const rangeModifier = modifiers.range || 'full';
    const rangeFactor = MODIFIERS.range[rangeModifier]?.factor || 1.0;
    
    tracking = {
      type: movementData.trackingType,
      joints: bodyPartData.angleJoints,
      bilateral: bodyPartData.bilateral !== null,
      rangeFactor,
    };
  } else if (['isometric', 'hold'].includes(movementData.trackingType)) {
    tracking = {
      type: 'timer',
      holdSeconds,
    };
  } else {
    tracking = {
      type: 'manual',
    };
  }
  
  return {
    id: generateExerciseId(movement, bodyPart, position, modifiers),
    name: generateExerciseName(movement, bodyPart, modifiers),
    description: generateExerciseDescription(movement, bodyPart, position, modifiers),
    movement,
    bodyPart,
    position,
    modifiers: {
      range: modifiers.range || 'full',
      speed: modifiers.speed || 'normal',
      resistance: modifiers.resistance || 'none',
      hold: modifiers.hold || 'none',
      reps: modifiers.reps || 'standard',
    },
    reps,
    duration,
    holdSeconds,
    tracking,
    category: bodyPartData.category,
    bilateral: bodyPartData.bilateral !== null,
    difficulty: calculateDifficulty(modifiers),
    tags: generateTags(movement, bodyPart, position, modifiers),
    targetAreas: [bodyPart, ...(bodyPartData.bilateral ? [bodyPartData.bilateral] : [])],
  };
}

/**
 * Calculates difficulty score (1-10) based on modifiers
 */
function calculateDifficulty(modifiers) {
  let score = 5; // Base difficulty
  
  // Range affects difficulty
  const rangeScores = { micro: -2, partial: -1, full: 0, extended: 1 };
  score += rangeScores[modifiers.range] || 0;
  
  // Speed affects difficulty
  const speedScores = { very_slow: -1, slow: 0, normal: 0, fast: 1 };
  score += speedScores[modifiers.speed] || 0;
  
  // Resistance affects difficulty
  const resistanceScores = { none: 0, light: 1, moderate: 2, heavy: 3 };
  score += resistanceScores[modifiers.resistance] || 0;
  
  // Reps affect difficulty
  const repsScores = { minimal: -1, low: 0, moderate: 0, standard: 0, high: 1, endurance: 2, max: 3 };
  score += repsScores[modifiers.reps] || 0;
  
  return Math.max(1, Math.min(10, score));
}

/**
 * Generates tags for filtering
 */
function generateTags(movement, bodyPart, position, modifiers) {
  const tags = [];
  const bodyPartData = BODY_PARTS[bodyPart];
  const positionData = POSITIONS[position];
  const movementData = BASE_MOVEMENTS[movement];
  
  // Category tags
  tags.push(bodyPartData.category);
  
  // Position tags
  tags.push(position);
  if (positionData.defaultPosition) {
    tags.push(positionData.defaultPosition);
  }
  
  // Accessibility tags
  if (position === 'bedridden' || position === 'seated_limited') {
    tags.push('wheelchair_friendly');
  }
  if (position !== 'fully_mobile') {
    tags.push('accessible');
  }
  
  // Movement type tags
  tags.push(movementData.trackingType);
  
  // Difficulty tags
  if (modifiers.range === 'micro' || modifiers.range === 'partial') {
    tags.push('low_intensity');
  }
  if (modifiers.resistance === 'heavy' || modifiers.reps === 'max') {
    tags.push('high_intensity');
  }
  
  // Bilateral tag
  if (bodyPartData.bilateral) {
    tags.push('bilateral');
  }
  
  return [...new Set(tags)]; // Remove duplicates
}

/**
 * Generates exercises for a user profile
 * @param {Object} userProfile - User's onboarding profile
 * @param {number} count - Number of exercises to generate
 * @returns {Array} Generated exercises
 */
export function generateExercisesForProfile(userProfile, count = 5) {
  const exercises = [];
  const usedCombinations = new Set();
  
  // Determine user's position level
  const position = mapProfileToPosition(userProfile);
  const positionData = POSITIONS[position];
  
  // Get allowed body parts based on red zones
  const allowedBodyParts = Object.keys(BODY_PARTS).filter(bp => {
    const bpData = BODY_PARTS[bp];
    
    // Check if category is allowed for this position
    if (!positionData.allowedCategories.includes(bpData.category)) {
      return false;
    }
    
    // Check red zones
    if (userProfile.redZones && userProfile.redZones.length > 0) {
      const bodyPartAreas = getBodyPartAreas(bp);
      if (bodyPartAreas.some(area => userProfile.redZones.includes(area))) {
        return false;
      }
    }
    
    return true;
  });
  
  // Determine appropriate modifiers based on profile
  const modifierOptions = getModifiersForProfile(userProfile);
  
  // Get compatible movements
  const movements = Object.keys(BASE_MOVEMENTS).filter(m => 
    !positionData.excludedMovements.includes(m)
  );
  
  // Generate exercises
  let attempts = 0;
  const maxAttempts = count * 10;
  
  while (exercises.length < count && attempts < maxAttempts) {
    attempts++;
    
    // Random selection
    const movement = movements[Math.floor(Math.random() * movements.length)];
    const bodyPart = allowedBodyParts[Math.floor(Math.random() * allowedBodyParts.length)];
    
    // Random modifiers from allowed options
    const modifiers = {
      range: modifierOptions.ranges[Math.floor(Math.random() * modifierOptions.ranges.length)],
      speed: modifierOptions.speeds[Math.floor(Math.random() * modifierOptions.speeds.length)],
      reps: modifierOptions.reps[Math.floor(Math.random() * modifierOptions.reps.length)],
      hold: modifierOptions.holds[Math.floor(Math.random() * modifierOptions.holds.length)],
    };
    
    const combinationKey = `${movement}_${bodyPart}_${modifiers.range}_${modifiers.speed}`;
    
    if (!usedCombinations.has(combinationKey)) {
      const exercise = generateExercise(movement, bodyPart, position, modifiers);
      
      if (exercise) {
        exercises.push(exercise);
        usedCombinations.add(combinationKey);
      }
    }
  }
  
  return exercises;
}

/**
 * Maps user profile to position level
 */
function mapProfileToPosition(profile) {
  const movementPosition = profile.movementPosition || 'sitting';
  
  switch (movementPosition) {
    case 'lying':
      return 'bedridden';
    case 'wheelchair':
      return profile.wheelchairTransfer === 'transfer' ? 'seated_full' : 'seated_limited';
    case 'sitting':
      return 'seated_full';
    case 'standing_supported':
      return 'standing_assisted';
    case 'standing_unassisted':
      return 'fully_mobile';
    default:
      return 'seated_full';
  }
}

/**
 * Gets red zone areas that a body part affects
 */
function getBodyPartAreas(bodyPart) {
  const mapping = {
    left_shoulder: ['left_shoulder'],
    right_shoulder: ['right_shoulder'],
    left_elbow: ['left_arm'],
    right_elbow: ['right_arm'],
    left_wrist: ['left_wrist_hand'],
    right_wrist: ['right_wrist_hand'],
    left_hip: ['hips'],
    right_hip: ['hips'],
    left_knee: ['left_knee'],
    right_knee: ['right_knee'],
    left_ankle: ['left_ankle_foot'],
    right_ankle: ['right_ankle_foot'],
    torso: ['core_abdomen', 'lower_back', 'upper_back'],
    core: ['core_abdomen', 'lower_back'],
    neck: ['head_neck'],
    head: ['head_neck'],
  };
  
  return mapping[bodyPart] || [];
}

/**
 * Gets appropriate modifiers based on user profile
 */
function getModifiersForProfile(profile) {
  const result = {
    ranges: ['full'],
    speeds: ['normal'],
    reps: ['standard'],
    holds: ['none'],
  };
  
  // Adjust based on overhead range
  if (profile.overheadRange === 'chest' || profile.overheadRange === 'shoulder') {
    result.ranges = ['micro', 'partial'];
  } else if (profile.overheadRange === 'one_sided') {
    result.ranges = ['partial', 'full'];
  } else {
    result.ranges = ['partial', 'full', 'extended'];
  }
  
  // Adjust based on energy flow
  if (profile.energyFlow === 'conserve') {
    result.speeds = ['very_slow', 'slow'];
    result.reps = ['minimal', 'low'];
    result.holds = ['brief', 'moderate'];
  } else if (profile.energyFlow === 'avoid_heat') {
    result.speeds = ['slow', 'normal'];
    result.reps = ['low', 'moderate'];
  } else {
    result.speeds = ['slow', 'normal', 'fast'];
    result.reps = ['moderate', 'standard', 'high'];
  }
  
  // Adjust based on grip strength
  if (profile.gripStrength === 'none' || profile.gripStrength === 'assisted') {
    // Prefer exercises without resistance
    result.holds = ['none', 'brief'];
  }
  
  return result;
}

/**
 * Gets all possible exercises (for enumeration/debugging)
 * Warning: This can generate thousands of exercises
 */
export function getAllPossibleExercises(maxPerPosition = 100) {
  const allExercises = [];
  
  for (const position of Object.keys(POSITIONS)) {
    let count = 0;
    
    for (const movement of Object.keys(BASE_MOVEMENTS)) {
      for (const bodyPart of Object.keys(BODY_PARTS)) {
        if (count >= maxPerPosition) break;
        
        const exercise = generateExercise(movement, bodyPart, position, {});
        if (exercise) {
          allExercises.push(exercise);
          count++;
        }
      }
    }
  }
  
  return allExercises;
}

/**
 * Gets exercise count statistics
 */
export function getExerciseStats() {
  const movements = Object.keys(BASE_MOVEMENTS).length;
  const bodyParts = Object.keys(BODY_PARTS).length;
  const positions = Object.keys(POSITIONS).length;
  const ranges = Object.keys(MODIFIERS.range).length;
  const speeds = Object.keys(MODIFIERS.speed).length;
  
  return {
    movements,
    bodyParts,
    positions,
    ranges,
    speeds,
    theoreticalMax: movements * bodyParts * positions * ranges * speeds,
    estimatedValid: Math.floor(movements * bodyParts * positions * ranges * speeds * 0.3), // ~30% are valid combinations
  };
}
