# Auto Subtitles Generator

## Overview

subtitle_maker is a Node.js script that automatically generates single-word subtitles for videos. It solves the tedious problem of manually splitting words in video editing software like Premiere Pro or CapCut, allowing users to create stylish word-by-word captions with just a single command.

## Demo

https://github.com/user-attachments/assets/415bd6ed-b0c9-4f3c-8fca-4294c33505d6

## Features

- **One-Command Subtitling**: Generate single-word subtitles automatically with a simple npm command
- **Customizable Text Styles**: Modify font, size, color, and position of subtitles
- **Accurate Word Timing**: Leverages Deepgram API for precise word-level timestamps
- **No Video Re-encoding**: Adds subtitles without degrading original video quality
- **Real-time Progress Tracking**: Monitor subtitling progress through the command line

## Tech Stack

- Node.js
- Deepgram API for speech-to-text conversion and word-level timestamps
- FFmpeg for video processing and subtitle application
- JavaScript

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/subtitle_maker.git
   cd subtitle_maker
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up your Deepgram API key:

   - Create a `.env` file in the root directory
   - Add your Deepgram API key: `DEEPGRAM_API_KEY=your_api_key_here`

4. Place your video in the assets folder

5. Configure the video path in the start script within `package.json`:

   ```json
   "scripts": {
     "start": "node src/index.js assets/your_video_filename.mp4",
     "test": "echo \"Error: no test specified\" && exit 1"
   }
   ```

6. Run the script:
   ```bash
   npm start
   ```

## Challenges & Solutions

### FFmpeg Complexity

FFmpeg is powerful but complex with strict parameter requirements. Our solution implemented robust error handling and parameter validation to ensure consistent results across different video formats.

### Word-Level Timing Accuracy

Getting precise timing for individual words was challenging. We leveraged Deepgram's advanced API capabilities to obtain accurate timestamps for each word, resulting in perfectly synchronized subtitles.

## Future Plans

- Implement Advanced SubStation Alpha (ASS) subtitle format support for enhanced animation capabilities
- Add more text styling options and animation presets
- Create a simple GUI interface for non-technical users
- Support for batch processing multiple videos
