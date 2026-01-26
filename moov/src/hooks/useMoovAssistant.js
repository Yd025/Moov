import { useState, useEffect, useRef, useCallback } from 'react';
import { getCues } from '../logic/exerciseConfigs';

/**
 * Enhanced Moov Assistant Hook - The "Brain" of the workout
 * 
 * Manages verbal cues, struggle detection, and user guidance with:
 * - Exercise-specific feedback messages
 * - Adaptive encouragement based on performance
 * - Debounced form corrections to avoid spam
 * - Milestone celebrations (halfway, last reps)
 * - Integration with adaptive engine suggestions
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.isFormGood - Current form quality status
 * @param {number} options.repCount - Current rep count
 * @param {number} options.totalReps - Total reps for current exercise
 * @param {string} options.exerciseId - Exercise ID for specific cues
 * @param {Object} options.exerciseConfig - Direct exercise config
 */
export function useMoovAssistant({
  isFormGood = true,
  repCount = 0,
  totalReps = 10,
  exerciseId = null,
  exerciseConfig = null,
} = {}) {
  // State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [struggleTimer, setStruggleTimer] = useState(0);
  const [currentCue, setCurrentCue] = useState('');
  const [encouragementType, setEncouragementType] = useState('steady');
  
  // Refs
  const struggleTimerRef = useRef(null);
  const formCorrectionTimerRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const speechQueueRef = useRef([]);
  const lastRepTimeRef = useRef(Date.now());
  const lastRepCountRef = useRef(0);
  const lastFormFeedbackRef = useRef(null);
  const lastFormFeedbackTimeRef = useRef(0);
  const badFormStartTimeRef = useRef(null);
  const milestonesSpokenRef = useRef(new Set());
  const exerciseCuesRef = useRef(null);

  // Configuration
  const DEBOUNCE_FORM_FEEDBACK_MS = 5000; // Don't repeat same feedback within 5 seconds
  const STRUGGLE_THRESHOLD_SECONDS = 12;
  const BAD_FORM_THRESHOLD_MS = 3000;

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
      
      // Preload voices
      const loadVoices = () => {
        const voices = speechSynthesisRef.current.getVoices();
        // Prefer a natural-sounding English voice
        const preferredVoice = voices.find(v => 
          v.lang.startsWith('en') && v.name.includes('Natural')
        ) || voices.find(v => v.lang.startsWith('en'));
        
        if (preferredVoice) {
          speechSynthesisRef.current.preferredVoice = preferredVoice;
        }
      };
      
      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Load exercise-specific cues
  useEffect(() => {
    if (exerciseConfig?.cues) {
      exerciseCuesRef.current = exerciseConfig.cues;
    } else if (exerciseId) {
      exerciseCuesRef.current = getCues(exerciseId);
    } else {
      exerciseCuesRef.current = null;
    }
    
    // Reset milestones for new exercise
    milestonesSpokenRef.current = new Set();
  }, [exerciseId, exerciseConfig]);

  /**
   * Speaks a message to the user using Web Speech API
   * @param {string} text - Text to speak
   * @param {number} rate - Speech rate (0.1 to 10, default 1)
   * @param {number} pitch - Speech pitch (0 to 2, default 1)
   * @param {boolean} interrupt - Whether to interrupt current speech
   */
  const speak = useCallback((text, rate = 1, pitch = 1, interrupt = true) => {
    if (!speechSynthesisRef.current) {
      console.warn('Speech synthesis not available');
      return;
    }

    if (interrupt) {
      // Cancel any ongoing speech
      speechSynthesisRef.current.cancel();
      speechQueueRef.current = [];
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1;
    
    // Use preferred voice if available
    if (speechSynthesisRef.current.preferredVoice) {
      utterance.voice = speechSynthesisRef.current.preferredVoice;
    }
    
    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentCue(text);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      // Process queue if any
      if (speechQueueRef.current.length > 0) {
        const next = speechQueueRef.current.shift();
        speak(next.text, next.rate, next.pitch, false);
      }
    };
    
    utterance.onerror = (error) => {
      if (error.error !== 'interrupted') {
        console.error('Speech synthesis error:', error);
      }
      setIsSpeaking(false);
    };

    speechSynthesisRef.current.speak(utterance);
  }, []);

  /**
   * Queues a message to be spoken after current speech
   */
  const queueSpeak = useCallback((text, rate = 1, pitch = 1) => {
    if (isSpeaking) {
      speechQueueRef.current.push({ text, rate, pitch });
    } else {
      speak(text, rate, pitch);
    }
  }, [isSpeaking, speak]);

  /**
   * Stops any ongoing speech
   */
  const stopSpeaking = useCallback(() => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      speechQueueRef.current = [];
      setIsSpeaking(false);
      setCurrentCue('');
    }
  }, []);

  /**
   * Records a successful rep and resets struggle timer
   */
  const recordRep = useCallback(() => {
    lastRepTimeRef.current = Date.now();
    setStruggleTimer(0);
    setShowSkipButton(false);
    
    // Clear any existing struggle timer
    if (struggleTimerRef.current) {
      clearInterval(struggleTimerRef.current);
      struggleTimerRef.current = null;
    }
  }, []);

  /**
   * Starts monitoring for struggle (no rep for threshold seconds)
   */
  const startStruggleMonitoring = useCallback(() => {
    // Clear any existing timer
    if (struggleTimerRef.current) {
      clearInterval(struggleTimerRef.current);
    }
    
    lastRepTimeRef.current = Date.now();

    struggleTimerRef.current = setInterval(() => {
      const timeSinceLastRep = (Date.now() - lastRepTimeRef.current) / 1000;
      setStruggleTimer(timeSinceLastRep);
      
      if (timeSinceLastRep > STRUGGLE_THRESHOLD_SECONDS && !showSkipButton) {
        setShowSkipButton(true);
        speak("This looks tough. Do you want to skip this move?", 0.9, 1);
      }
    }, 1000);
  }, [speak, showSkipButton]);

  /**
   * Stops struggle monitoring
   */
  const stopStruggleMonitoring = useCallback(() => {
    if (struggleTimerRef.current) {
      clearInterval(struggleTimerRef.current);
      struggleTimerRef.current = null;
    }
    setStruggleTimer(0);
    setShowSkipButton(false);
  }, []);

  /**
   * Gets encouragement phrases based on performance type
   */
  const getEncouragementPhrases = useCallback((type) => {
    const phrases = {
      excelling: [
        "Incredible work!",
        "You're on fire!",
        "Absolutely crushing it!",
        "Perfect form!",
        "You make this look easy!",
      ],
      improving: [
        "Getting better every rep!",
        "I can see you improving!",
        "That's the way!",
        "Your form is looking better!",
        "Nice progress!",
      ],
      steady: [
        "Good job!",
        "Keep it up!",
        "Nice work!",
        "You're doing great!",
        "Looking good!",
      ],
      struggling: [
        "You've got this!",
        "Take your time!",
        "Every rep counts!",
        "Small movements are still progress!",
        "Keep going, you're doing great!",
      ],
      fatigued: [
        "Almost there!",
        "Stay strong!",
        "You can do it!",
        "Push through!",
        "Final stretch!",
      ],
    };
    
    return phrases[type] || phrases.steady;
  }, []);

  /**
   * Provides positive feedback based on encouragement type
   */
  const givePositiveFeedback = useCallback((type = null) => {
    const feedbackType = type || encouragementType;
    const phrases = getEncouragementPhrases(feedbackType);
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    speak(randomPhrase);
  }, [encouragementType, getEncouragementPhrases, speak]);

  /**
   * Provides form correction cues with debouncing
   * @param {string} feedback - Feedback message
   * @param {string} severity - 'info' | 'warning'
   */
  const giveFormCorrection = useCallback((feedback, severity = 'info') => {
    const now = Date.now();
    
    // Debounce: Don't repeat same feedback within threshold
    if (feedback === lastFormFeedbackRef.current && 
        now - lastFormFeedbackTimeRef.current < DEBOUNCE_FORM_FEEDBACK_MS) {
      return;
    }
    
    lastFormFeedbackRef.current = feedback;
    lastFormFeedbackTimeRef.current = now;
    
    // Adjust speech based on severity
    const rate = severity === 'warning' ? 0.85 : 0.9;
    const pitch = severity === 'warning' ? 1.1 : 1.0;
    
    speak(feedback, rate, pitch);
  }, [speak]);

  /**
   * Introduces the next exercise with optional cues
   * @param {Object} exercise - Exercise object with name and reps
   */
  const introduceExercise = useCallback((exercise) => {
    // Reset state for new exercise
    lastRepCountRef.current = 0;
    milestonesSpokenRef.current = new Set();
    lastFormFeedbackRef.current = null;
    lastFormFeedbackTimeRef.current = 0;
    
    const intro = `Let's do ${exercise.reps || 10} ${exercise.name || 'repetitions'}`;
    speak(intro, 0.85, 1);
    
    // Queue the starting cue if available
    const cues = exerciseCuesRef.current || exercise.cues;
    if (cues?.start) {
      setTimeout(() => {
        speak(cues.start, 0.9, 1);
      }, 2000);
    }
  }, [speak]);

  /**
   * Counts reps during exercise with milestone announcements
   * @param {number} currentRep - Current rep count
   * @param {number} total - Total reps for this exercise
   */
  const countRep = useCallback((currentRep, total = totalReps) => {
    if (currentRep <= 0 || currentRep > total) return;
    
    // Number words for natural speech
    const repWords = [
      'One', 'Two', 'Three', 'Four', 'Five',
      'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
      'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'
    ];
    
    const repText = currentRep <= 20 ? repWords[currentRep - 1] : String(currentRep);
    
    // Determine what to say
    const remaining = total - currentRep;
    
    if (currentRep === total) {
      // Final rep - celebrate!
      speak(`${repText}! Great job, you did it!`, 1, 1.2);
    } else if (remaining === 2 && !milestonesSpokenRef.current.has('last3')) {
      // 3 reps left
      milestonesSpokenRef.current.add('last3');
      speak(`${repText}! Just 2 more to go!`, 1, 1.1);
    } else if (remaining === 1 && !milestonesSpokenRef.current.has('last1')) {
      // Last rep coming
      milestonesSpokenRef.current.add('last1');
      speak(`${repText}! Last one, give it your all!`, 1, 1.2);
    } else if (currentRep === Math.floor(total / 2) && !milestonesSpokenRef.current.has('halfway')) {
      // Halfway point
      milestonesSpokenRef.current.add('halfway');
      speak(`${repText}! Halfway there!`, 1, 1.1);
    } else {
      // Regular rep count
      speak(repText, 1.1, 1.2);
    }
  }, [totalReps, speak]);

  /**
   * Speaks the peak cue for an exercise
   */
  const speakPeakCue = useCallback(() => {
    const cues = exerciseCuesRef.current;
    if (cues?.peak) {
      speak(cues.peak, 0.9, 1);
    }
  }, [speak]);

  /**
   * Speaks the return cue for an exercise
   */
  const speakReturnCue = useCallback(() => {
    const cues = exerciseCuesRef.current;
    if (cues?.return) {
      speak(cues.return, 0.9, 1);
    }
  }, [speak]);

  /**
   * Updates encouragement type based on adaptive engine feedback
   * @param {string} type - Encouragement type from adaptive engine
   */
  const setAdaptiveEncouragement = useCallback((type) => {
    setEncouragementType(type);
    
    // Optionally speak encouragement when type changes to positive
    if (type === 'improving' || type === 'excelling') {
      givePositiveFeedback(type);
    }
  }, [givePositiveFeedback]);

  /**
   * Announces rest time
   * @param {number} seconds - Rest duration in seconds
   */
  const announceRest = useCallback((seconds = 30) => {
    speak(`Rest for ${seconds} seconds. Take a breather!`, 0.9, 1);
  }, [speak]);

  /**
   * Announces workout completion
   * @param {Object} summary - Workout summary stats
   */
  const announceWorkoutComplete = useCallback((summary = {}) => {
    const { totalReps = 0, duration = 0 } = summary;
    
    if (totalReps > 0) {
      speak(`Congratulations! You completed ${totalReps} reps in ${duration} minutes! Great workout!`, 0.9, 1.1);
    } else {
      speak("Congratulations! You completed your workout! Great job!", 0.9, 1.1);
    }
  }, [speak]);

  /**
   * Speaks an adaptive adjustment message
   * @param {Object} adjustment - Adjustment from adaptive engine
   */
  const speakAdjustment = useCallback((adjustment) => {
    if (adjustment?.suggestedCue) {
      speak(adjustment.suggestedCue, 0.9, 1);
    }
  }, [speak]);

  // Monitor form quality and provide corrections after threshold
  useEffect(() => {
    if (!isFormGood) {
      // Start tracking bad form time
      if (badFormStartTimeRef.current === null) {
        badFormStartTimeRef.current = Date.now();
      }
      
      // Check if bad form has persisted for more than threshold
      if (formCorrectionTimerRef.current) {
        clearTimeout(formCorrectionTimerRef.current);
      }
      
      formCorrectionTimerRef.current = setTimeout(() => {
        const timeInBadForm = Date.now() - (badFormStartTimeRef.current || Date.now());
        if (timeInBadForm >= BAD_FORM_THRESHOLD_MS && !isFormGood) {
          // Provide form correction - use exercise-specific cue if available
          const cues = exerciseCuesRef.current;
          if (cues?.form) {
            giveFormCorrection(cues.form);
          } else {
            giveFormCorrection("Focus on your form - slow and controlled movements");
          }
        }
      }, BAD_FORM_THRESHOLD_MS);
    } else {
      // Form is good, reset tracking
      badFormStartTimeRef.current = null;
      if (formCorrectionTimerRef.current) {
        clearTimeout(formCorrectionTimerRef.current);
        formCorrectionTimerRef.current = null;
      }
    }
    
    return () => {
      if (formCorrectionTimerRef.current) {
        clearTimeout(formCorrectionTimerRef.current);
      }
    };
  }, [isFormGood, giveFormCorrection]);

  // Auto-count reps when repCount increases
  useEffect(() => {
    if (repCount > lastRepCountRef.current && repCount > 0) {
      countRep(repCount, totalReps);
      lastRepCountRef.current = repCount;
      
      // Also record the rep for struggle monitoring
      recordRep();
    }
  }, [repCount, totalReps, countRep, recordRep]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStruggleMonitoring();
      stopSpeaking();
      if (formCorrectionTimerRef.current) {
        clearTimeout(formCorrectionTimerRef.current);
      }
    };
  }, [stopStruggleMonitoring, stopSpeaking]);

  return {
    // State
    isSpeaking,
    showSkipButton,
    struggleTimer,
    currentCue,
    encouragementType,
    
    // Core actions
    speak,
    queueSpeak,
    stopSpeaking,
    
    // Rep management
    recordRep,
    countRep,
    
    // Struggle monitoring
    startStruggleMonitoring,
    stopStruggleMonitoring,
    
    // Feedback
    givePositiveFeedback,
    giveFormCorrection,
    
    // Exercise flow
    introduceExercise,
    speakPeakCue,
    speakReturnCue,
    announceRest,
    announceWorkoutComplete,
    
    // Adaptive integration
    setAdaptiveEncouragement,
    speakAdjustment,
  };
}
