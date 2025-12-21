/**
 * Workout Plans Database - Predefined workout plans that group exercises
 * Each plan includes exercises organized by focus area, difficulty, and accessibility
 */

export const workoutPlans = [
  {
    id: 'upper_body_basics',
    name: 'Upper Body Basics',
    description: 'A gentle upper body routine focusing on shoulders, arms, and neck',
    exerciseIds: ['shoulder_rolls', 'arm_raises', 'neck_stretches'],
    tags: ['upper_body', 'seated', 'wheelchair_friendly', 'beginner'],
    difficulty: 'beginner',
    estimatedDuration: 210, // seconds (sum of exercise durations)
    focusArea: 'upper_body',
  },
  {
    id: 'full_body_gentle',
    name: 'Full Body Gentle',
    description: 'A complete body workout suitable for all mobility levels',
    exerciseIds: ['shoulder_rolls', 'seated_twists', 'leg_lifts', 'deep_breathing'],
    tags: ['full_body', 'seated', 'wheelchair_friendly', 'beginner'],
    difficulty: 'beginner',
    estimatedDuration: 330,
    focusArea: 'full_body',
  },
  {
    id: 'hands_and_wrists',
    name: 'Hands & Wrists',
    description: 'Focus on hand strength and wrist flexibility',
    exerciseIds: ['hand_squeezes', 'wrist_flexes', 'arm_raises'],
    tags: ['hands', 'seated', 'wheelchair_friendly', 'beginner'],
    difficulty: 'beginner',
    estimatedDuration: 180,
    focusArea: 'hands_grip',
  },
  {
    id: 'lower_body_seated',
    name: 'Lower Body Seated',
    description: 'Leg and ankle exercises you can do while seated',
    exerciseIds: ['leg_lifts', 'ankle_circles', 'seated_twists'],
    tags: ['lower_body', 'seated', 'wheelchair_friendly', 'beginner'],
    difficulty: 'beginner',
    estimatedDuration: 180,
    focusArea: 'lower_body',
  },
  {
    id: 'stretch_and_relax',
    name: 'Stretch & Relax',
    description: 'Gentle stretching and breathing exercises for wellness',
    exerciseIds: ['neck_stretches', 'deep_breathing', 'shoulder_rolls'],
    tags: ['stretching', 'wellness', 'seated', 'wheelchair_friendly', 'beginner'],
    difficulty: 'beginner',
    estimatedDuration: 270,
    focusArea: 'wellness',
  },
  {
    id: 'core_strength',
    name: 'Core Strength',
    description: 'Build core stability with seated exercises',
    exerciseIds: ['seated_twists', 'arm_raises', 'shoulder_rolls'],
    tags: ['core', 'seated', 'wheelchair_friendly', 'beginner'],
    difficulty: 'beginner',
    estimatedDuration: 180,
    focusArea: 'core',
  },
  {
    id: 'standing_basics',
    name: 'Standing Basics',
    description: 'Basic exercises for those who can stand',
    exerciseIds: ['marching_in_place', 'wall_pushups', 'squats'],
    tags: ['requires_standing', 'full_body', 'intermediate'],
    difficulty: 'intermediate',
    estimatedDuration: 240,
    focusArea: 'full_body',
  },
  {
    id: 'quick_upper',
    name: 'Quick Upper Body',
    description: 'A fast 3-minute upper body routine',
    exerciseIds: ['arm_raises', 'shoulder_rolls'],
    tags: ['upper_body', 'seated', 'wheelchair_friendly', 'beginner', 'quick'],
    difficulty: 'beginner',
    estimatedDuration: 120,
    focusArea: 'upper_body',
  },
  {
    id: 'morning_wake_up',
    name: 'Morning Wake Up',
    description: 'Start your day with gentle movement and breathing',
    exerciseIds: ['deep_breathing', 'neck_stretches', 'shoulder_rolls', 'arm_raises'],
    tags: ['wellness', 'seated', 'wheelchair_friendly', 'beginner'],
    difficulty: 'beginner',
    estimatedDuration: 330,
    focusArea: 'wellness',
  },
  {
    id: 'evening_wind_down',
    name: 'Evening Wind Down',
    description: 'Relaxing exercises to end your day',
    exerciseIds: ['deep_breathing', 'neck_stretches', 'wrist_flexes'],
    tags: ['wellness', 'stretching', 'seated', 'wheelchair_friendly', 'beginner'],
    difficulty: 'beginner',
    estimatedDuration: 270,
    focusArea: 'wellness',
  },
];

/**
 * Get workout plan by ID
 * @param {string} id - Workout plan ID
 * @returns {Object|null} Workout plan object or null
 */
export function getWorkoutPlanById(id) {
  return workoutPlans.find(plan => plan.id === id) || null;
}

/**
 * Get workout plans by tag
 * @param {string} tag - Tag to filter by
 * @returns {Array} Filtered workout plans
 */
export function getWorkoutPlansByTag(tag) {
  return workoutPlans.filter(plan => plan.tags.includes(tag));
}

/**
 * Get workout plans by focus area
 * @param {string} focusArea - Focus area (upper_body, lower_body, hands_grip, full_body)
 * @returns {Array} Filtered workout plans
 */
export function getWorkoutPlansByFocusArea(focusArea) {
  return workoutPlans.filter(plan => plan.focusArea === focusArea);
}

/**
 * Get workout plans by difficulty
 * @param {string} difficulty - Difficulty level (beginner, intermediate, advanced)
 * @returns {Array} Filtered workout plans
 */
export function getWorkoutPlansByDifficulty(difficulty) {
  return workoutPlans.filter(plan => plan.difficulty === difficulty);
}

/**
 * Expand a workout plan into full exercise objects
 * @param {Object} workoutPlan - Workout plan object
 * @param {Array} exercises - Full list of available exercises
 * @returns {Array} Array of exercise objects
 */
export function expandWorkoutPlan(workoutPlan, exercises) {
  if (!workoutPlan || !exercises) return [];
  
  return workoutPlan.exerciseIds
    .map(id => exercises.find(ex => ex.id === id))
    .filter(ex => ex !== undefined);
}

