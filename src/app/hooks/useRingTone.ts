import { useEffect, useRef } from "react";

export const useRingtone = (play: boolean) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/audios/ringtone.mp3");
      audioRef.current.loop = true; // lặp liên tục
    }

    if (play) {
      audioRef.current.play().catch(() => {
        console.log("Autoplay blocked, user interaction required");
      });
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    return () => {
      audioRef.current?.pause();
      audioRef.current!.currentTime = 0;
    };
  }, [play]);
};
