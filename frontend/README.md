# Modular Low Poly Car Game

A modular 3D car racing game built with React, TypeScript, Vite, @react-three/fiber, and @react-three/rapier physics.

## 🚗 Features

- **3D Car Physics**: Realistic car movement using Rapier physics engine
- **Keyboard Controls**: WASD or Arrow Keys to drive, Space to brake
- **Modular Architecture**: Designed for easy expansion (AI drivers, multiplayer)
- **Modern Tech Stack**: React 19, TypeScript, Vite, Three.js
- **Strict TypeScript**: Full type safety with strict configuration
- **Code Quality**: ESLint + Prettier with pre-configured rules

## 🎮 Controls

- **W / ↑**: Accelerate forward
- **S / ↓**: Reverse
- **A / ←**: Turn left
- **D / →**: Turn right
- **Space**: Brake

## 🗂 Project Structure

```
src/
├── App.tsx                         # React Router setup
├── main.tsx                        # Vite + React entry
├── routes/
│   └── SinglePlayer/
│       ├── index.tsx               # /single-player entry point
│       └── game/
│           ├── Car.tsx             # Car model, physics, keyboard controls
│           ├── Map.tsx             # Track/map geometry & collisions
│           └── utils.ts            # Shared logic (input mapping, constants)
├── assets/
│   └── models/                     # GLB models (currently placeholders)
│       ├── car.placeholder.md
│       └── map.placeholder.md
└── types/
    └── glb.d.ts                    # TypeScript declarations for .glb files
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Scripts

```bash
# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Code formatting
npm run format
npm run format:check
```

## 🔧 Tech Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite with SWC
- **3D Graphics**: Three.js via @react-three/fiber
- **3D Helpers**: @react-three/drei
- **Physics**: @react-three/rapier
- **Routing**: React Router v7
- **Code Quality**: ESLint, Prettier
- **Type Safety**: Strict TypeScript configuration

## 🎯 Future Expansion Plans

The codebase is designed to be modular and easily expandable:

### Planned Features

- **AI Drivers**: Add computer-controlled cars
- **Multiplayer Support**: Real-time multiplayer racing
- **HUD/UI Overlays**: Speed, lap times, minimap
- **Track Editor**: Create custom racing tracks
- **Car Customization**: Different car models and colors
- **Power-ups**: Speed boosts, shields, etc.

### Architecture Benefits

- **Modular Game Logic**: Each component is isolated and reusable
- **Physics Abstraction**: Easy to modify car behavior and add new vehicles
- **Render Separation**: Game logic separate from 3D rendering
- **Route-based**: Easy to add new game modes

## 📝 Adding 3D Assets

Replace the placeholder files in `src/assets/models/` with actual GLB models:

1. Replace `car.placeholder.md` with `car.glb`
2. Replace `map.placeholder.md` with `map.glb`
3. Update the respective components to load the GLB files using `useGLTF`

```tsx
import { useGLTF } from '@react-three/drei'
import carModelUrl from '../../../assets/models/car.glb'

const { scene } = useGLTF(carModelUrl)
```

## 🤝 Contributing

1. Follow the existing code style (Prettier + ESLint)
2. Maintain the modular architecture
3. Add TypeScript types for new features
4. Test changes with `npm run type-check` and `npm run build`

## 📄 License

This project is open source and available under the MIT License.
languageOptions: {
parserOptions: {
project: ['./tsconfig.node.json', './tsconfig.app.json'],
tsconfigRootDir: import.meta.dirname,
},
// other options...
},
},
])

````

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
````
