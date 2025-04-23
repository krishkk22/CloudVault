# Cloud Notes

A simple, real-time note-taking application built with React and Firebase.

## Features

- Real-time note synchronization
- Google Authentication
- Create, read, update, and delete notes
- Modern Material-UI interface
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Firebase project

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd cloud-notes
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project:
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Google sign-in)
   - Create a Firestore database
   - Get your Firebase configuration

4. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration values

5. Start the development server:
```bash
npm start
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## Usage

1. Sign in with your Google account
2. Create new notes using the "New Note" button
3. Edit existing notes by clicking the edit icon
4. Delete notes using the delete icon
5. All changes are automatically saved and synchronized in real-time

## Technologies Used

- React
- TypeScript
- Firebase (Authentication & Firestore)
- Material-UI
- React Router

## License

MIT
