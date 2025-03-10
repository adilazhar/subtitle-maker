const { createClient } = require('@deepgram/sdk');
const fs = require('fs');

async function transcribeAudio(audioPath) {
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

    console.log('Transcribing audio... This may take a few minutes...');

    const audioFile = fs.readFileSync(audioPath);

    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
        audioFile,
        {
            model: 'nova-3',
            smart_format: true,
        }
    );

    if (error) throw error;

    // Cleanup temp audio file
    fs.unlinkSync(audioPath);

    return result;
}

module.exports = {
    transcribeAudio
};