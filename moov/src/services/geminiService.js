/**
 * Gemini AI Service
 * 
 * Integrates with Google's Gemini API for personalized exercise generation.
 * Uses the free tier (15 requests/minute, 1M tokens/month).
 * 
 * Features:
 * - Generates exercises tailored to user's specific abilities and limitations
 * - Includes safety checks and appropriate modifications
 * - Parses structured JSON responses for exercise data
 * - Falls back to template-based generation if API unavailable
 */

import { generateExercisesForProfile } from '../logic/exerciseTemplates';
import { getCachedExercises, cacheExercises, generateProfileHash } from './exerciseCache';

// Gemini API configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * Gets the Gemini API key from environment
 */
function getApiKey() {
  return import.meta.env.VITE_GEMINI_API_KEY || null;
}

/**
 * Checks if Gemini API is available
 */
export function isGeminiAvailable() {
  const apiKey = getApiKey();
  return apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.length > 10;
}

/**
 * Builds the exercise generation prompt
 */
function buildExercisePrompt(userProfile, count = 5) {
  const positionDescriptions = {
    lying: 'lying down (bedridden)',
    wheelchair: 'using a wheelchair',
    sitting: 'seated',
    standing_supported: 'standing with support',
    standing_unassisted: 'standing without support',
  };
  
  const overheadDescriptions = {
    full: 'full overhead range',
    shoulder: 'can raise arms to shoulder height',
    chest: 'can raise arms to chest height only',
    one_sided: 'asymmetric - one side has more mobility than the other',
  };
  
  const gripDescriptions = {
    strong: 'strong grip - can hold weights',
    assisted: 'assisted grip - can hold with support',
    none: 'no grip - cannot hold objects',
  };
  
  const energyDescriptions = {
    standard: 'normal energy levels',
    conserve: 'needs to conserve energy (chronic fatigue)',
    avoid_heat: 'needs to avoid overheating (temperature sensitivity)',
  };

  const position = positionDescriptions[userProfile.movementPosition] || 'seated';
  const overhead = overheadDescriptions[userProfile.overheadRange] || 'full range';
  const grip = gripDescriptions[userProfile.gripStrength] || 'normal grip';
  const energy = energyDescriptions[userProfile.energyFlow] || 'normal energy';
  
  // Format red zones
  const redZones = userProfile.redZones && userProfile.redZones.length > 0
    ? userProfile.redZones.map(zone => zone.replace(/_/g, ' ')).join(', ')
    : 'none';
  
  // Format assistive gear
  const gear = userProfile.assistiveGear && userProfile.assistiveGear.length > 0
    ? userProfile.assistiveGear.join(', ')
    : 'none';

  return `You are an adaptive fitness AI for users with disabilities. Generate ${count} safe, appropriate exercises for a user with these characteristics:

USER PROFILE:
- Position: ${position}
- Movement Range: ${overhead}
- Grip Ability: ${grip}
- Energy Management: ${energy}
- Assistive Equipment: ${gear}
- Areas to AVOID (pain/sensitivity): ${redZones}

IMPORTANT SAFETY RULES:
1. NEVER suggest exercises that target the user's red zones (areas to avoid)
2. ALL exercises must be performable in the user's position
3. If grip is "none" or "assisted", avoid exercises requiring holding weights
4. If energy is "conserve", keep exercises low-intensity with rest periods
5. If energy is "avoid_heat", avoid cardio or high-intensity movements
6. Each exercise should be achievable and encouraging, not frustrating

RESPONSE FORMAT:
Return ONLY a valid JSON array with no additional text. Each exercise object must have:
{
  "name": "Exercise Name",
  "description": "Clear, encouraging instructions for performing the exercise",
  "reps": 10,
  "duration": 60,
  "holdSeconds": 0,
  "difficulty": 1-10,
  "bodyParts": ["left_arm", "right_arm"],
  "trackingType": "angle_flex|angle_extend|rotation|isometric|timer|manual",
  "formCues": ["Keep your back straight", "Move slowly and controlled"],
  "modifications": {
    "easier": "Description of easier version",
    "harder": "Description of harder version"
  },
  "safetyNotes": "Any important safety considerations"
}

Generate ${count} varied exercises that work different body parts while respecting all limitations.`;
}

/**
 * Parses the Gemini API response
 */
