import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Moov Assistant Hook - The "Brain" of the workout
 * Manages verbal cues, struggle detection, and user guidance during exercises
 * @param {Object} options - Configuration options
 * @param {boolean} options.isFormGood - Current form quality status
 * @param {number} options.repCount - Current rep count
 */
export function useMoovAssistant({ isFormGood = true, repCount = 0 } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [struggleTimer, setStruggleTimer] = useState(0);
  const [currentCue, setCurrentCue] = useState('');
  
  const struggleTimerRef = useRef(null);
  const formCorrectionTimerRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const lastRepTimeRef = useRef(Date.now());
  const lastRepCountRef = useRef(0);
  const badFormStartTimeRef = useRef(null);

  // Initialize speech synthesis
  useEffect(() => {
    if ('speechSynthesis' in window) {
      speechSynthesisRef.current = window.speechSynthesis;
    }
  }, []);

  /**
   * Speaks a message to the user using Web Speech API
   * @param {string} text - Text to speak
   * @param {number} rate - Speech rate (0.1 to 10, default 1)
   * @param {number} pitch - Speech pitch (0 to 2, default 1)
   */
  const speak = useCallback((text, rate = 1, pitch = 1) => {
    if (!speechSynthesisRef.current) {
      console.warn('Speech synthesis not available');
      return;
    }

    // Cancel any ongoing speech
    speechSynthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = 1;
    
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
    };

    speechSynthesisRef.current.speak(utterance);
    setCurrentCue(text);
  }, []);

  /**
   * Stops any ongoing speech
   */
  const stopSpeaking = useCallback(() => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
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
   * Starts monitoring for struggle (no rep for 12 seconds)
   */
  const startStruggleMonitoring = useCallback(() => {
    // Clear any existing timer
    if (struggleTimerRef.current) {
      clearInterval(struggleTimerRef.current);
    }

    struggleTimerRef.current = setInterval(() => {
      const timeSinceLastRep = (Date.now() - lastRepTimeRef.current) / 1000;
      
      if (timeSinceLastRep > 12) {
        setStruggleTimer(timeSinceLastRep);
        if (!showSkipButton) {
          setShowSkipButton(true);
          speak("This looks tough. Do you want to skip this move?");
        }
      } else {
        setStruggleTimer(timeSinceLastRep);
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
   * Provides positive feedback
   */
  const givePositiveFeedback = useCallback(() => {
    const feedbacks = [
      "Good job!",
      "Excellent!",
      "Keep it up!",
      "You're doing great!",
      "Nice work!"
    ];
    const randomFeedback = feedbacks[Math.floor(Math.random() * feedbacks.length)];
    speak(randomFeedback);
  }, [speak]);

  /**
   * Provides form correction cues
   * @param {string} direction - Direction to correct (e.g., "raise higher", "lower", "extend more")
   */
  const giveFormCorrection = useCallback((direction) => {
    speak(direction, 0.9, 1.1);
  }, [speak]);

  /**
   * Introduces the next exercise
   * @param {Object} exercise - Exercise object with name and reps
   */
  const introduceExercise = useCallback((exercise) => {
    const intro = `Let's do ${exercise.reps || 10} ${exercise.name || 'repetitions'}`;
    speak(intro, 0.85, 1);
  }, [speak]);

  /**
   * Counts reps during exercise
   * @param {number} currentRep - Current rep count
   * @param {number} totalReps - Total reps for this exercise
   */
  const countRep = useCallback((currentRep, totalReps) => {
    if (currentRep <= totalReps) {
      // Convert number to words for better speech
      const repWords = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
      const repText = currentRep <= 10 ? `${repWords[currentRep - 1]}!` : `${currentRep}!`;
      speak(repText, 1, 1.2);
    }
    if (currentRep === totalReps) {
      setTimeout(() => {
        speak("Great job! Rest for a moment.", 0.9, 1);
      }, 500);
    }
  }, [speak]);

  // Monitor form quality and provide corrections after 3 seconds
  useEffect(() => {
    if (!isFormGood) {
      // Start tracking bad form time
      if (badFormStartTimeRef.current === null) {
        badFormStartTimeRef.current = Date.now();
      }
      
      // Check if bad form has persisted for more than 3 seconds
      if (formCorrectionTimerRef.current) {
        clearTimeout(formCorrectionTimerRef.current);
      }
      
      formCorrectionTimerRef.current = setTimeout(() => {
        const timeInBadForm = Date.now() - badFormStartTimeRef.current;
        if (timeInBadForm >= 3000 && !isFormGood) {
          // Provide form correction
          giveFormCorrection("Straighten your arm and keep your form correct");
        }
      }, 3000);
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
  }, [isFormGood]); // Removed giveFormCorrection from deps to avoid re-running

  // Auto-count reps when repCount increases
  useEffect(() => {
    if (repCount > lastRepCountRef.current && repCount > 0) {
      // Rep count increased, automatically count it
      const repWords = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
      const repText = repCount <= 10 ? `${repWords[repCount - 1]}!` : `${repCount}!`;
      speak(repText, 1, 1.2);
      lastRepCountRef.current = repCount;
    }
  }, [repCount, speak]);

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
    
    // Actions
    speak,
    stopSpeaking,
    recordRep,
    startStruggleMonitoring,
    stopStruggleMonitoring,
    givePositiveFeedback,
    giveFormCorrection,
    introduceExercise,
    countRep,
  };
}

