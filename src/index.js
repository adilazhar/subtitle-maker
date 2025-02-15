require('dotenv').config();
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const { extractAudio } = require('./audioExtractor');
const { transcribeAudio } = require('./transcriber');
const { burnSubtitles, testSingleDrawtext } = require('./subtitleBurner');
const { checkTranscriptionExists, saveTranscription } = require('./fileManager');
const colors = require('colors');
const fs = require('fs');
ffmpeg.setFfmpegPath("C:/ffmpeg/bin/ffmpeg.exe");
ffmpeg.setFfprobePath("C:/ffmpeg/bin/ffprobe.exe");


async function processVideo(videoPath) {
    try {
        // Check if video file exists
        if (!fs.existsSync(videoPath)) {
            throw new Error(`Video file not found: ${videoPath}`);
        }

        const videoFileName = path.basename(videoPath, '.mp4');
        console.log(colors.cyan('Starting subtitle generation process...'));
        console.log(colors.cyan(`Processing video: ${videoFileName}`));

        // Check if transcription already exists
        const existingTranscription = await checkTranscriptionExists(videoFileName);
        let transcription;

        if (existingTranscription) {
            console.log(colors.green('Found existing transcription. Reusing it...'));
            transcription = existingTranscription;
        } else {
            // Extract audio
            console.log(colors.yellow('Extracting audio from video...'));
            const audioPath = await extractAudio(videoPath);



            // Transcribe audio
            console.log(colors.yellow('Starting transcription...'));
            transcription = await transcribeAudio(audioPath);

            // Save transcription for future use
            await saveTranscription(videoFileName, transcription);
            console.log(colors.green('Transcription completed and saved!'));
        }

        // Burn subtitles
        console.log(colors.yellow('Burning subtitles into video...'));
        await burnSubtitles(videoPath, transcription);

        console.log(colors.green('Subtitle generation completed successfully!'));

    } catch (error) {
        console.error(colors.red('Error processing video:'), error.message);
        process.exit(1);
    }
}

// Get video path from command line arguments
const videoPath = process.argv[2];

if (!videoPath) {
    console.error(colors.red('Please provide a video file path'));
    console.log(colors.yellow('Usage: npm start <video-path>'));
    process.exit(1);
}

// Execute the main function
processVideo(videoPath);

