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
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#fafafa] text-[#121212]">
      <div className="w-full max-w-md space-y-8">
        {/* Step indicator */}
        <div className="text-center">
          <span className="text-[#059669] text-lg font-medium">Step {step}</span>
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
              className={`w-full min-h-[64px] px-6 py-4 text-left text-xl rounded-lg border-2 transition-all focus:outline-none focus:ring-4 focus:ring-[#059669] focus:ring-offset-2 focus:ring-offset-[#fafafa] ${
                localSelection === option.value
                  ? 'border-[#059669] bg-[#059669]/10 text-[#059669]'
                  : 'border-gray-300 bg-white text-[#121212] hover:border-gray-400'
              }`}
              aria-pressed={localSelection === option.value}
            >
              <div className="font-bold">{option.label}</div>
              {option.description && (
                <div className="text-base text-gray-600 mt-1">{option.description}</div>
              )}
            </button>
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-4 pt-4">
          {step > 1 && (
            <button
              onClick={onBack}
              className="w-[40%] min-h-[64px] px-6 py-4 bg-gray-200 text-[#121212] font-bold text-xl rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-[#fafafa] shadow-lg"
              aria-label="Go back"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!localSelection}
            className={`${step > 1 ? 'w-[40%] ml-auto' : 'w-full'} min-h-[64px] px-6 py-4 font-bold text-xl rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-[#fafafa] shadow-lg ${
              localSelection
                ? 'bg-[#059669] text-white hover:bg-[#047857] active:bg-[#065f46] focus:ring-[#059669]'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            aria-label={isLastStep ? 'Finish onboarding' : 'Next step'}
          >
            {isLastStep ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

