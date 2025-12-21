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
  // Leg exercises
  {
    id: 'lunges',
    name: 'Lunges',
    description: 'Step forward into a lunge position, alternating legs',
    reps: 8,
    tags: ['lower_body', 'requires_standing', 'requires_both_hands_free'],
    difficulty: 'intermediate',
    duration: 120,
  },
  {
    id: 'calf_raises',
    name: 'Calf Raises',
    description: 'Rise up onto your toes, then lower back down',
    reps: 15,
    tags: ['lower_body', 'requires_standing', 'requires_both_hands_free'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'leg_extensions',
    name: 'Leg Extensions',
    description: 'Extend your leg straight out while seated',
    reps: 12,
    tags: ['lower_body', 'seated', 'wheelchair_friendly'],
    difficulty: 'beginner',
    duration: 90,
  },
  {
    id: 'side_leg_raises',
    name: 'Side Leg Raises',
    description: 'Lift your leg to the side while standing or seated',
    reps: 10,
    tags: ['lower_body', 'seated', 'wheelchair_friendly'],
    difficulty: 'beginner',
    duration: 60,
  },
  // Arm exercises
  {
    id: 'bicep_curls',
    name: 'Bicep Curls',
    description: 'Curl your arms up, bending at the elbow',
    reps: 12,
    tags: ['upper_body', 'arms', 'seated', 'wheelchair_friendly'],
    difficulty: 'beginner',
    duration: 90,
  },
  {
    id: 'tricep_dips',
    name: 'Tricep Dips',
    description: 'Dip down using a chair or wall for support',
    reps: 8,
    tags: ['upper_body', 'arms', 'requires_standing'],
    difficulty: 'intermediate',
    duration: 90,
  },
  {
    id: 'arm_circles',
    name: 'Arm Circles',
    description: 'Circle your arms forward and backward',
    reps: 10,
    tags: ['upper_body', 'arms', 'seated', 'wheelchair_friendly'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'pushups',
    name: 'Push-ups',
    description: 'Classic push-ups on the floor or modified on knees',
    reps: 10,
    tags: ['upper_body', 'arms', 'requires_standing'],
    difficulty: 'intermediate',
    duration: 90,
  },
  // Back exercises
  {
    id: 'back_extensions',
    name: 'Back Extensions',
    description: 'Arch your back gently while seated or standing',
    reps: 10,
    tags: ['back', 'seated', 'wheelchair_friendly'],
    difficulty: 'beginner',
    duration: 90,
  },
  {
    id: 'superman',
    name: 'Superman',
    description: 'Lie face down and lift your arms and legs',
    reps: 8,
    tags: ['back', 'requires_standing'],
    difficulty: 'intermediate',
    duration: 90,
  },
  {
    id: 'shoulder_blade_squeezes',
    name: 'Shoulder Blade Squeezes',
    description: 'Squeeze your shoulder blades together',
    reps: 12,
    tags: ['back', 'seated', 'wheelchair_friendly'],
    difficulty: 'beginner',
    duration: 60,
  },
  {
    id: 'rows',
    name: 'Bent-Over Rows',
    description: 'Pull your arms back as if rowing',
    reps: 10,
    tags: ['back', 'requires_standing'],
    difficulty: 'intermediate',
    duration: 90,
  },
  // Core/Abdomen exercises
  {
    id: 'crunches',
    name: 'Crunches',
    description: 'Lift your shoulders toward your knees',
    reps: 15,
    tags: ['core', 'abdomen', 'requires_standing'],
    difficulty: 'beginner',
    duration: 90,
  },
  {
    id: 'plank',
    name: 'Plank',
    description: 'Hold a plank position on forearms and toes',
    reps: 1,
    tags: ['core', 'abdomen', 'requires_standing'],
    difficulty: 'intermediate',
    duration: 30,
  },
  {
    id: 'leg_raises',
    name: 'Leg Raises',
    description: 'Lift both legs up while lying down',
    reps: 10,
    tags: ['core', 'abdomen', 'requires_standing'],
    difficulty: 'intermediate',
    duration: 90,
  },
  {
    id: 'bicycle_crunches',
    name: 'Bicycle Crunches',
    description: 'Alternate bringing opposite elbow to knee',
    reps: 12,
    tags: ['core', 'abdomen', 'requires_standing'],
    difficulty: 'intermediate',
    duration: 90,
  },
  {
    id: 'dead_bug',
    name: 'Dead Bug',
    description: 'Alternate extending opposite arm and leg while lying down',
    reps: 10,
    tags: ['core', 'abdomen', 'requires_standing'],
    difficulty: 'beginner',
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

