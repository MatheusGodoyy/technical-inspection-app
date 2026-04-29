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

mechanical-inspection-app/
├── assets/                # Images, icons and static resources
├── screens/               # Application screens
│   ├── FormularioRelatorio.tsx
│   └── ListaRelatorios.tsx
├── services/              # Business logic and utilities
│   └── pdfService.ts
├── styles/                # Global styles
│   └── styles.ts
├── App.tsx                # Main application component
├── index.ts               # Application entry point
├── app.json               # Expo configuration
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project documentation

### Getting Started

### Prerequisites
- Node.js (LTS version)
- Git
- Expo CLI

### Installation
on bash
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
