const ffmpeg = require('fluent-ffmpeg');
const path = require('path');

function extractAudio(videoPath) {
    return new Promise((resolve, reject) => {
        const audioPath = path.join('temp', `${path.basename(videoPath, '.mp4')}.mp3`);

        ffmpeg(videoPath)
            .toFormat('mp3')
            .on('end', () => resolve(audioPath))
            .on('error', (err) => reject(err))
            .save(audioPath);
    });
}

module.exports = {
    extractAudio
};