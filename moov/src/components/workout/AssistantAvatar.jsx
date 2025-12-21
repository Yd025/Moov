/**
 * AssistantAvatar Component - Displays the Moov Assistant avatar with pulsing animation when speaking
 */
export default function AssistantAvatar({ isSpeaking, onClick }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        className={`relative w-16 h-16 rounded-full bg-[#33E1ED] flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-[#33E1ED] focus:ring-offset-2 focus:ring-offset-[#121212] ${
          isSpeaking ? 'animate-pulse scale-110' : ''
        }`}
        aria-label="Moov Assistant"
      >
        <svg
          className="w-8 h-8 text-[#121212]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      </button>
      <span className="text-white text-sm font-medium">Moov Assistant</span>
    </div>
  );
}

