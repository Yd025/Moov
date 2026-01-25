/**
 * Filter Engine - Generates personalized daily workout based on user profile
 * Implements adaptive filtering per Business Requirements V1.0
 * 
 * Profile Fields Used:
 * - movementPosition: Base position (standing, sitting, wheelchair, lying)
 * - wheelchairTransfer: Whether user will transfer for workout
 * - assistiveGear: Equipment to whitelist in camera view
 * - overheadRange: Max comfortable overhead range
 * - asymmetryConfig: Left/right side strength difference
 * - gripStrength: Grip capability level
 * - energyFlow: Energy management preference
 * - redZones: Body areas to avoid targeting
 * - movementBox: Calibrated movement range coordinates
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

  // ========================================
  // ONB-001: Movement Position Filtering
  // ========================================
  const position = userProfile.movementPosition || userProfile.mobility;
  
  if (position === 'wheelchair' || position === 'sitting') {
    // Remove exercises that require standing
    filteredExercises = filteredExercises.filter(exercise => {
      if (exercise.tags?.includes('requires_standing')) {
        return false;
      }
      return true;
    });
    
    // If wheelchair user will transfer, allow some floor exercises
    if (position === 'wheelchair' && userProfile.wheelchairTransfer !== 'transfer') {
      filteredExercises = filteredExercises.filter(exercise => {
        if (exercise.tags?.includes('floor_only')) {
          return false;
        }
        return true;
      });
    }
  }
  
  if (position === 'lying') {
    // Only allow supine/lying exercises
    filteredExercises = filteredExercises.filter(exercise => {
      return exercise.tags?.includes('supine') || 
             exercise.tags?.includes('lying') ||
             exercise.tags?.includes('seated'); // Seated can often be done lying
    });
  }
  
  if (position === 'standing_supported') {
    // Remove exercises requiring balance without support
    filteredExercises = filteredExercises.filter(exercise => {
      if (exercise.tags?.includes('requires_balance')) {
        return false;
      }
      return true;
    });
  }

  // ========================================
  // ONB-002: Assistive Gear Considerations
  // ========================================
  const gear = userProfile.assistiveGear || [];
  
  if (gear.includes('walker') || gear.includes('cane')) {
    // Remove exercises that require both hands free unless user specified otherwise
    filteredExercises = filteredExercises.filter(exercise => {
      if (exercise.tags?.includes('requires_both_hands_free')) {
        return false;
      }
      return true;
    });
  }

  // ========================================
  // ONB-003: Overhead Range Filtering
  // ========================================
  if (userProfile.overheadRange) {
    switch (userProfile.overheadRange) {
      case 'shoulder':
        // Remove exercises requiring full overhead reach
        filteredExercises = filteredExercises.filter(exercise => {
          if (exercise.tags?.includes('requires_full_overhead')) {
            return false;
          }
          return true;
        });
        break;
      case 'chest':
        // Remove exercises requiring shoulder-height or above reach
        filteredExercises = filteredExercises.filter(exercise => {
          if (exercise.tags?.includes('requires_full_overhead') ||
              exercise.tags?.includes('requires_shoulder_height')) {
            return false;
          }
          return true;
        });
        break;
      case 'one_sided':
        // Prefer exercises that can be done unilaterally
        // Don't filter out, but mark for modification
        break;
    }
  }

  // ========================================
  // ONB-004: Grip Strength Filtering
  // ========================================
  if (userProfile.gripStrength) {
    switch (userProfile.gripStrength) {
      case 'assisted':
        // Remove exercises requiring strong grip
        filteredExercises = filteredExercises.filter(exercise => {
          if (exercise.tags?.includes('requires_strong_grip')) {
            return false;
          }
          return true;
        });
        break;
      case 'none':
        // Remove all exercises requiring grip
        filteredExercises = filteredExercises.filter(exercise => {
          if (exercise.tags?.includes('requires_grip') ||
              exercise.tags?.includes('requires_strong_grip')) {
            return false;
          }
          return true;
        });
        break;
    }
  }

  // ========================================
  // ONB-005: Energy Flow Filtering
  // ========================================
  if (userProfile.energyFlow) {
    switch (userProfile.energyFlow) {
      case 'delayed_onset':
        // Prefer lower intensity, more recovery-friendly exercises
        filteredExercises = filteredExercises.filter(exercise => {
          if (exercise.tags?.includes('high_intensity')) {
            return false;
          }
          return true;
        });
        break;
      case 'limited_spoons':
        // Prefer short, efficient exercises
        filteredExercises = filteredExercises.filter(exercise => {
          // Keep exercises under 90 seconds or marked as efficient
          return (exercise.duration <= 90) || exercise.tags?.includes('efficient');
        });
        break;
      case 'temperature_sensitive':
        // Remove high-cardio exercises
        filteredExercises = filteredExercises.filter(exercise => {
          if (exercise.tags?.includes('high_cardio') ||
              exercise.tags?.includes('raises_temperature')) {
            return false;
          }
          return true;
        });
        break;
    }
  }

  // ========================================
  // ONB-006: Red Zone (Pain Area) Filtering
  // ========================================
  if (userProfile.redZones && userProfile.redZones.length > 0) {
    filteredExercises = filteredExercises.filter(exercise => {
      // Check if exercise primarily targets any red zone
      const exerciseTargets = exercise.targetAreas || [];
      
      for (const zone of userProfile.redZones) {
        if (exerciseTargets.includes(zone)) {
          return false;
        }
        
        // Map common red zones to exercise tags
        const zoneTagMap = {
          'head_neck': ['targets_neck'],
          'left_shoulder': ['targets_shoulders', 'targets_left_arm'],
          'right_shoulder': ['targets_shoulders', 'targets_right_arm'],
          'chest': ['targets_chest'],
          'upper_back': ['targets_back', 'targets_upper_back'],
          'left_arm': ['targets_arms', 'targets_left_arm'],
          'right_arm': ['targets_arms', 'targets_right_arm'],
          'left_elbow': ['targets_arms', 'targets_left_arm'],
          'right_elbow': ['targets_arms', 'targets_right_arm'],
          'left_wrist_hand': ['targets_hands', 'targets_wrists'],
          'right_wrist_hand': ['targets_hands', 'targets_wrists'],
          'core_abdomen': ['targets_core', 'targets_abs'],
          'lower_back': ['targets_back', 'targets_lower_back'],
          'hips': ['targets_hips'],
          'left_thigh': ['targets_legs', 'targets_thighs'],
          'right_thigh': ['targets_legs', 'targets_thighs'],
          'left_knee': ['targets_legs', 'targets_knees'],
          'right_knee': ['targets_legs', 'targets_knees'],
          'left_lower_leg': ['targets_legs', 'targets_calves'],
          'right_lower_leg': ['targets_legs', 'targets_calves'],
          'left_ankle_foot': ['targets_ankles', 'targets_feet'],
          'right_ankle_foot': ['targets_ankles', 'targets_feet'],
        };
        
        const zoneTags = zoneTagMap[zone] || [];
        for (const tag of zoneTags) {
          if (exercise.tags?.includes(tag)) {
            return false;
          }
        }
      }
      
      return true;
    });
  }

  // ========================================
  // Legacy Compatibility
  // ========================================
  // Support old profile format (constraint, ageFactor)
  if (userProfile.constraint) {
    const constraintLower = userProfile.constraint.toLowerCase();
    
    if (constraintLower.includes('upper')) {
      filteredExercises = filteredExercises.filter(exercise => {
        return !exercise.tags?.includes('lower_body_only');
      });
    }
    
    if (constraintLower.includes('lower')) {
      filteredExercises = filteredExercises.filter(exercise => {
        return !exercise.tags?.includes('upper_body_only');
      });
    }
  }
  
  if (userProfile.ageFactor === 'senior') {
    filteredExercises = filteredExercises.filter(exercise => {
      return !exercise.tags?.includes('high_intensity');
    });
  }

  // ========================================
  // Select Daily Workout
  // ========================================
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

  const position = userProfile.movementPosition || userProfile.mobility;
  
  // Check wheelchair/seated constraint
  if ((position === 'wheelchair' || position === 'sitting') && 
      exercise.tags?.includes('requires_standing')) {
    return false;
  }

  // Check grip constraint
  if (userProfile.gripStrength === 'none' && 
      (exercise.tags?.includes('requires_grip') || 
       exercise.tags?.includes('requires_strong_grip'))) {
    return false;
  }

  // Check red zones
  if (userProfile.redZones?.length > 0) {
    for (const zone of userProfile.redZones) {
      if (exercise.targetAreas?.includes(zone)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Gets the success threshold for a movement based on user's calibrated range
 * @param {Object} userProfile - User's profile with movementBox data
 * @param {string} movementType - Type of movement ('overhead', 'side_reach', etc.)
 * @returns {number} Normalized threshold (0-1) for movement completion
 */
