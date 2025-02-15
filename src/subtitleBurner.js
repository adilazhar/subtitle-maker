// const ffmpeg = require('fluent-ffmpeg');
// const path = require('path');
// const colors = require('colors');
// const fs = require('fs');

// function generateFilterComplex(words) {
// let filterComplex = '';

// let fontPath = path
//     .resolve(process.cwd(), 'assets', 'Raleway-Black.ttf')
//     .replace(/\\/g, '/')
//     .replace(/^([A-Z]):/, '$1\\:');

// words.forEach((word, index) => {
//     const { start, end, punctuated_word: text } = word;
//     // Build the drawtext filter string and include the custom font file
//     const drawtext = `drawtext=text='${text}'`
//         + ':fontsize=40'
//         + ':fontcolor=white'
//         + `:fontfile=${fontPath}`
//         + ':x=(w-text_w)/2'
//         + ':y=h-text_h-20'
//         + `:enable='between(t,${start},${end})'`
//         + ':box=1'
//         + ':boxcolor=black@0.5'
//         + ':boxborderw=5';

//     filterComplex += (index > 0 ? ',' : '') + drawtext;
// });
// return filterComplex;
// }

// function extractWords(transcription) {
//     try {
//         // Extract words from the first channel's first alternative
//         return transcription.results.channels[0].alternatives[0].words;
//     } catch (error) {
//         throw new Error('Invalid transcription format: ' + error.message);
//     }
// }


// async function burnSubtitles(videoPath, transcription) {
//     return new Promise((resolve, reject) => {
//         try {
//             const words = extractWords(transcription);
//             // Fix: Use current working directory instead of __dirname
//             const outputDir = path.join(process.cwd(), 'output');
//             const outputPath = path.join(
//                 outputDir,
//                 `${path.basename(videoPath, '.mp4')}_subtitled.mp4`
//             );

//             console.log(colors.cyan('Output directory:', outputDir));
//             console.log(colors.cyan('Output file path:', outputPath));

//             // Create output directory if it doesn't exist
//             if (!fs.existsSync(outputDir)) {
//                 console.log(colors.yellow('Creating output directory...'));
//                 fs.mkdirSync(outputDir, { recursive: true });
//             }

//             const filterComplex = generateFilterComplex(words);
//             console.log(colors.cyan('Filter complex:', filterComplex));

//             ffmpeg(videoPath)
//                 .videoFilters(filterComplex)
//                 .output(outputPath)
//                 .on('start', (commandLine) => {
//                     console.log(colors.yellow('FFmpeg command:', commandLine));
//                     console.log(colors.yellow('Starting subtitle burning process...'));
//                 })
//                 .on('progress', (progress) => {
//                     console.log(colors.blue('Processing:', Math.floor(progress.percent), '% done'));
//                 })
//                 .on('stderr', (stderrLine) => {
//                     console.log(colors.gray('FFmpeg:', stderrLine));
//                 })
//                 .on('error', (err, stdout, stderr) => {
//                     console.error(colors.red('Error burning subtitles:'), err.message);
//                     console.error(colors.red('FFmpeg stderr:', stderr));
//                     reject(err);
//                 })
//                 .on('end', () => {
//                     console.log(colors.green('Successfully burned subtitles to:'), outputPath);
//                     resolve(outputPath);
//                 })
//                 .run();

//         } catch (error) {
//             console.error(colors.red('Caught error:', error.stack));
//             reject(error);
//         }
//     });
// }

// module.exports = {
//     burnSubtitles,
// };

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

    words.forEach((word, index) => {
        const { start, end, punctuated_word: text } = word;
        // Build the drawtext filter string and include the custom font file

        // Escape colons and backslashes in the text
        const escapedText = text
            .replace(/:/g, '\\:')
            .replace(/'/g, "\\\\'");

        const drawtext = `drawtext=text='${escapedText}'`
            + ':fontsize=40'
            + ':fontcolor=white'
            + `:fontfile='${fontPath}'`
            + ':x=(w-text_w)/2'
            + ':y=h-text_h-20'
            + `:enable='between(t\\,${start}\\,${end})'`
            + ':box=1'
            + ':boxcolor=black@0.5'
            + ':boxborderw=5';

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

            // Create output directory if it doesn't exist
            if (!fs.existsSync(outputDir)) {
                console.log(colors.yellow('Creating output directory...'));
                fs.mkdirSync(outputDir, { recursive: true });
            }

            const filterComplex = generateFilterComplex(words);

            // Log the first filter for debugging
            console.log(colors.cyan('First filter:', filterComplex.split(',')[0]));

            const command = ffmpeg(videoPath);

            command
                .outputOptions(['-y'])  // Add -y as separate option
                .videoFilters(`${filterComplex}`)  // Use videoFilters instead of outputOptions
                .output(outputPath.replace(/\\/g, '/'))
                .on('start', (commandLine) => {
                    console.log(colors.yellow('FFmpeg started with command:', commandLine));
                })
                .on('progress', (progress) => {
                    if (progress.percent) {
                        console.log(colors.blue(`Processing: ${Math.floor(progress.percent)}% done`));
                    }
                })
                .on('stderr', (stderrLine) => {
                    console.log(colors.gray('FFmpeg:', stderrLine));
                })
                .on('error', (err, stdout, stderr) => {
                    console.error(colors.red('Error burning subtitles:', err.message));
                    console.error(colors.red('FFmpeg stderr:', stderr));
                    reject(err);
                })
                .on('end', () => {
                    console.log(colors.green('Successfully burned subtitles to:', outputPath));
                    resolve(outputPath);
                })
                .run();

        } catch (error) {
            console.error(colors.red('Error in burnSubtitles:', error.message));
            reject(error);
        }
    });
}

module.exports = {
    burnSubtitles
};