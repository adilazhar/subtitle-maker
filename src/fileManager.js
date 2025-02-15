const fs = require('fs').promises;
const path = require('path');

const TRANSCRIPTIONS_DIR = 'transcriptions';

async function checkTranscriptionExists(videoFileName) {
    try {
        const filePath = path.join(TRANSCRIPTIONS_DIR, `${videoFileName}.json`);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return null;
    }
}

async function saveTranscription(videoFileName, transcription) {
    try {
        await fs.mkdir(TRANSCRIPTIONS_DIR, { recursive: true });
        const filePath = path.join(TRANSCRIPTIONS_DIR, `${videoFileName}.json`);
        await fs.writeFile(filePath, JSON.stringify(transcription, null, 2));
    } catch (error) {
        throw new Error(`Failed to save transcription: ${error.message}`);
    }
}

module.exports = {
    checkTranscriptionExists,
    saveTranscription
};