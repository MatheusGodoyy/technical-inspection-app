### Mechanical Inspection App
Mobile application designed for **mechanical inspection recording and tracking**, enabling the identification of non-conformities, technical observations, recommendations, and photographic evidence.

---

### Key Features
- Mechanical inspection records
- Conformity and non-conformity classification
- Technical observations and recommendations
- Image attachment as inspection evidence
- Simple and field-oriented user interface

---

### Tech Stack
- React Native
- TypeScript
- Expo
- Git & GitHub

---

## Project Structure

```
mechanical-inspection-app/
├── src/
│   ├── screens/                    # Application screens
│   │   ├── ListaRelatorios.tsx
│   │   ├── SelecionarTipoInspecao.tsx
│   │   ├── FormularioRelatorioMecanicoCivil.tsx
│   │   ├── FormularioRelatorioEletrico.tsx
│   │   └── FormularioRelatorioUI.tsx
│   ├── services/                   # Business logic
│   │   ├── pdf/
│   │   │   ├── pdfService.ts
│   │   │   └── types.ts
│   │   ├── sync/
│   │   │   └── syncService.ts
│   │   └── storage/
│   ├── hooks/                      # Custom React hooks
│   │   ├── useRelatorios.ts
│   │   ├── useAsync.ts
│   │   └── useFormValidation.ts
│   ├── types/                      # TypeScript interfaces and types
│   │   ├── relatorio.ts
│   │   ├── inspecao.ts
│   │   └── errors.ts
│   ├── constants/                  # Global constants
│   │   ├── routes.ts
│   │   ├── strings.ts
│   │   └── ui.ts
│   ├── config/                     # Configuration files
│   │   ├── navigation.ts
│   │   └── env.ts
│   ├── utils/                      # Utility functions
│   │   ├── validation.ts
│   │   ├── formatters.ts
│   │   └── validators.ts
│   ├── database/                   # Database setup
│   │   └── database.ts
│   ├── styles/                     # Global styles
│   │   ├── styles.ts
│   │   └── pdfStyles.ts
│   └── App.tsx                     # Main application component
├── assets/                         # Images, icons and static resources
├── index.ts                        # Application entry point
├── app.json                        # Expo configuration
├── eas.json                        # EAS Build configuration
├── package.json                    # Project dependencies
├── tsconfig.json                   # TypeScript configuration
└── README.md                       # Project documentation
```

### Architecture Overview

**Modular Structure**: The project is organized using domain-driven architecture with clear separation of concerns:

- **Screens**: UI components for different application pages
- **Services**: Business logic for PDF generation, synchronization, and storage
- **Hooks**: Reusable React logic for state management
- **Types**: Centralized TypeScript type definitions
- **Constants**: All hardcoded strings and configuration values
- **Config**: Navigation and environment configuration
- **Utils**: Helper functions for validation and formatting
- **Database**: SQLite setup and initialization
- **Styles**: Global styling and PDF styling

### Getting Started

### Prerequisites
- Node.js (LTS version)
- Git
- Expo CLI

### Installation
```bash
npm install

### Running the App
npx expo start

### Clone the repository
on bash
git clone https://github.com/MatheusGodoyy/mechanical-inspection-app
cd mechanical-inspection-app

### Project Status
Work in progress

### Project Purpose
This project was developed for learning and portfolio purposes, with a focus on applying mobile development concepts to industrial and mechanical inspection scenarios.

### Roadmap
 -Backend integration
 -Inspection report export (PDF)
 -User authentication
 -Data persistence and synchronization

### License
This project is intended for educational and portfolio use only.
