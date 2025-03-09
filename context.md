

## Overview
"Code Rush" is a coding challenge web application inspired by Chess.com's Puzzle Rush, designed to help users enhance their programming skills through timed puzzles across various languages and technologies. Users can engage in solo practice or competitive matches, solving questions in formats like multiple-choice and drag-and-drop, with a rating system to track progress. The app aims to provide an engaging, interactive platform for learning and competing in coding, similar to how chess puzzles improve strategic thinking.

## Target Audience
The app targets:
- **Programming Enthusiasts**: Individuals passionate about coding who want to test and improve their skills.
- **Students**: Those learning programming languages in academic settings, seeking practical exercises.
- **Professionals**: Developers looking to sharpen their skills in specific languages or frameworks for career growth.

It supports a range of languages and technologies: Java, Python, C++, C#, JavaScript, React, Next.js, TypeScript, HTML, and CSS.

## User Flow

### Onboarding
- **Entry Point**: Users land on an onboarding screen where the "Code Rush" logo and name fade in over 10 seconds, creating a welcoming first impression before transitioning to the authentication page.

### Authentication
- **Signup**: New users can sign up by providing a username, email, and password, or opt for Google Sign-In. Email verification is required to activate the account.
- **Login**: Returning users log in with username/email and password or Google Sign-In, with a "Forgot Password" option for account recovery.
- **Post-Authentication**: After successful signup, users are directed to the profile setup page; after login, they go straight to the dashboard.

### Profile Setup
- **Initial Setup**: New users upload a profile picture (stored in Cloudinary) and add a bio (saved to Firebase Firestore), completing their profile before proceeding.
- **Redirect**: Once setup is complete, users are redirected to the dashboard.

### Dashboard
- **Central Hub**: The dashboard serves as the main interface, featuring sections for Play, Leaderboard, Friends, Profile, and Settings, all built as responsive Next.js pages.
- **Navigation**: Users can click into any section to engage with the app’s core features.

### Play Section
- **Options**: Users choose from four play modes, each pulling questions from Firebase Firestore via Next.js API routes:
  - **Play with a Friend**: Fill a form (time, language, optional topic, number of players, level), generating a shareable link for friends to join. Matches are rated.
  - **Random Challenge**: Same form, leading to a waiting lobby for random matchmaking. Matches are rated.
  - **Custom Match**: Same form plus options for rated/unrated, normal/handicap, and specific users by username, generating a link with optional rating.
  - **Play Solo**: Choose between 3 or 5 minutes and a language (Java, Python, C++, C#, JavaScript, React, Next.js, TypeScript, HTML, CSS). Questions in various formats are fired until time runs out; not rated.
- **Gameplay**: Questions are presented in five formats (Drag and Drop, Fix the Code, Multiple Choice, Subobjective, Accomplish the Task), manually created and stored in Firestore.
- **Match Summary**: After each game (including solo play), a summary screen shows scores, time taken, and rating changes (if applicable), stored in Firebase and accessible to players and spectators.

### Leaderboard
- **Rankings**: Displays user rankings by current rating or rating gained, filterable by scope (appwide, friends), title, language (Java, Python, etc.), and time period (last hour, weekly, monthly, all time).
- **Rating System**: Uses a Lichess-style Glicko-2 system with a provisional 1500 rating, calculating separate ratings per language and an overall rating, managed via Next.js API routes and stored in Firestore.
- **Titles**: Assigns titles based on ratings: Code Legend (3000+), Code Master (2700+), Code Elite (2400+), Code Pro (2000+), Expert (1500-1999), Intermediate (1000-1499), Beginner (<1000).

### Friends Section
- **Social Hub**: Lists current friends, offers a search bar for new users, and suggests friends based on mutual connections or activity, fetched from Firebase via API routes.
- **Profile View**: Shows a user’s profile picture (from Cloudinary), username, bio, ratings (per language + overall), title, recent matches, friends/followers count, and head-to-head record. Options include follow, send friend request, challenge (if online), and watch match (real-time points/time, shareable link, comments deleted 5 mins post-match).

### Profile Section
- **Personal Overview**: Displays the user’s profile picture (from Cloudinary), username, bio, ratings (per language + overall), friends, followers, recent matches, wins/losses, and title, alongside a real-time list of online friends from Firebase.

### Settings
- **Customization**: Allows updates to profile info (username, bio, new profile picture uploaded to Cloudinary), theme switching (light/dark), and account deletion with confirmation, managed through Firebase Authentication, Firestore, and Cloudinary via API routes.

## Key Features
- **Authentication**: Supports signup/login with Google, enhancing user convenience.
- **Profile Management**: Uses Cloudinary for scalable image storage (profile pictures and future media).
- **Question System**: Offers five manually designed formats—Drag and Drop, Fix the Code, Multiple Choice, Subobjective (fill-in-the-blank), and Accomplish the Task (LeetCode-style)—covering ten languages/technologies.
- **Play Modes**: Includes solo play for practice (3 or 5 minutes) and competitive modes with ratings.
- **Social Interaction**: Enables friend management, challenges, and real-time match watching.
- **Leaderboard**: Provides competitive motivation with language-specific ratings and titles.
- **Responsiveness**: Ensures all pages work seamlessly across mobile, tablet, and desktop.

## Technical Stack
- **Frontend**: Next.js, providing a responsive UI with server-side rendering and static site generation.
- **Backend**: Next.js API routes, handling server-side logic and data fetching.
- **Database**: Firebase Firestore, storing user data, questions (e.g., 50-100 manually crafted), and match summaries.
- **Image/Video Storage**: Cloudinary, managing profile pictures and future media like match replays or question visuals, integrated via API routes.

## Implementation Notes
- **Question Storage**: Questions are organized in Firestore by difficulty and language, fetched dynamically for each play mode.
- **Solo Play Timer**: Implemented client-side with JavaScript (e.g., `setInterval`) to track 3 or 5 minutes, ending with a match summary.
- **Rating Updates**: Calculated via API routes for rated matches, stored in Firestore, and reflected in Leaderboard and Profile sections.
- **Cloudinary Integration**: API routes handle uploads (e.g., `/api/upload-image`) using Cloudinary’s SDK, storing URLs in Firestore.

## Future Plans
- **AI Integration**: While currently using manual question creation, there’s potential to integrate an AI model (e.g., DeepSeek-Coder-33B-Instruct or GPT-4) for automated question generation, enhancing scalability.
- **Media Expansion**: Cloudinary’s capacity could support videos (e.g., match replays) or images in questions, planned for later phases.

## Conclusion
"Code Rush" offers a dynamic platform for coding practice and competition, with a clear user flow from onboarding to gameplay, supported by a robust tech stack. Its manual question system ensures quality control, while future AI plans promise growth. This context provides a blueprint for development, aligning with the app’s goal of engaging coders worldwide.

--- 

