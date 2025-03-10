const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const colors = require('colors');
const fs = require('fs');

function generateFilterComplex(words) {
    let filterComplex = '';
    let fontPath = path
        .resolve(process.cwd(), 'assets', 'Raleway-Black.ttf')
        .replace(/\\/g, '/')
        .replace(/^([A-Z]):/, '$1\\:');

    // Sort words by start time to ensure proper order
    words.sort((a, b) => Number(a.start) - Number(b.start));

    // First pass: fix overlapping timestamps
    for (let i = 0; i < words.length; i++) {
        const currentWord = words[i];
        currentWord.start = Number(currentWord.start);
        currentWord.end = Number(currentWord.end);

        // Look ahead at upcoming words
        for (let j = i + 1; j < words.length; j++) {
            const nextWord = words[j];
            nextWord.start = Number(nextWord.start);
            nextWord.end = Number(nextWord.end);

            // If current word ends after next word starts, adjust current word's end time
            if (currentWord.end > nextWord.start) {
                // Set current word to end slightly before next word starts
                currentWord.end = nextWord.start - 0.01;
                console.log(colors.yellow(`Adjusted "${currentWord.punctuated_word}" to end at ${currentWord.end.toFixed(3)} before "${nextWord.punctuated_word}" starts at ${nextWord.start.toFixed(3)}`));

                // Safety check - if this makes end time before start time, fix it
                if (currentWord.end <= currentWord.start) {
                    // Calculate a point between start and next word start
                    const midpoint = currentWord.start + ((nextWord.start - currentWord.start) * 0.9);
                    currentWord.end = midpoint;
                    console.log(colors.red(`Warning: Fixed invalid timing for "${currentWord.punctuated_word}" - new end: ${currentWord.end.toFixed(3)}`));
                }
            }
        }
    }

    // Second pass: create filter complex with corrected timings
    words.forEach((word, index) => {
        const start = word.start.toFixed(3);
        const end = word.end.toFixed(3);
        const { punctuated_word: text } = word;

        const escapedText = text
            .replace(/\\/g, '')
            .replace(/'/g, '')
            .replace(/:/g, '');

        const drawtext = `drawtext=text='${escapedText.toUpperCase()}'`
            + ':fontsize=80'
            + ':fontcolor=white'
            + `:fontfile='${fontPath}'`
            + ':x=(w-text_w)/2'
            + ':y=h-h/4'
            + `:enable='between(t\\,${start}\\,${end})'`
            + ':shadowcolor=black:shadowx=3:shadowy=3';

        filterComplex += (index > 0 ? ',' : '') + drawtext;
    });

    return filterComplex;
}

function extractWords(transcription) {
    try {
        return transcription.results.channels[0].alternatives[0].words;
    } catch (error) {
        throw new Error('Invalid transcription format: ' + error.message);
    }
}

async function burnSubtitles(videoPath, transcription) {
    return new Promise((resolve, reject) => {
        try {
            const words = extractWords(transcription);
            const outputDir = path.join(process.cwd(), 'output');
            const outputPath = path.join(
                outputDir,
                `${path.basename(videoPath, '.mp4')}_subtitled.mp4`
            );


            if (!fs.existsSync(outputDir)) {
                console.log(colors.yellow('Creating output directory...'));
                fs.mkdirSync(outputDir, { recursive: true });
            }

            const filterComplex = generateFilterComplex(words);

            const command = ffmpeg(videoPath);

            command
                .outputOptions(['-y'])
                .videoFilters(`${filterComplex}`)
                .output(outputPath.replace(/\\/g, '/'))
                .on('start', (commandLine) => {

                })
                .on('progress', (progress) => {
                    if (progress.percent) {
                        console.log(colors.blue(`Processing: ${Math.floor(progress.percent)}% done`));
                    }
                })
                .on('stderr', (stderrLine) => {

                })
                .on('error', (err, stdout, stderr) => {


                    reject(err);
                })
                .on('end', () => {
                    console.log(colors.green('Successfully burned subtitles to:', outputPath));
                    resolve(outputPath);
                })
                .run();

        } catch (error) {

            reject(error);
        }
    });
}

module.exports = {
    burnSubtitles
};