/**
 * Exercise Database - Contains all available exercises with metadata
 * Each exercise includes tags for filtering based on user profile
 */

export const exercises = [
  {
    id: 'arm_raises',
    name: 'Arm Raises',
    description: 'Raise your arms up and down',
    reps: 10,
    tags: ['upper_body', 'seated', 'wheelchair_friendly'],
    difficulty: 'beginner',
    duration: 60, // seconds
  },
  {
    id: 'shoulder_rolls',
    name: 'Shoulder Rolls',
    description: 'Roll your shoulders forward and backward',
    reps: 10,
    tags: ['upper_body', 'seated', 'wheelchair_friendly'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'neck_stretches',
    name: 'Neck Stretches',
    description: 'Gently turn your head left and right',
    reps: 8,
    tags: ['upper_body', 'seated', 'wheelchair_friendly', 'stretching'],
    difficulty: 'beginner',
    duration: 90,
  },
  {
    id: 'seated_twists',
    name: 'Seated Twists',
    description: 'Twist your torso left and right',
    reps: 10,
    tags: ['core', 'seated', 'wheelchair_friendly'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'leg_lifts',
    name: 'Leg Lifts',
    description: 'Lift your legs up and down',
    reps: 10,
    tags: ['lower_body', 'seated', 'wheelchair_friendly'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'ankle_circles',
    name: 'Ankle Circles',
    description: 'Rotate your ankles in circles',
    reps: 10,
    tags: ['lower_body', 'seated', 'wheelchair_friendly'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'squats',
    name: 'Squats',
    description: 'Stand and squat down',
    reps: 8,
    tags: ['lower_body', 'requires_standing', 'requires_both_hands_free'],
    difficulty: 'intermediate',
    duration: 90,
  },
  {
    id: 'wall_pushups',
    name: 'Wall Push-ups',
    description: 'Push-ups against a wall',
    reps: 8,
    tags: ['upper_body', 'requires_standing', 'requires_grip'],
    difficulty: 'intermediate',
    duration: 90,
  },
  {
    id: 'marching_in_place',
    name: 'Marching in Place',
    description: 'Lift your knees while standing',
    reps: 10,
    tags: ['lower_body', 'requires_standing', 'requires_both_hands_free'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'hand_squeezes',
    name: 'Hand Squeezes',
    description: 'Squeeze a stress ball or your hands',
    reps: 15,
    tags: ['upper_body', 'seated', 'wheelchair_friendly', 'hands'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'wrist_flexes',
    name: 'Wrist Flexes',
    description: 'Flex and extend your wrists',
    reps: 10,
    tags: ['upper_body', 'seated', 'wheelchair_friendly', 'hands'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'deep_breathing',
    name: 'Deep Breathing',
    description: 'Take deep breaths in and out',
    reps: 5,
    tags: ['wellness', 'seated', 'wheelchair_friendly', 'stretching'],
    difficulty: 'beginner',
    duration: 120,
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

