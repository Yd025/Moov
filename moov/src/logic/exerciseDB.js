/**
 * Exercise Database - Contains all available exercises with metadata
 * Each exercise includes tags for filtering based on user profile
 * 
 * Tag Categories:
 * - Position: seated, wheelchair_friendly, requires_standing, supine, lying
 * - Body Area: upper_body, lower_body, core, arms, back
 * - Requirements: requires_grip, requires_strong_grip, requires_full_overhead, requires_shoulder_height
 * - Energy: high_intensity, efficient, high_cardio, raises_temperature
 * - Target Areas: targets_shoulders, targets_arms, targets_legs, etc. (for red zone filtering)
 */

export const exercises = [
  // ========================================
  // SEATED / WHEELCHAIR FRIENDLY EXERCISES
  // ========================================
  {
    id: 'arm_raises',
    name: 'Arm Raises',
    description: 'Raise your arms up and down',
    reps: 10,
    tags: ['upper_body', 'seated', 'wheelchair_friendly', 'requires_shoulder_height'],
    targetAreas: ['left_shoulder', 'right_shoulder'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'overhead_arm_raises',
    name: 'Overhead Arm Raises',
    description: 'Raise your arms all the way overhead',
    reps: 10,
    tags: ['upper_body', 'seated', 'wheelchair_friendly', 'requires_full_overhead'],
    targetAreas: ['left_shoulder', 'right_shoulder'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'shoulder_rolls',
    name: 'Shoulder Rolls',
    description: 'Roll your shoulders forward and backward',
    reps: 10,
    tags: ['upper_body', 'seated', 'wheelchair_friendly'],
    targetAreas: ['left_shoulder', 'right_shoulder'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'neck_stretches',
    name: 'Neck Stretches',
    description: 'Gently turn your head left and right',
    reps: 8,
    tags: ['upper_body', 'seated', 'wheelchair_friendly', 'stretching', 'efficient'],
    targetAreas: ['head_neck'],
    difficulty: 'beginner',
    duration: 90,
  },
  {
    id: 'seated_twists',
    name: 'Seated Twists',
    description: 'Twist your torso left and right',
    reps: 10,
    tags: ['core', 'seated', 'wheelchair_friendly'],
    targetAreas: ['core_abdomen', 'lower_back'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'leg_lifts_seated',
    name: 'Seated Leg Lifts',
    description: 'Lift your legs up and down while seated',
    reps: 10,
    tags: ['lower_body', 'seated', 'wheelchair_friendly'],
    targetAreas: ['left_thigh', 'right_thigh', 'hips'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'ankle_circles',
    name: 'Ankle Circles',
    description: 'Rotate your ankles in circles',
    reps: 10,
    tags: ['lower_body', 'seated', 'wheelchair_friendly', 'efficient'],
    targetAreas: ['left_ankle_foot', 'right_ankle_foot'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'hand_squeezes',
    name: 'Hand Squeezes',
    description: 'Squeeze your hands together or use a stress ball',
    reps: 15,
    tags: ['upper_body', 'seated', 'wheelchair_friendly', 'efficient'],
    targetAreas: ['left_wrist_hand', 'right_wrist_hand'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'wrist_flexes',
    name: 'Wrist Flexes',
    description: 'Flex and extend your wrists',
    reps: 10,
    tags: ['upper_body', 'seated', 'wheelchair_friendly', 'efficient'],
    targetAreas: ['left_wrist_hand', 'right_wrist_hand'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'deep_breathing',
    name: 'Deep Breathing',
    description: 'Take deep breaths in and out',
    reps: 5,
    tags: ['wellness', 'seated', 'wheelchair_friendly', 'stretching', 'efficient'],
    targetAreas: ['chest'],
    difficulty: 'beginner',
    duration: 120,
  },
  {
    id: 'bicep_curls_seated',
    name: 'Seated Bicep Curls',
    description: 'Curl your arms up, bending at the elbow',
    reps: 12,
    tags: ['upper_body', 'arms', 'seated', 'wheelchair_friendly'],
    targetAreas: ['left_arm', 'right_arm'],
    difficulty: 'beginner',
    duration: 90,
  },
  {
    id: 'arm_circles',
    name: 'Arm Circles',
    description: 'Circle your arms forward and backward',
    reps: 10,
    tags: ['upper_body', 'arms', 'seated', 'wheelchair_friendly', 'requires_shoulder_height'],
    targetAreas: ['left_shoulder', 'right_shoulder', 'left_arm', 'right_arm'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'shoulder_blade_squeezes',
    name: 'Shoulder Blade Squeezes',
    description: 'Squeeze your shoulder blades together',
    reps: 12,
    tags: ['back', 'seated', 'wheelchair_friendly', 'efficient'],
    targetAreas: ['upper_back'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'back_extensions_seated',
    name: 'Seated Back Extensions',
    description: 'Arch your back gently while seated',
    reps: 10,
    tags: ['back', 'seated', 'wheelchair_friendly'],
    targetAreas: ['lower_back', 'upper_back'],
    difficulty: 'beginner',
    duration: 90,
  },
  {
    id: 'leg_extensions',
    name: 'Leg Extensions',
    description: 'Extend your leg straight out while seated',
    reps: 12,
    tags: ['lower_body', 'seated', 'wheelchair_friendly'],
    targetAreas: ['left_thigh', 'right_thigh', 'left_knee', 'right_knee'],
    difficulty: 'beginner',
    duration: 90,
  },
  {
    id: 'side_leg_raises_seated',
    name: 'Seated Side Leg Raises',
    description: 'Lift your leg to the side while seated',
    reps: 10,
    tags: ['lower_body', 'seated', 'wheelchair_friendly'],
    targetAreas: ['hips', 'left_thigh', 'right_thigh'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'seated_marching',
    name: 'Seated Marching',
    description: 'Lift your knees alternately while seated',
    reps: 20,
    tags: ['lower_body', 'cardio', 'seated', 'wheelchair_friendly'],
    targetAreas: ['hips', 'left_thigh', 'right_thigh'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'boxing_punches',
    name: 'Boxing Punches',
    description: 'Punch forward alternating arms',
    reps: 20,
    tags: ['upper_body', 'cardio', 'seated', 'wheelchair_friendly', 'efficient'],
    targetAreas: ['left_shoulder', 'right_shoulder', 'left_arm', 'right_arm', 'chest'],
    difficulty: 'beginner',
    duration: 60,
  },

  // ========================================
  // STANDING EXERCISES
  // ========================================
  {
    id: 'squats',
    name: 'Squats',
    description: 'Stand and squat down',
    reps: 8,
    tags: ['lower_body', 'requires_standing', 'requires_both_hands_free', 'requires_balance'],
    targetAreas: ['left_thigh', 'right_thigh', 'left_knee', 'right_knee', 'hips'],
    difficulty: 'intermediate',
    duration: 90,
  },
  {
    id: 'wall_pushups',
    name: 'Wall Push-ups',
    description: 'Push-ups against a wall',
    reps: 8,
    tags: ['upper_body', 'requires_standing', 'requires_grip'],
    targetAreas: ['chest', 'left_arm', 'right_arm', 'left_shoulder', 'right_shoulder'],
    difficulty: 'intermediate',
    duration: 90,
  },
  {
    id: 'marching_in_place',
    name: 'Marching in Place',
    description: 'Lift your knees while standing',
    reps: 20,
    tags: ['lower_body', 'cardio', 'requires_standing', 'requires_both_hands_free', 'high_cardio', 'raises_temperature'],
    targetAreas: ['hips', 'left_thigh', 'right_thigh'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'lunges',
    name: 'Lunges',
    description: 'Step forward into a lunge position, alternating legs',
    reps: 8,
    tags: ['lower_body', 'requires_standing', 'requires_both_hands_free', 'requires_balance'],
    targetAreas: ['left_thigh', 'right_thigh', 'left_knee', 'right_knee', 'hips'],
    difficulty: 'intermediate',
    duration: 120,
  },
  {
    id: 'calf_raises',
    name: 'Calf Raises',
    description: 'Rise up onto your toes, then lower back down',
    reps: 15,
    tags: ['lower_body', 'requires_standing'],
    targetAreas: ['left_lower_leg', 'right_lower_leg', 'left_ankle_foot', 'right_ankle_foot'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'tricep_dips',
    name: 'Tricep Dips',
    description: 'Dip down using a chair or wall for support',
    reps: 8,
    tags: ['upper_body', 'arms', 'requires_standing', 'requires_grip'],
    targetAreas: ['left_arm', 'right_arm'],
    difficulty: 'intermediate',
    duration: 90,
  },
  {
    id: 'standing_side_leg_raises',
    name: 'Standing Side Leg Raises',
    description: 'Lift your leg to the side while standing',
    reps: 10,
    tags: ['lower_body', 'requires_standing', 'requires_balance'],
    targetAreas: ['hips', 'left_thigh', 'right_thigh'],
    difficulty: 'beginner',
    duration: 60,
  },

  // ========================================
  // SUPINE / LYING EXERCISES
  // ========================================
  {
    id: 'supine_arm_raises',
    name: 'Lying Arm Raises',
    description: 'Raise your arms overhead while lying down',
    reps: 10,
    tags: ['upper_body', 'supine', 'lying', 'wheelchair_friendly'],
    targetAreas: ['left_shoulder', 'right_shoulder'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'supine_leg_raises',
    name: 'Lying Leg Raises',
    description: 'Lift your legs while lying on your back',
    reps: 10,
    tags: ['core', 'lower_body', 'supine', 'lying'],
    targetAreas: ['core_abdomen', 'hips', 'left_thigh', 'right_thigh'],
    difficulty: 'intermediate',
    duration: 90,
  },
  {
    id: 'bridge',
    name: 'Glute Bridge',
    description: 'Lift your hips while lying on your back',
    reps: 12,
    tags: ['lower_body', 'core', 'supine', 'lying'],
    targetAreas: ['hips', 'lower_back', 'left_thigh', 'right_thigh'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'dead_bug',
    name: 'Dead Bug',
    description: 'Alternate extending opposite arm and leg while lying down',
    reps: 10,
    tags: ['core', 'supine', 'lying'],
    targetAreas: ['core_abdomen', 'lower_back'],
    difficulty: 'beginner',
    duration: 90,
  },

  // ========================================
  // HIGH INTENSITY (Filtered for energy management)
  // ========================================
  {
    id: 'jumping_jacks',
    name: 'Jumping Jacks',
    description: 'Jump while spreading arms and legs',
    reps: 20,
    tags: ['cardio', 'requires_standing', 'requires_both_hands_free', 'high_intensity', 'high_cardio', 'raises_temperature'],
    targetAreas: ['full_body'],
    difficulty: 'intermediate',
    duration: 60,
  },
  {
    id: 'burpees',
    name: 'Burpees',
    description: 'Squat, jump back to plank, push-up, jump forward, jump up',
    reps: 8,
    tags: ['cardio', 'requires_standing', 'requires_both_hands_free', 'high_intensity', 'high_cardio', 'raises_temperature'],
    targetAreas: ['full_body'],
    difficulty: 'advanced',
    duration: 120,
  },

  // ========================================
  // GRIP-REQUIRED EXERCISES
  // ========================================
  {
    id: 'resistance_band_rows',
    name: 'Resistance Band Rows',
    description: 'Pull resistance band toward your body',
    reps: 12,
    tags: ['back', 'upper_body', 'seated', 'wheelchair_friendly', 'requires_grip', 'requires_strong_grip'],
    targetAreas: ['upper_back', 'left_arm', 'right_arm'],
    difficulty: 'beginner',
    duration: 90,
  },
  {
    id: 'dumbbell_shoulder_press',
    name: 'Shoulder Press',
    description: 'Press weights overhead',
    reps: 10,
    tags: ['upper_body', 'seated', 'wheelchair_friendly', 'requires_grip', 'requires_strong_grip', 'requires_full_overhead'],
    targetAreas: ['left_shoulder', 'right_shoulder', 'left_arm', 'right_arm'],
    difficulty: 'intermediate',
    duration: 90,
  },
];

/**
 * Get exercise by ID
 * @param {string} id - Exercise ID
 * @returns {Object|null} Exercise object or null
 */
export function getExerciseById(id) {
  return exercises.find(ex => ex.id === id) || null;
}

/**
 * Get exercises by tag
 * @param {string} tag - Tag to filter by
 * @returns {Array} Filtered exercises
 */
export function getExercisesByTag(tag) {
  return exercises.filter(ex => ex.tags.includes(tag));
}

/**
 * Get all exercise IDs
 * @returns {Array} Array of exercise IDs
 */
export function getAllExerciseIds() {
  return exercises.map(ex => ex.id);
}

/**
 * Get exercises by target area
 * @param {string} area - Target area to filter by
 * @returns {Array} Filtered exercises
 */
export function getExercisesByTargetArea(area) {
  return exercises.filter(ex => ex.targetAreas?.includes(area));
}

/**
 * Get exercises suitable for a position
 * @param {string} position - User's position (wheelchair, seated, standing, lying)
 * @returns {Array} Filtered exercises
 */
export function getExercisesByPosition(position) {
  switch (position) {
    case 'wheelchair':
    case 'sitting':
      return exercises.filter(ex => ex.tags.includes('wheelchair_friendly') || ex.tags.includes('seated'));
    case 'lying':
      return exercises.filter(ex => ex.tags.includes('supine') || ex.tags.includes('lying'));
    case 'standing_supported':
      return exercises.filter(ex => !ex.tags.includes('requires_balance'));
    case 'standing_unassisted':
    default:
      return exercises;
  }
}
