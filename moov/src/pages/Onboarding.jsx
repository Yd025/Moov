import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import QuestionnaireStep from '../components/onboarding/QuestionnaireStep';
import BodyMap from '../components/onboarding/BodyMap';
import CalibrationScreen from '../components/onboarding/CalibrationScreen';
// TODO: Import Firebase functions
// import { doc, setDoc } from 'firebase/firestore';
// import { db } from '../config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Onboarding Page - Multi-step questionnaire to configure user profile
 * Implements adaptive engine profiling per Business Requirements V1.0
 * 
 * Screens:
 * 1. Movement Baseline (ONB-001) - Base position with wheelchair sub-question
 * 2. Assistive Context (ONB-002) - Multi-select gear whitelisting
 * 3. Range of Motion (ONB-003 & ONB-004) - Overhead range + grip
 * 4. Energy & Sensory (ONB-005 & ONB-006) - Energy flow + body map
 * 5. Active Calibration (ONB-007) - Camera-based movement box
 */

const TOTAL_STEPS = 6; // Including sub-screens

// Step identifiers
const STEPS = {
  MOVEMENT_BASELINE: 'movement_baseline',
  ASSISTIVE_CONTEXT: 'assistive_context',
  OVERHEAD_RANGE: 'overhead_range',
  GRIP_STRENGTH: 'grip_strength',
  ENERGY_FLOW: 'energy_flow',
  PAIN_ZONES: 'pain_zones',
  CALIBRATION: 'calibration',
};

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const [currentStep, setCurrentStep] = useState(STEPS.MOVEMENT_BASELINE);
  const [stepNumber, setStepNumber] = useState(1);
  
  // User profile state matching business requirements
  const [userProfile, setUserProfile] = useState({
    // ONB-001: Movement Baseline
    movementPosition: '', // 'standing_unassisted', 'standing_supported', 'sitting', 'wheelchair', 'lying'
    wheelchairTransfer: '', // 'stay_in_chair', 'transfer'
    
    // ONB-002: Assistive Context (multi-select)
    assistiveGear: [], // ['wheelchair', 'walker', 'cane', 'prosthetics', 'orthotics']
    
    // ONB-003: Overhead Range
    overheadRange: '', // 'full', 'shoulder', 'chest', 'one_sided'
    asymmetryConfig: '', // 'left_stronger', 'right_stronger' (if one_sided)
    
    // ONB-004: Grip Strength
    gripStrength: '', // 'strong', 'assisted', 'none'
    
    // ONB-005: Energy Flow
    energyFlow: '', // 'standard', 'delayed_onset', 'limited_spoons', 'temperature_sensitive'
    
    // ONB-006: Pain Zones (body map)
    redZones: [], // ['lower_back', 'left_shoulder', etc.]
    
    // ONB-007: Movement Calibration
    movementBox: null, // Captured movement range data
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Update a profile field
  const updateProfile = (field, value) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };

  // Navigation logic with step tracking
  const goToStep = (step) => {
    const stepOrder = [
      STEPS.MOVEMENT_BASELINE,
      STEPS.ASSISTIVE_CONTEXT,
      STEPS.OVERHEAD_RANGE,
      STEPS.GRIP_STRENGTH,
      STEPS.ENERGY_FLOW,
      STEPS.PAIN_ZONES,
      STEPS.CALIBRATION,
    ];
    const newStepNumber = stepOrder.indexOf(step) + 1;
    setStepNumber(Math.min(newStepNumber, TOTAL_STEPS));
    setCurrentStep(step);
  };

  const handleNext = () => {
    switch (currentStep) {
      case STEPS.MOVEMENT_BASELINE:
        goToStep(STEPS.ASSISTIVE_CONTEXT);
        break;
      case STEPS.ASSISTIVE_CONTEXT:
        goToStep(STEPS.OVERHEAD_RANGE);
        break;
      case STEPS.OVERHEAD_RANGE:
        goToStep(STEPS.GRIP_STRENGTH);
        break;
      case STEPS.GRIP_STRENGTH:
        goToStep(STEPS.ENERGY_FLOW);
        break;
      case STEPS.ENERGY_FLOW:
        goToStep(STEPS.PAIN_ZONES);
        break;
      case STEPS.PAIN_ZONES:
        goToStep(STEPS.CALIBRATION);
        break;
      default:
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case STEPS.ASSISTIVE_CONTEXT:
        goToStep(STEPS.MOVEMENT_BASELINE);
        break;
      case STEPS.OVERHEAD_RANGE:
        goToStep(STEPS.ASSISTIVE_CONTEXT);
        break;
      case STEPS.GRIP_STRENGTH:
        goToStep(STEPS.OVERHEAD_RANGE);
        break;
      case STEPS.ENERGY_FLOW:
        goToStep(STEPS.GRIP_STRENGTH);
        break;
      case STEPS.PAIN_ZONES:
        goToStep(STEPS.ENERGY_FLOW);
        break;
      case STEPS.CALIBRATION:
        goToStep(STEPS.PAIN_ZONES);
        break;
      default:
        break;
    }
  };

  const finishOnboarding = async (movementBox) => {
    try {
      // TODO: Save to Firestore
      // await setDoc(doc(db, 'users', user.uid), {
      //   ...userProfile,
      //   movementBox,
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      // });

      // Prepare profile for storage
      const profileToSave = {
        ...userProfile,
        movementBox: movementBox || null,
        // Derived fields for filter engine
        mobility: userProfile.movementPosition === 'wheelchair' ? 'wheelchair' : 
                  userProfile.movementPosition === 'sitting' ? 'seated' : 'standing',
        mobilityAid: userProfile.movementPosition,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Check if user is a guest
      if (isGuest || user?.isGuest) {
        // Guest mode: Save to localStorage only
        profileToSave.isGuest = true;
        localStorage.setItem('moov_guest_profile', JSON.stringify(profileToSave));
        console.log('Guest profile saved to localStorage');
      } else {
        // Authenticated user: Save to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          ...userProfile,
          movementBox: movementBox || null,
          mobility: userProfile.movementPosition === 'wheelchair' ? 'wheelchair' : 'mobile',
          email: user.email,
          displayName: user.displayName || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
        console.log('User preferences saved to Firebase');
      }

      // Navigate to home
      navigate('/home');
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      // SCREEN 1: Movement Baseline (ONB-001)
      case STEPS.MOVEMENT_BASELINE:
        return (
          <QuestionnaireStep
            step={1}
            totalSteps={TOTAL_STEPS}
            title="To give you the best experience, how do you prefer to position yourself during exercise?"
            instruction="This helps us customize the AI to your baseline position"
            options={[
              { value: 'standing_unassisted', label: 'I stand on my own', description: 'Unassisted standing' },
              { value: 'standing_supported', label: 'I stand with support', description: 'Wall, chair, or device' },
              { value: 'sitting', label: 'I sit', description: 'Standard chair, bench, or edge of bed' },
              { value: 'wheelchair', label: 'I sit in my wheelchair', description: 'Manual or power wheelchair' },
              { value: 'lying', label: 'I lie down', description: 'Supine position' },
            ]}
            selectedValue={userProfile.movementPosition}
            onSelect={(value) => updateProfile('movementPosition', value)}
            onNext={handleNext}
            // Wheelchair sub-question
            subQuestion={{
              condition: 'wheelchair',
              question: 'Will you stay in your chair for your workout?',
              options: [
                { value: 'stay_in_chair', label: 'Yes, I\'ll stay in my chair' },
                { value: 'transfer', label: 'No, I\'ll transfer to a bench or floor' },
              ],
            }}
            subQuestionValue={userProfile.wheelchairTransfer}
            onSubQuestionSelect={(value) => updateProfile('wheelchairTransfer', value)}
          />
        );

      // SCREEN 2: Assistive Context (ONB-002)
      case STEPS.ASSISTIVE_CONTEXT:
        return (
          <QuestionnaireStep
            step={2}
            totalSteps={TOTAL_STEPS}
            title="Do you use any gear that we should 'whitelist' in your camera view?"
            instruction="Select all that apply. These won't trigger form corrections."
            options={[
              { value: 'manual_wheelchair', label: 'Manual Wheelchair' },
              { value: 'power_wheelchair', label: 'Power Wheelchair' },
              { value: 'walker', label: 'Walker / Rollator' },
              { value: 'cane', label: 'Cane / Crutches' },
              { value: 'prosthetics_upper', label: 'Prosthetics (Upper Body)' },
              { value: 'prosthetics_lower', label: 'Prosthetics (Lower Body)' },
              { value: 'orthotics', label: 'Orthotics / Braces' },
              { value: 'none', label: 'None', description: 'I don\'t use assistive gear' },
            ]}
            selectedValue={userProfile.assistiveGear}
            onSelect={(value) => {
              // If "none" is selected, clear other selections
              if (value.includes('none') && value.length > 1) {
                updateProfile('assistiveGear', ['none']);
              } else if (value.includes('none')) {
                updateProfile('assistiveGear', value);
              } else {
                updateProfile('assistiveGear', value.filter(v => v !== 'none'));
              }
            }}
            onNext={handleNext}
            onBack={handleBack}
            multiSelect={true}
          />
        );

      // SCREEN 3a: Overhead Range (ONB-003)
      case STEPS.OVERHEAD_RANGE:
        return (
          <QuestionnaireStep
            step={3}
            totalSteps={TOTAL_STEPS}
            title="Let's set your comfortable overhead range"
            instruction="This sets your success threshold for arm movements"
            options={[
              { value: 'full', label: 'Full Overhead', description: 'I can reach straight up' },
              { value: 'shoulder', label: 'Shoulder Height', description: 'I can reach out, but not fully up' },
              { value: 'chest', label: 'Chest Height / Limited Range', description: 'Limited overhead movement' },
              { value: 'one_sided', label: 'One-sided', description: 'I have more range on one side' },
            ]}
            selectedValue={userProfile.overheadRange}
            onSelect={(value) => updateProfile('overheadRange', value)}
            onNext={handleNext}
            onBack={handleBack}
            // Asymmetry sub-question
            subQuestion={{
              condition: 'one_sided',
              question: 'Which side has more range?',
              options: [
                { value: 'left_stronger', label: 'Left side is stronger' },
                { value: 'right_stronger', label: 'Right side is stronger' },
              ],
            }}
            subQuestionValue={userProfile.asymmetryConfig}
            onSubQuestionSelect={(value) => updateProfile('asymmetryConfig', value)}
          />
        );

      // SCREEN 3b: Grip Strength (ONB-004)
      case STEPS.GRIP_STRENGTH:
        return (
          <QuestionnaireStep
            step={4}
            totalSteps={TOTAL_STEPS}
            title="How is your grip?"
            instruction="This filters out equipment-heavy workouts if needed"
            options={[
              { value: 'strong', label: 'Strong', description: 'I can hold weights securely' },
              { value: 'assisted', label: 'Assisted', description: 'I use active hands/straps or need open-hand modifications' },
              { value: 'none', label: 'None', description: 'I rely on wrist/arm movements' },
            ]}
            selectedValue={userProfile.gripStrength}
            onSelect={(value) => updateProfile('gripStrength', value)}
            onNext={handleNext}
            onBack={handleBack}
          />
        );

      // SCREEN 4a: Energy Flow (ONB-005)
      case STEPS.ENERGY_FLOW:
        return (
          <QuestionnaireStep
            step={5}
            totalSteps={TOTAL_STEPS}
            title="How does your energy usually flow?"
            instruction="This helps us pace your workouts correctly"
            options={[
              { value: 'standard', label: 'Standard', description: 'I get tired after the workout' },
              { value: 'delayed_onset', label: 'Delayed Onset', description: 'I need to be careful not to overdo it, or I pay for it later' },
              { value: 'limited_spoons', label: 'Limited "Spoons"', description: 'I need short, high-impact sessions' },
              { value: 'temperature_sensitive', label: 'Temperature Sensitive', description: 'I need to avoid overheating' },
            ]}
            selectedValue={userProfile.energyFlow}
            onSelect={(value) => updateProfile('energyFlow', value)}
            onNext={handleNext}
            onBack={handleBack}
          />
        );

      // SCREEN 4b: Pain Zones / Body Map (ONB-006)
      case STEPS.PAIN_ZONES:
        return (
          <BodyMap
            step={6}
            totalSteps={TOTAL_STEPS}
            title="Are there specific movements we should strictly avoid?"
            instruction="Tap areas to mark as 'red zones' - exercises targeting these will be hidden or modified"
            selectedZones={userProfile.redZones}
            onSelect={(zones) => updateProfile('redZones', zones)}
            onNext={handleNext}
            onBack={handleBack}
          />
        );

      // SCREEN 5: Active Calibration (ONB-007)
      case STEPS.CALIBRATION:
        return (
          <CalibrationScreen
            step={TOTAL_STEPS}
            totalSteps={TOTAL_STEPS}
            onComplete={(movementBox) => finishOnboarding(movementBox)}
            onSkip={(defaultBox) => finishOnboarding(defaultBox)}
            onBack={handleBack}
          />
        );

      default:
        return null;
    }
  };

  return renderStep();
}
