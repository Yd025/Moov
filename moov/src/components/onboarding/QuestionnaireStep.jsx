import { useState } from 'react';

/**
 * QuestionnaireStep Component - Individual step in the onboarding questionnaire
 */
export default function QuestionnaireStep({
  step,
  title,
  options,
  selectedValue,
  onSelect,
  onNext,
  onBack,
  isLastStep = false,
}) {
  const [localSelection, setLocalSelection] = useState(selectedValue || '');

  const handleSelect = (value) => {
    setLocalSelection(value);
    if (onSelect) {
      onSelect(value);
    }
  };

  const handleNext = () => {
    if (localSelection && onNext) {
      onNext();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#121212] text-white">
      <div className="w-full max-w-md space-y-8">
        {/* Step indicator */}
        <div className="text-center">
          <span className="text-[#33E1ED] text-lg font-medium">Step {step}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center" style={{ fontSize: 'min(3rem, 8vw)' }}>
          {title}
        </h1>

        {/* Options */}
        <div className="space-y-4">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full min-h-[48px] px-6 py-4 text-left text-lg rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#33E1ED] focus:ring-offset-2 focus:ring-offset-[#121212] ${
                localSelection === option.value
                  ? 'border-[#33E1ED] bg-[#33E1ED]/10 text-[#33E1ED]'
                  : 'border-gray-700 bg-[#1a1a1a] text-white hover:border-gray-600'
              }`}
              aria-pressed={localSelection === option.value}
            >
              <div className="font-semibold">{option.label}</div>
              {option.description && (
                <div className="text-sm text-gray-400 mt-1">{option.description}</div>
              )}
            </button>
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-4 pt-4">
          {step > 1 && (
            <button
              onClick={onBack}
              className="flex-1 min-h-[48px] px-6 py-3 bg-gray-800 text-white font-semibold text-lg rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-[#121212]"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!localSelection}
            className={`flex-1 min-h-[48px] px-6 py-3 font-semibold text-lg rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#121212] ${
              localSelection
                ? 'bg-[#33E1ED] text-[#121212] hover:bg-[#2AC5D0] focus:ring-[#33E1ED]'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLastStep ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

