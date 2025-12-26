# Moov - Accessible Fitness App

An accessible fitness application that uses computer vision to track workouts for people with disabilities (wheelchair users, seniors, limited mobility). Runs entirely client-side.

## Tech Stack

- **React** (Vite) - Frontend framework
- **Tailwind CSS** - Styling
- **Firebase** - Authentication & Firestore database
- **Google MediaPipe Pose** - Pose detection
- **Web Speech API** - Verbal cues and guidance

## Project Structure

```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── onboarding/     # Onboarding questionnaire components
│   ├── dashboard/       # Dashboard components (workout cards, progress charts)
│   └── workout/        # Workout components (camera, skeleton overlay, assistant)
├── pages/              # Page components (Login, Onboarding, Home, Workout, Success)
├── hooks/              # Custom React hooks
│   ├── useMoovAssistant.js    # Workout assistant logic
│   └── usePoseDetection.js    # MediaPipe pose detection
├── logic/              # Business logic
│   ├── filterEngine.js        # Exercise filtering based on user profile
│   └── exerciseDB.js          # Exercise database
├── context/            # React context providers
│   └── AuthContext.jsx        # Authentication context
└── config/             # Configuration files
    └── firebase.js             # Firebase configuration
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Google Sign-In)
   - Create a Firestore database
   - Copy `.env.example` to `.env` and fill in your Firebase credentials

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## Key Features

### Filter Engine
The `filterEngine.js` filters exercises based on user profile:
- Removes exercises requiring standing for wheelchair users
- Filters by constraint area (upper/lower body, hands/grip)
- Adjusts for mobility aids (walker, cane)
- Applies senior mode adjustments

### Moov Assistant
The `useMoovAssistant.js` hook provides:
- Verbal cues using Web Speech API
- Struggle detection (10s without rep triggers skip option)
- Form correction feedback
- Rep counting and encouragement

### User Flow

1. **Login** → Google Sign-In
2. **Onboarding** → Multi-step questionnaire (Mobility Aid, Constraints, Age Factor)
3. **Home Dashboard** → View today's workout and progress
4. **Workout** → Camera-based exercise tracking with pose detection
5. **Success** → Completion screen with stats

## Accessibility Features

- Minimum font size: 18px
- Minimum touch target: 48px height
- High contrast colors (Dark mode: #121212, Primary: #33E1ED)
- Verbal guidance via Web Speech API
- Visual form feedback with skeleton overlay

## Development Notes

- Firebase integration is stubbed with TODO comments - implement when ready
- MediaPipe Pose detection includes fallback for development
- All components follow accessibility best practices

## License

MIT
