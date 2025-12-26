import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Moov Assistant Hook - The "Brain" of the workout
 * Manages verbal cues, struggle detection, and user guidance during exercises
 */
export function useMoovAssistant() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [struggleTimer, setStruggleTimer] = useState(0);
  const [currentCue, setCurrentCue] = useState('');
  
  const struggleTimerRef = useRef(null);
  const speechSynthesisRef = useRef(null);
  const lastRepTimeRef = useRef(Date.now());

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
   * Starts monitoring for struggle (no rep for 10 seconds)
   */
  const startStruggleMonitoring = useCallback(() => {
    // Clear any existing timer
    if (struggleTimerRef.current) {
      clearInterval(struggleTimerRef.current);
    }

    struggleTimerRef.current = setInterval(() => {
      const timeSinceLastRep = (Date.now() - lastRepTimeRef.current) / 1000;
      
      if (timeSinceLastRep > 10) {
        setStruggleTimer(timeSinceLastRep);
        setShowSkipButton(true);
        speak("Do you want to skip this move?");
      } else {
        setStruggleTimer(timeSinceLastRep);
      }
    }, 1000);
  }, [speak]);

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
      speak(currentRep.toString(), 1, 1.2);
    }
    if (currentRep === totalReps) {
      setTimeout(() => {
        speak("Great job! Rest for a moment.", 0.9, 1);
      }, 500);
    }
  }, [speak]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStruggleMonitoring();
      stopSpeaking();
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

