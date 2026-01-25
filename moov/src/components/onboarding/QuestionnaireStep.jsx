import { useState, useEffect } from 'react';

/**
 * QuestionnaireStep Component - Individual step in the onboarding questionnaire
 * Supports single-select, multi-select, and conditional sub-questions
 */
export default function QuestionnaireStep({
  step,
  totalSteps,
  title,
  instruction,
  options,
  selectedValue,
  onSelect,
  onNext,
  onBack,
  isLastStep = false,
  multiSelect = false,
  subQuestion = null, // { condition: 'value', question: '...', options: [...] }
  subQuestionValue,
  onSubQuestionSelect,
}) {
  const [localSelection, setLocalSelection] = useState(
    multiSelect 
      ? (Array.isArray(selectedValue) ? selectedValue : []) 
      : (selectedValue || '')
  );
  const [localSubAnswer, setLocalSubAnswer] = useState(subQuestionValue || '');

  // Sync with parent state
  useEffect(() => {
    if (multiSelect) {
      setLocalSelection(Array.isArray(selectedValue) ? selectedValue : []);
    } else {
      setLocalSelection(selectedValue || '');
    }
  }, [selectedValue, multiSelect]);

  useEffect(() => {
    setLocalSubAnswer(subQuestionValue || '');
  }, [subQuestionValue]);

  const handleSelect = (value) => {
    if (multiSelect) {
      const newSelection = localSelection.includes(value)
        ? localSelection.filter(v => v !== value)
        : [...localSelection, value];
      setLocalSelection(newSelection);
      if (onSelect) {
        onSelect(newSelection);
      }
    } else {
      setLocalSelection(value);
      if (onSelect) {
        onSelect(value);
      }
    }
  };

  const handleSubQuestionSelect = (value) => {
    setLocalSubAnswer(value);
    if (onSubQuestionSelect) {
      onSubQuestionSelect(value);
    }
  };

  const handleNext = () => {
    const hasSelection = multiSelect 
      ? localSelection.length > 0 
      : Boolean(localSelection);
    
    // Check if sub-question needs to be answered
    const needsSubAnswer = subQuestion && localSelection === subQuestion.condition;
    const hasSubAnswer = Boolean(localSubAnswer);
    
    if (hasSelection && (!needsSubAnswer || hasSubAnswer) && onNext) {
      onNext();
    }
  };

  const canProceed = () => {
    const hasSelection = multiSelect 
      ? localSelection.length > 0 
      : Boolean(localSelection);
    
    const needsSubAnswer = subQuestion && localSelection === subQuestion.condition;
    const hasSubAnswer = Boolean(localSubAnswer);
    
    return hasSelection && (!needsSubAnswer || hasSubAnswer);
  };

  const showSubQuestion = subQuestion && localSelection === subQuestion.condition;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#fafafa] text-[#121212]">
      <div className="w-full max-w-md space-y-6">
        {/* Progress indicator */}
        <div className="text-center space-y-2">
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalSteps || 5 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-8 rounded-full transition-colors ${
                  i + 1 <= step ? 'bg-[#059669]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-[#059669] text-lg font-medium">Step {step} of {totalSteps || 5}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center leading-tight text-[#121212]">
          {title}
        </h1>

        {/* Instruction */}
        {instruction && (
          <p className="text-gray-600 text-center text-lg">{instruction}</p>
        )}

        {/* Options */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
          {options.map((option) => {
            const isSelected = multiSelect 
              ? localSelection.includes(option.value)
              : localSelection === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full min-h-[64px] px-5 py-4 text-left text-xl rounded-lg border-2 transition-all focus:outline-none focus:ring-4 focus:ring-[#059669] focus:ring-offset-2 focus:ring-offset-[#fafafa] ${
                  isSelected
                    ? 'border-[#059669] bg-[#059669]/10 text-[#059669]'
                    : 'border-gray-300 bg-white text-[#121212] hover:border-gray-400'
                }`}
                aria-pressed={isSelected}
              >
                <div className="flex items-center gap-3">
                  {/* Checkbox/Radio indicator */}
                  <div className={`w-6 h-6 rounded-${multiSelect ? 'md' : 'full'} border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-[#059669] bg-[#059669]' : 'border-gray-400'
                  }`}>
                    {isSelected && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">{option.label}</div>
                    {option.description && (
                      <div className="text-base text-gray-600 mt-0.5">{option.description}</div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Sub-question (conditional) */}
        {showSubQuestion && (
          <div className="pt-4 border-t border-gray-300 space-y-3">
            <h2 className="text-xl font-semibold text-[#059669]">{subQuestion.question}</h2>
            <div className="space-y-2">
              {subQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSubQuestionSelect(option.value)}
                  className={`w-full min-h-[56px] px-4 py-3 text-left rounded-lg border-2 transition-all focus:outline-none focus:ring-4 focus:ring-[#059669] ${
                    localSubAnswer === option.value
                      ? 'border-[#059669] bg-[#059669]/10 text-[#059669]'
                      : 'border-gray-300 bg-white text-[#121212] hover:border-gray-400'
                  }`}
                  aria-pressed={localSubAnswer === option.value}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      localSubAnswer === option.value ? 'border-[#059669] bg-[#059669]' : 'border-gray-400'
                    }`}>
                      {localSubAnswer === option.value && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="font-medium">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-4 pt-4">
          {step > 1 && (
            <button
              onClick={onBack}
              className="flex-1 min-h-[64px] px-6 py-4 bg-gray-200 text-[#121212] font-bold text-xl rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-[#fafafa] shadow-lg"
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`flex-1 min-h-[64px] px-6 py-4 font-bold text-xl rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-[#fafafa] shadow-lg ${
              canProceed()
                ? 'bg-[#059669] text-white hover:bg-[#047857] active:bg-[#065f46] focus:ring-[#059669]'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLastStep ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
