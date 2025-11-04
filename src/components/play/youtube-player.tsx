/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { useMusique } from "@/hooks/useMusiqueContext";
import { PlayerSongType } from "@/config/types";
import { motion } from "motion/react";
import Image from "next/image";
import { formatTime, parseYouTubeDuration } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  PauseIcon,
  PlayIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "lucide-react";
import { updateBoxSongStatus } from "@/app/_actions/song";
import { BoxSongStatus } from "@prisma/client";

export function YoutubePlayer() {
  const {
    songs,
    currentIndexSong,
    nextSong,
    prevSong,
    updateListBoxSongStatus,
  } = useMusique();

  const [currentSong, setCurrentSong] = useState<PlayerSongType>();
  const [duration, setDuration] = useState(0);
  const [currentSongDuration, setCurrentSongDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (currentSong) {
      setDuration(parseYouTubeDuration(currentSong.duration));
    }
  }, [currentSong]);

  useEffect(() => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    (window as any).onYouTubeIframeAPIReady = () => {
      console.log("YouTube IFrame API Loaded");
    };
  }, []);

  useEffect(() => {
    if (currentIndexSong !== null) {
      (async function handleUpdateBoxSongStatus() {
        const currentSong = songs[currentIndexSong as number];
        setCurrentSong(currentSong);

        const isPlayingIndex = songs.findIndex(
          (song) => song.status === "PLAYING"
        );

        if (isPlayingIndex !== -1 && isPlayingIndex !== currentIndexSong) {
          const targetSong = songs[isPlayingIndex];
          const { success } = await updateBoxSongStatus(
            targetSong.id,
            BoxSongStatus.PLAYED
          );

          if (success) {
            updateListBoxSongStatus(targetSong, BoxSongStatus.PLAYED);
          }
        }
      })();
    }
  }, [currentIndexSong]);

  const handlePlayPause = async () => {
    if (!currentSong?.youtubeId) return;

    if (!playerRef.current) {
      playerRef.current = new (window as any).YT.Player("youtube-iframe", {
        height: "0",
        width: "0",
        videoId: currentSong.youtubeId,
        playerVars: {
          autoplay: 1,
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
            setIsPlaying(true);
          },
          onStateChange: async (event: any) => {
            if (event.data === 0) {
              // ended
              setIsPlaying(false);
            } else if (event.data === 1) {
              // playing
              setIsPlaying(true);
            } else if (event.data === 2) {
              // paused
              setIsPlaying(false);
            }
          },
        },
      });
    } else {
      const targetNode = playerRef.current;
      const state = targetNode.getPlayerState();

      if (state === 1) {
        targetNode.pauseVideo();
        setIsPlaying(false);
      } else {
        targetNode.playVideo();
        setIsPlaying(true);
      }
    }
  };

  useEffect(() => {
    if (isPlaying) {
      (async function updatePlayingSongStatus() {
        const currentSong = songs[currentIndexSong as number];
        const { success } = await updateBoxSongStatus(
          currentSong.id,
          BoxSongStatus.PLAYING
        );

        if (success) {
          updateListBoxSongStatus(currentSong, BoxSongStatus.PLAYING);
        }
      })();
    }
  }, [currentIndexSong, isPlaying]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const player = playerRef.current;

    if (player && isPlaying) {
      interval = setInterval(() => {
        const time = player.getCurrentTime();
        setCurrentSongDuration(time);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (playerRef.current && currentSong?.youtubeId) {
      playerRef.current.loadVideoById(currentSong.youtubeId);
      setIsPlaying(true);
      setCurrentSongDuration(0);
    }
  }, [currentSong]);

  const handleClickProgess = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;

    const newTime = (clickX / width) * duration;
    playerRef.current.seekTo(newTime, true);
    setCurrentSongDuration(newTime);
  };

  return (
    <Card className="bg-white text-foreground">
      <CardContent className="p-6">
        <div>
          {currentSong ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div id="youtube-iframe" className="hidden" />

              <div className="flex items-start gap-4">
                {currentSong.thumbnailUrl && (
                  <Image
                    src={currentSong.thumbnailUrl}
                    alt={currentSong.title}
                    width={100}
                    height={100}
                    className="w-18 h-14 object-cover rounded-md"
                  />
                )}
                <div className="flex-1">
                  <h2 className="font-semibold text-lg">{currentSong.title}</h2>
                  <p className="text-gray-600">{currentSong.artist ?? "-"}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div
                  onClick={handleClickProgess}
                  className="bg-gray-200 w-full rounded-full h-2 cursor-pointer"
                >
                  <div
                    className="bg-main h-2 rounded-full transition-all duration-100"
                    style={{
                      width:
                        currentSongDuration > 0
                          ? `${(currentSongDuration / duration) * 100}%`
                          : "0%",
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <p>{formatTime(currentSongDuration)}</p>
                  <p>{formatTime(duration)}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center w-full gap-4">
                <Button
                  size="sm"
                  variant="neutral"
                  disabled={currentIndexSong === 0}
                  onClick={prevSong}
                >
                  <SkipBackIcon className="size-4" />
                </Button>
                <Button size="sm" onClick={handlePlayPause}>
                  {isPlaying ? (
                    <PauseIcon className="size-6" />
                  ) : (
                    <PlayIcon className="size-6" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="neutral"
                  disabled={currentIndexSong === songs.length - 1}
                  onClick={nextSong}
                >
                  <SkipForwardIcon className="size-4" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center justify-center text-center mx-auto flex-col space-y-3 p-10">
                <h5 className="text-md text-gray-400 font-light">
                  Tidak ada yang bisa diputar di playlist.
                </h5>
                <span className="text-gray-400 font-light text-sm">
                  Silahkan tambahkan dulu lagu yang ingin diputar
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
