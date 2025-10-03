

A collaborative movie and show recommendation platform powered by AI

## Overview

CineSync is an AI-driven movie and show recommendation platform designed to help users find the perfect movie or show to watch. Our platform combines individual preferences, moods, and group dynamics to suggest movies that everyone in a group can enjoy. Whether you're watching alone, with friends, or with a partner, CineSync helps minimize the time spent deciding what to watch and ensures a smooth viewing experience.

## Features

### Core Features

1. **Mood Picker**  
   Quickly select your preferred mood or vibe (e.g., "Chill", "Hype", "Romantic", etc.).
   
2. **Vibe Match**  
   Enter a specific movie or show to find similar recommendations.

3. **Genre Filters**  
   Select multiple genres (e.g., Action, Horror, Comedy, etc.).

4. **Smart Suggestions**  
   Get 5-10 highly relevant movie or show suggestions based on your selections.

5. **Group Mode**  🚨  
   - Create a group session and invite friends or family.
   - Each participant can select their preferred mood, genres, and provide a vibe reference.
   - The AI fuses these selections to find movies that match everyone’s preferences.
   - Get group-specific recommendations with a confidence score and a breakdown of why the selection works.

6. **Favorites**  
   Save your favorite movies and shows for quick access without login.

---

### Channels

- **API**  
  A robust API endpoint that allows integration with other apps and services.
  - Query movie suggestions based on mood, genre, vibe, or direct reference.

- **Web Interface**  
  A clean, mobile-first user interface built with Next.js and Tailwind CSS.

- **Command Line Tool**  
  Coming soon: A lightweight CLI tool for power users to test recommendations.

---

## Prerequisites

To run CineSync locally, make sure you have:

- Node.js (v16.0.0 or higher)
- An internet connection (for TMDb API calls)
- TMDb API key (for accessing movie metadata and covers)
- (Optional) Local storage to save favorite movies

---

## Installation

1. Clone the repository:
   ```bash
   git clone [YourRepositoryLink]
   cd CineSync

1. 
Install dependencies:
bashDownloadCopy code Wrapnpm install
(The project uses Next.js, Tailwind CSS, and friends.)

2. 
Set up TMDb API:
Create a .env.local file with your TMDb API key.

3. 
Run the app:
bashDownloadCopy code Wrapnpm run dev



Usage
Web Interface

1. Visit http://localhost:3000 in your browser.
2. Start with Mood Picker, Vibe Match, or Genre Filters.
3. Click "Find Movies" to see recommendations.
4. Save favorites using the heart button.
5. For group mode, generate a shareable link and invite friends.

API Usage

1. Send a POST request to /api/v1/movies/suggest with a request body containing mood, genres, and vibe (optional).
2. Get a list of 5-10 recommendations with confidence scores.


Roadmap

1. 
Already Implemented

Core recommendation engine
Group mode functionality
TMDb API integration
Local storage for favorites


2. 
Short-Term Goals

Video trailers nd play integration
Enhanced UI/UX with more personalization
Better error handling
Rate/subrate system


3. 
Long-Term Goals

AI-powered conversations about movies
Multi-region/multi-language support
Advanced group session analytics
Collaboration features




Bug Fixes

* 
Issue 1: API rate limits when multiple requests are made in quick succession
Mitigation: Implement rate limiting and request queuing.

* 
Issue 2: Group session timestamps not clearing after 24 hours
Mitigation: Use a Timestamp utility to automatically prune old sessions.

* 
Issue 3: No visual feedback for high confidence matches
Mitigation: Add color-coded confidence indicators.



contributions Welcome!
This is an open-source project bubble. Contributions are welcome for:

* Bug fixes
* Features
* Design improvements
* Testing
* Documentation

Join us on Discord or create an issue to share your ideas.
Thank you for your interest in CineSync! 🎬