export function getMovementThreshold(userProfile, movementType) {
  const movementBox = userProfile.movementBox;
  
  // Default thresholds if no calibration data
  if (!movementBox || movementBox.skipped) {
    return {
      overhead: 0.2, // Y coordinate for overhead reach
      sideReachLeft: 0.1,
      sideReachRight: 0.9,
    }[movementType] || 0.5;
  }

  // Use calibrated values
  switch (movementType) {
    case 'overhead':
      return movementBox.overheadReach;
    case 'sideReachLeft':
      return movementBox.sideReach?.left || 0.1;
    case 'sideReachRight':
      return movementBox.sideReach?.right || 0.9;
    default:
      return 0.5;
  }
}

/**
 * Checks if an item should be whitelisted (not trigger form correction)
 * @param {Object} userProfile - User's profile with assistiveGear
 * @param {string} detectedItem - Item detected by camera
 * @returns {boolean} True if item should be ignored for form correction
 */
export function isWhitelistedGear(userProfile, detectedItem) {
  const gear = userProfile.assistiveGear || [];
  
  const gearKeywords = {
    'manual_wheelchair': ['wheelchair', 'chair', 'wheel'],
    'power_wheelchair': ['wheelchair', 'power', 'electric'],
    'walker': ['walker', 'rollator', 'frame'],
    'cane': ['cane', 'stick', 'crutch'],
    'prosthetics_upper': ['prosthetic', 'artificial arm', 'artificial hand'],
    'prosthetics_lower': ['prosthetic', 'artificial leg', 'artificial foot'],
    'orthotics': ['brace', 'orthotic', 'splint', 'support'],
  };

  const detectedLower = detectedItem.toLowerCase();
  
  for (const gearType of gear) {
    const keywords = gearKeywords[gearType] || [];
    for (const keyword of keywords) {
      if (detectedLower.includes(keyword)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Adjusts rep count and timing based on energy flow preference
 * @param {Object} userProfile - User's profile
 * @param {Object} exercise - Base exercise object
 * @returns {Object} Modified exercise with adjusted reps/duration
 */
export function adjustForEnergyFlow(userProfile, exercise) {
  const energyFlow = userProfile.energyFlow;
  let adjustedExercise = { ...exercise };

  switch (energyFlow) {
    case 'delayed_onset':
      // Reduce intensity by 20%
      adjustedExercise.reps = Math.ceil(exercise.reps * 0.8);
      adjustedExercise.restBetweenReps = (exercise.restBetweenReps || 2) + 1;
      break;
    case 'limited_spoons':
      // Reduce duration but keep intensity
      adjustedExercise.duration = Math.ceil(exercise.duration * 0.7);
      break;
    case 'temperature_sensitive':
      // Add longer rest periods
      adjustedExercise.restBetweenReps = (exercise.restBetweenReps || 2) + 2;
      adjustedExercise.restBetweenSets = (exercise.restBetweenSets || 30) + 15;
      break;
  }

  return adjustedExercise;
}
