import toast from "react-hot-toast";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { toBlobURL } from "@ffmpeg/util";

// Singleton FFmpeg instance and lock
let ffmpegInstance = null;
let isProcessing = false;

// Function to get or create the FFmpeg instance
const getFFmpegInstance = async () => {
  if (ffmpegInstance) return ffmpegInstance;

  const ffmpeg = new FFmpeg({ log: true });
  const coreURL = "/ffmpeg/ffmpeg-core.js";
  const wasmURL = "/ffmpeg/ffmpeg-core.wasm";

  await ffmpeg.load({
    coreURL: await toBlobURL(coreURL, "text/javascript"),
    wasmURL: await toBlobURL(wasmURL, "application/wasm"),
  });

  ffmpegInstance = ffmpeg;
  return ffmpeg;
};

// Main function to generate audio with metadata
const handleGenerateAudio = async ({
  audioUrl,
  imageUrl,
  songName,
  year,
  album,
  artist,
}) => {
  if (isProcessing) {
    toast.error("Please wait for the current download to finish.");
    return;
  }

  isProcessing = true;

  await toast.promise(
    (async () => {
      try {
        // Get the singleton FFmpeg instance
        const ffmpeg = await getFFmpegInstance();

        // Fetch the audio and image files
        const [audioBuffer, imageBuffer] = await Promise.all([
          fetchFile(audioUrl),
          fetchFile(imageUrl),
        ]);

        // Write files to the FFmpeg's virtual file system
        await ffmpeg.writeFile("input.mp3", audioBuffer);
        await ffmpeg.writeFile("cover.jpg", imageBuffer);

        // Execute FFmpeg command
        await ffmpeg.exec([
          "-i", "input.mp3",
          "-i", "cover.jpg",
          "-map", "0:0",
          "-map", "1:0",
          "-metadata", `title=${songName}`,
          "-metadata", `artist=${artist}`,
          "-metadata", `album=${album}`,
          "-metadata", `date=${year}`,
          "-c:a", "aac", // Use AAC codec for M4A
          "-b:a", "320k", // Set bitrate to 320kbps
          "-ar", "48000", // Set sample rate to 48kHz
          "-movflags", "+faststart", // Optimize for streaming
          "-c:v", "copy", // Copy the image stream directly (don't re-encode)
          "-disposition:v:0", "attached_pic", // Set image as cover art
          "output.m4a", // Change output file extension to .m4a
        ]);

        // Read and download the output file
        const output = await ffmpeg.readFile("output.m4a");
        if (!output || output.byteLength === 0) {
          throw new Error("FFmpeg failed to generate a valid output file.");
        }

        const blob = new Blob([output.buffer], { type: "audio/mp4" });
        const url = URL.createObjectURL(blob);

        // Trigger file download
        const link = document.createElement("a");
        link.href = url;
        link.download = `${songName}.m4a`;
        document.body.appendChild(link);
        link.click();
        link.remove();

        // Cleanup files to prevent memory leaks in the persistent instance
        await ffmpeg.deleteFile("input.mp3");
        await ffmpeg.deleteFile("cover.jpg");
        await ffmpeg.deleteFile("output.m4a");

      } catch (error) {
        console.error("FFmpeg error:", error);
        throw error;
      } finally {
        isProcessing = false;
        // Do NOT terminate the instance
      }
    })(),
    {
      loading: `Generating high-quality audio...(${songName})`,
      success: `(${songName}) downloaded successfully!`,
      error: "Error generating audio file.",
    }
  );
};

export default handleGenerateAudio;
