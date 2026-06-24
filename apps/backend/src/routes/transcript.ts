import { Router } from 'express';
import { YoutubeTranscript } from 'youtube-transcript';

const router = Router();

function extractVideoId(
  url: string,
): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(
      pattern,
    );

    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

router.post(
  '/',
  async (
    req,
    res,
  ) => {
    try {
      const {
        youtubeUrl,
      } = req.body;

      if (
        !youtubeUrl ||
        typeof youtubeUrl !==
          'string'
      ) {
        return res
          .status(400)
          .json({
            error:
              'youtubeUrl is required',
          });
      }

      const videoId =
        extractVideoId(
          youtubeUrl,
        );

      if (!videoId) {
        return res
          .status(400)
          .json({
            error:
              'Invalid YouTube URL',
          });
      }

      const transcript =
        await YoutubeTranscript.fetchTranscript(
          videoId,
        );

        const text =
        transcript
            .map(
            (item: {
                text: string;
            }) => item.text,
            )
            .join(' ');

      return res.json({
        success: true,
        videoId,
        transcript:
          text,
        segments:
          transcript,
      });
    } catch (error) {
      console.error(
        'TRANSCRIPT ERROR',
        error,
      );

      return res
        .status(500)
        .json({
          success: false,
          error:
            error instanceof
            Error
              ? error.message
              : 'Failed to fetch transcript',
        });
    }
  },
);

export default router;