function parseExerciseResponse(responseData) {
  try {
    // Extract text from Gemini response structure
    const text = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error('No text in Gemini response');
      return null;
    }
    
    // Try to extract JSON from the response
    // Sometimes the model adds markdown code blocks
    let jsonText = text;
    
    // Remove markdown code blocks if present
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }
    
    // Parse the JSON
    const exercises = JSON.parse(jsonText);
    
    if (!Array.isArray(exercises)) {
      console.error('Gemini response is not an array');
      return null;
    }
    
    // Validate and normalize each exercise
    return exercises.map((ex, index) => ({
      id: `gemini_${Date.now()}_${index}`,
      name: ex.name || `Exercise ${index + 1}`,
      description: ex.description || '',
      reps: parseInt(ex.reps) || 10,
      duration: parseInt(ex.duration) || 60,
      holdSeconds: parseInt(ex.holdSeconds) || 0,
      difficulty: Math.min(10, Math.max(1, parseInt(ex.difficulty) || 5)),
      bodyParts: Array.isArray(ex.bodyParts) ? ex.bodyParts : [],
      trackingType: ex.trackingType || 'manual',
      formCues: Array.isArray(ex.formCues) ? ex.formCues : [],
      modifications: ex.modifications || {},
      safetyNotes: ex.safetyNotes || '',
      source: 'gemini',
      tags: generateTagsFromExercise(ex),
      tracking: {
        type: mapTrackingType(ex.trackingType),
      },
    }));
  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return null;
  }
}

/**
 * Maps Gemini tracking type to internal tracking type
 */
function mapTrackingType(type) {
  const mapping = {
    'angle_flex': 'angle',
    'angle_extend': 'angle',
    'rotation': 'rotation',
    'isometric': 'timer',
    'timer': 'timer',
    'manual': 'manual',
  };
  return mapping[type] || 'manual';
}

/**
 * Generates tags from exercise data
 */
function generateTagsFromExercise(exercise) {
  const tags = ['ai_generated'];
  
  if (exercise.bodyParts) {
    exercise.bodyParts.forEach(part => {
      if (part.includes('arm') || part.includes('shoulder') || part.includes('elbow')) {
        tags.push('upper_body');
      }
      if (part.includes('leg') || part.includes('knee') || part.includes('hip')) {
        tags.push('lower_body');
      }
      if (part.includes('core') || part.includes('torso')) {
        tags.push('core');
      }
    });
  }
  
  if (exercise.difficulty <= 3) {
    tags.push('beginner');
  } else if (exercise.difficulty <= 6) {
    tags.push('intermediate');
  } else {
    tags.push('advanced');
  }
  
  return [...new Set(tags)];
}

/**
 * Generates personalized exercises using Gemini AI
 * Falls back to template-based generation if API unavailable
 * 
 * @param {Object} userProfile - User's onboarding profile
 * @param {number} count - Number of exercises to generate
 * @param {boolean} forceRefresh - Skip cache and generate new exercises
 * @returns {Promise<Array>} Generated exercises
 */
export async function generatePersonalizedExercises(userProfile, count = 5, forceRefresh = false) {
  // Check cache first (unless forcing refresh)
  if (!forceRefresh) {
    const profileHash = generateProfileHash(userProfile);
    const cached = getCachedExercises(profileHash);
    if (cached) {
      console.log('Using cached exercises');
      return cached;
    }
  }
  
  // Check if Gemini is available
  if (!isGeminiAvailable()) {
    console.log('Gemini API not available, using template-based generation');
    return generateExercisesForProfile(userProfile, count);
  }
  
  try {
    const apiKey = getApiKey();
    const prompt = buildExercisePrompt(userProfile, count);
    
    console.log('Calling Gemini API for personalized exercises...');
    
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    const exercises = parseExerciseResponse(data);
    
    if (exercises && exercises.length > 0) {
      // Cache the results
      const profileHash = generateProfileHash(userProfile);
      cacheExercises(profileHash, exercises);
      
      console.log(`Generated ${exercises.length} exercises from Gemini`);
      return exercises;
    }
    
    // Fallback if parsing failed
    console.log('Failed to parse Gemini response, using template-based generation');
    return generateExercisesForProfile(userProfile, count);
    
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Fallback to template-based generation
    return generateExercisesForProfile(userProfile, count);
  }
}

/**
 * Generates a modified version of an exercise based on performance
 * 
 * @param {Object} exercise - Original exercise
 * @param {Object} performance - User's performance metrics
 * @returns {Promise<Object>} Modified exercise
 */
