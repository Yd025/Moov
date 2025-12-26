/**
 * Filter Engine - Generates personalized daily workout based on user profile
 * Filters exercises based on mobility aids, constraints, and accessibility needs
 */

/**
 * Generates a daily workout plan filtered by user profile
 * @param {Object} userProfile - User's mobility profile and constraints
 * @param {Array} exercises - Full list of available exercises
 * @returns {Array} Filtered exercises suitable for the user
 */
export function generateDailyMoov(userProfile, exercises) {
  if (!userProfile || !exercises || exercises.length === 0) {
    return [];
  }

  let filteredExercises = [...exercises];

  // Filter out exercises that require standing if user uses wheelchair
  if (userProfile.mobility === 'wheelchair') {
    filteredExercises = filteredExercises.filter(exercise => {
      // Remove exercises that require standing
      if (exercise.tags && exercise.tags.includes('requires_standing')) {
        return false;
      }
      return true;
    });
  }

  // Filter by constraint area if specified
  if (userProfile.constraint) {
    const constraintLower = userProfile.constraint.toLowerCase();
    
    if (constraintLower.includes('upper')) {
      // Remove exercises that primarily target lower body
      filteredExercises = filteredExercises.filter(exercise => {
        if (exercise.tags && exercise.tags.includes('lower_body_only')) {
          return false;
        }
        return true;
      });
    }
    
    if (constraintLower.includes('lower')) {
      // Remove exercises that primarily target upper body
      filteredExercises = filteredExercises.filter(exercise => {
        if (exercise.tags && exercise.tags.includes('upper_body_only')) {
          return false;
        }
        return true;
      });
    }
    
    if (constraintLower.includes('hand') || constraintLower.includes('grip')) {
      // Remove exercises that require strong grip
      filteredExercises = filteredExercises.filter(exercise => {
        if (exercise.tags && exercise.tags.includes('requires_grip')) {
          return false;
        }
        return true;
      });
    }
  }

  // Filter by mobility aid
  if (userProfile.mobilityAid) {
    const aid = userProfile.mobilityAid.toLowerCase();
    
    if (aid === 'walker' || aid === 'cane') {
      // Remove exercises that require both hands free
      filteredExercises = filteredExercises.filter(exercise => {
        if (exercise.tags && exercise.tags.includes('requires_both_hands_free')) {
          return false;
        }
        return true;
      });
    }
  }

  // Apply senior mode adjustments if enabled
  if (userProfile.ageFactor === 'senior') {
    // Prefer exercises with lower intensity
    filteredExercises = filteredExercises.filter(exercise => {
      if (exercise.tags && exercise.tags.includes('high_intensity')) {
        return false;
      }
      return true;
    });
  }

  // Shuffle and select 3 exercises for daily workout
  const shuffled = filteredExercises.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

/**
 * Validates if an exercise is suitable for a user profile
 * @param {Object} exercise - Exercise object to validate
 * @param {Object} userProfile - User's mobility profile
 * @returns {boolean} True if exercise is suitable
 */
export function isExerciseSuitable(exercise, userProfile) {
  if (!exercise || !userProfile) return false;

  // Check wheelchair constraint
  if (userProfile.mobility === 'wheelchair' && exercise.tags?.includes('requires_standing')) {
    return false;
  }

  return true;
}

/**
 * Generates a daily workout plan filtered by user profile
 * @param {Object} userProfile - User's mobility profile and constraints
 * @param {Array} workoutPlans - Full list of available workout plans
 * @returns {Object|null} Filtered workout plan suitable for the user
 */
export function generateDailyWorkoutPlan(userProfile, workoutPlans) {
  if (!userProfile || !workoutPlans || workoutPlans.length === 0) {
    return null;
  }

  let filteredPlans = [...workoutPlans];

  // Filter out plans that require standing if user uses wheelchair
  if (userProfile.mobility === 'wheelchair') {
    filteredPlans = filteredPlans.filter(plan => {
      if (plan.tags && plan.tags.includes('requires_standing')) {
        return false;
      }
      return true;
    });
  }

  // Filter by constraint area if specified
  if (userProfile.constraint) {
    const constraintLower = userProfile.constraint.toLowerCase();
    
    // Prefer plans that match the user's focus area
    if (constraintLower.includes('upper')) {
      filteredPlans = filteredPlans.filter(plan => {
        // Keep plans that focus on upper body or full body
        return plan.focusArea === 'upper_body' || plan.focusArea === 'full_body' || plan.focusArea === 'hands_grip';
      });
    }
    
    if (constraintLower.includes('lower')) {
      filteredPlans = filteredPlans.filter(plan => {
        // Keep plans that focus on lower body or full body
        return plan.focusArea === 'lower_body' || plan.focusArea === 'full_body';
      });
    }
    
    if (constraintLower.includes('hand') || constraintLower.includes('grip')) {
      filteredPlans = filteredPlans.filter(plan => {
        // Keep plans that focus on hands/grip
        return plan.focusArea === 'hands_grip' || plan.focusArea === 'upper_body';
      });
    }
  }

  // Filter by mobility aid
  if (userProfile.mobilityAid) {
    const aid = userProfile.mobilityAid.toLowerCase();
    
    if (aid === 'walker' || aid === 'cane') {
      // Remove plans that require both hands free
      filteredPlans = filteredPlans.filter(plan => {
        if (plan.tags && plan.tags.includes('requires_both_hands_free')) {
          return false;
        }
        return true;
      });
    }
  }

  // Apply senior mode adjustments if enabled
  if (userProfile.ageFactor === 'senior') {
    // Prefer beginner difficulty plans
    filteredPlans = filteredPlans.filter(plan => {
      if (plan.tags && plan.tags.includes('high_intensity')) {
        return false;
      }
      return plan.difficulty === 'beginner';
    });
  }

  // If no plans match, return null
  if (filteredPlans.length === 0) {
    return null;
  }

  // Shuffle and select one plan for daily workout
  const shuffled = filteredPlans.sort(() => Math.random() - 0.5);
  return shuffled[0];
}

/**
 * Validates if a workout plan is suitable for a user profile
 * @param {Object} workoutPlan - Workout plan object to validate
 * @param {Object} userProfile - User's mobility profile
 * @returns {boolean} True if workout plan is suitable
 */
export function isWorkoutPlanSuitable(workoutPlan, userProfile) {
  if (!workoutPlan || !userProfile) return false;

  // Check wheelchair constraint
  if (userProfile.mobility === 'wheelchair' && workoutPlan.tags?.includes('requires_standing')) {
    return false;
  }

  return true;
}

