import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import QuestionnaireStep from '../components/onboarding/QuestionnaireStep';
// TODO: Import Firebase functions
// import { doc, setDoc } from 'firebase/firestore';
// import { db } from '../config/firebase';

/**
 * Onboarding Page - Multi-step questionnaire to configure user profile
 * Saves user profile to Firestore users/{uid}
 */
export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [userProfile, setUserProfile] = useState({
    mobilityAid: '',
    constraint: '',
    ageFactor: 'standard',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const steps = [
    {
      step: 1,
      title: 'What mobility aid do you use?',
      field: 'mobilityAid',
      options: [
        { value: 'none', label: 'None', description: 'No mobility aid' },
        { value: 'wheelchair', label: 'Wheelchair', description: 'Wheelchair user' },
        { value: 'walker', label: 'Walker', description: 'Use a walker' },
        { value: 'cane', label: 'Cane', description: 'Use a cane' },
      ],
    },
    {
      step: 2,
      title: 'What area needs focus?',
      field: 'constraint',
      options: [
        { value: 'upper_body', label: 'Upper Body', description: 'Focus on arms and shoulders' },
        { value: 'lower_body', label: 'Lower Body', description: 'Focus on legs and core' },
        { value: 'hands_grip', label: 'Hands/Grip', description: 'Focus on hand strength' },
        { value: 'full_body', label: 'Full Body', description: 'General fitness' },
      ],
    },
    {
      step: 3,
      title: 'Choose your mode',
      field: 'ageFactor',
      options: [
        { value: 'standard', label: 'Standard Mode', description: 'Regular pace and text size' },
        { value: 'senior', label: 'Senior Mode', description: 'Larger text and slower reps' },
      ],
    },
  ];

  const handleSelect = (field, value) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Save to Firestore and finish onboarding
      await finishOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const finishOnboarding = async () => {
    try {
      // TODO: Save to Firestore
      // await setDoc(doc(db, 'users', user.uid), {
      //   ...userProfile,
      //   mobility: userProfile.mobilityAid === 'wheelchair' ? 'wheelchair' : 'mobile',
      //   createdAt: new Date(),
      //   updatedAt: new Date(),
      // });

      // Mock: Save to localStorage
      const profileToSave = {
        ...userProfile,
        mobility: userProfile.mobilityAid === 'wheelchair' ? 'wheelchair' : 'mobile',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem('moov_userProfile', JSON.stringify(profileToSave));

      // Navigate to home
      navigate('/home');
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  };

  const currentStepData = steps[currentStep - 1];

  return (
    <QuestionnaireStep
      step={currentStep}
      title={currentStepData.title}
      options={currentStepData.options}
      selectedValue={userProfile[currentStepData.field]}
      onSelect={(value) => handleSelect(currentStepData.field, value)}
      onNext={handleNext}
      onBack={currentStep > 1 ? handleBack : undefined}
      isLastStep={currentStep === steps.length}
    />
  );
}

