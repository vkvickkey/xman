import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

// Simple Mutex Implementation
class Mutex {
    constructor() {
        this._queue = [];
        this._locked = false;
    }

    lock() {
        return new Promise((resolve) => {
            if (this._locked) {
                this._queue.push(resolve);
            } else {
                this._locked = true;
                resolve();
            }
        });
    }

    unlock() {
        if (this._queue.length > 0) {
            const next = this._queue.shift();
            next();
        } else {
            this._locked = false;
        }
    }
}

// Global Mutex instance for FFmpeg
const ffmpegMutex = new Mutex();
let ffmpeg = null;

export const loadFFmpeg = async () => {
    if (ffmpeg) return ffmpeg;

    ffmpeg = new FFmpeg({ log: false }); // Disable logs to reduce console noise during batch ops
    const coreURL = "/ffmpeg/ffmpeg-core.js";
    const wasmURL = "/ffmpeg/ffmpeg-core.wasm";

    await ffmpeg.load({
        coreURL: await toBlobURL(coreURL, "text/javascript"),
        wasmURL: await toBlobURL(wasmURL, "application/wasm"),
    });

    return ffmpeg;
};

export const processSong = async (song, coverUrl, ffmpegInstance) => {
    // Generate unique filenames to avoid collisions in shared FS
    const uniqueId = Math.random().toString(36).substring(7); // simple random ID
    const ext = "mp3";
    const inputName = `input_${uniqueId}.${ext}`;
    const outputName = `output_${uniqueId}.m4a`;
    const coverName = `cover_${uniqueId}.jpg`;

    try {
        // 1. Parallel Fetching: Fetch resources *outside* the lock
        const audioUrl = song.downloadUrl?.[4]?.url || song.downloadUrl?.[2]?.url || song.downloadUrl?.[0]?.url;
        if (!audioUrl) throw new Error("No download URL found");

        const [audioData, coverData] = await Promise.all([
            fetchFile(audioUrl),
            fetchFile(coverUrl)
        ]);

        // 2. Serialized Processing: Acquire lock for FFmpeg operations
        await ffmpegMutex.lock();

        try {
            const ffmpeg = ffmpegInstance || await loadFFmpeg();

            // Write to Virtual FS
            await ffmpeg.writeFile(inputName, audioData);
            await ffmpeg.writeFile(coverName, coverData);

            // Run FFmpeg
            await ffmpeg.exec([
                "-i", inputName,
                "-i", coverName,
                "-map", "0:0",
                "-map", "1:0",
                "-metadata", `title=${song.name || "Unknown"}`,
                "-metadata", `artist=${song.artist_name || (Array.isArray(song.artists) ? song.artists.primary?.[0]?.name : "Unknown")}`,
                "-metadata", `album=${song.album?.name || "Unknown"}`,
                "-metadata", `date=${song.year || new Date().getFullYear()}`,
                "-c:a", "aac", // Use AAC codec for M4A
                "-b:a", "320k", // Set bitrate to 320kbps
                "-ar", "48000", // Set sample rate to 48kHz
                "-movflags", "+faststart", // Optimize for streaming
                "-c:v", "copy", // Copy the image stream directly (don't re-encode)
                "-disposition:v:0", "attached_pic", // Set image as cover art
                outputName
            ]);

            // Read result
            const data = await ffmpeg.readFile(outputName);

            // Cleanup Virtual FS
            await ffmpeg.deleteFile(inputName);
            await ffmpeg.deleteFile(coverName);
            await ffmpeg.deleteFile(outputName);

            return new Blob([data.buffer], { type: "audio/mp4" });

        } finally {
            // Always release lock
            ffmpegMutex.unlock();
        }

    } catch (error) {
        console.error(`Error processing song ${song.name}:`, error);
        throw error;
    }
};