export async function generateExerciseModification(exercise, performance) {
  if (!isGeminiAvailable()) {
    // Simple rule-based modification
    return applyRuleBasedModification(exercise, performance);
  }
  
  try {
    const apiKey = getApiKey();
    
    const prompt = `Given this exercise and user performance, suggest a modification:

EXERCISE: ${exercise.name}
Description: ${exercise.description}
Current reps: ${exercise.reps}
Current difficulty: ${exercise.difficulty}/10

PERFORMANCE:
- Completed ${performance.completedReps}/${exercise.reps} reps
- Average form quality: ${(performance.avgFormScore * 100).toFixed(0)}%
- Average range of motion: ${(performance.avgROM * 100).toFixed(0)}% of target

Based on this performance, should we make the exercise:
1. EASIER (user struggling - reduce reps, smaller range, add rest)
2. SAME (user doing well - maintain current level)
3. HARDER (user excelling - increase reps, bigger range, less rest)

Respond with a JSON object:
{
  "recommendation": "easier|same|harder",
  "reason": "Brief explanation",
  "modifications": {
    "reps": new_rep_count,
    "holdSeconds": new_hold_time,
    "restSeconds": suggested_rest_between_reps,
    "formCue": "New form cue to help user"
  }
}`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
        },
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }
    
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // Extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const modification = JSON.parse(jsonMatch[0]);
      return {
        ...exercise,
        reps: modification.modifications?.reps || exercise.reps,
        holdSeconds: modification.modifications?.holdSeconds || exercise.holdSeconds,
        restSeconds: modification.modifications?.restSeconds || 0,
        _modification: modification,
      };
    }
    
    return applyRuleBasedModification(exercise, performance);
    
  } catch (error) {
    console.error('Error getting AI modification:', error);
    return applyRuleBasedModification(exercise, performance);
  }
}

/**
 * Simple rule-based modification when AI is unavailable
 */
function applyRuleBasedModification(exercise, performance) {
  const modified = { ...exercise };
  
  const completionRate = performance.completedReps / exercise.reps;
  const formQuality = performance.avgFormScore || 1;
  const romAchieved = performance.avgROM || 1;
  
  // User struggling (< 60% completion or < 70% form quality)
  if (completionRate < 0.6 || formQuality < 0.7) {
    modified.reps = Math.max(3, Math.floor(exercise.reps * 0.7));
    modified._modification = {
      recommendation: 'easier',
      reason: 'Reduced reps to help you maintain good form',
    };
  }
  // User excelling (100% completion with > 90% form and > 100% ROM)
  else if (completionRate >= 1 && formQuality > 0.9 && romAchieved > 1) {
    modified.reps = Math.min(20, Math.ceil(exercise.reps * 1.2));
    modified._modification = {
      recommendation: 'harder',
      reason: 'Great job! Adding more reps to challenge you',
    };
  }
  // User doing well - maintain
  else {
    modified._modification = {
      recommendation: 'same',
      reason: 'Perfect pace - keep it up!',
    };
  }
  
  return modified;
}

/**
 * Generates a workout explanation for the user
 */
export async function explainWorkout(exercises, userProfile) {
  if (!isGeminiAvailable()) {
    return generateDefaultExplanation(exercises);
  }
  
  try {
    const apiKey = getApiKey();
    const exerciseList = exercises.map(e => e.name).join(', ');
    
    const prompt = `As a friendly fitness coach for someone with accessibility needs, briefly explain why these exercises were chosen:

Exercises: ${exerciseList}
User position: ${userProfile.movementPosition}
Areas to avoid: ${userProfile.redZones?.join(', ') || 'none'}

Write 2-3 encouraging sentences explaining how these exercises are tailored for them. Be warm and supportive.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 256,
        },
      }),
    });
    
    if (!response.ok) {
      return generateDefaultExplanation(exercises);
    }
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || generateDefaultExplanation(exercises);
    
  } catch (error) {
    return generateDefaultExplanation(exercises);
  }
}

/**
 * Default workout explanation when AI is unavailable
 */
function generateDefaultExplanation(exercises) {
  const count = exercises.length;
  const bodyParts = [...new Set(exercises.flatMap(e => e.bodyParts || []))];
  const areas = bodyParts.length > 0 
    ? bodyParts.slice(0, 3).map(p => p.replace(/_/g, ' ')).join(', ')
    : 'your whole body';
  
  return `Today's workout includes ${count} exercises designed just for you, focusing on ${areas}. Each exercise has been selected to match your abilities and avoid any areas of sensitivity. Let's get moving!`;
}
