/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { CopyIcon, ListStart } from "lucide-react";
import { useEffect, useState } from "react";
import { useMusique } from "@/hooks/useMusiqueContext";
import { toast } from "sonner";
import { FindSong } from "../songs/find-song";
import { PlaylistTable } from "./playlist-table";
import { YoutubePlayer } from "./youtube-player";
import { DEFAULT_LIMIT } from "@/config/constants";

export function PlayPageContent() {
  const {
    box,
    listSong,
    setListSong,
    setCurrentSongIndex,
    currentIndexSong,
    user,
  } = useMusique();

  const [isCreator, setIsCreator] = useState(false);
  const [copyUrl, setCopyUrl] = useState("");
  const [isLimit, setIsLimit] = useState(false);

  useEffect(() => {
    if (!box?.slug) return;

    setCopyUrl(`${window.location.origin}/play/${box.slug}`);
  }, [box]);

  const handleCopyUrl = async () => {
    if (!copyUrl) return;

    try {
      await navigator.clipboard.writeText(copyUrl);

      toast.success("Berhasil meng-copy URL");
    } catch (error) {
      console.log("Error copying url", error);
    }
  };

  useEffect(() => {
    setIsLimit(listSong.length >= DEFAULT_LIMIT);
  }, [listSong.length]);

  useEffect(() => {
    if (box?.userId && user) {
      setIsCreator(box.userId === user.id);
    }
  }, [box?.userId, user]);

  return (
    <div className="bg-grid min-h-[calc(98dvh-70px)] flex items-center justify-center w-full p-5">
      <div className="w-[1300px] mx-auto max-w-full space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: "circOut",
          }}
        >
          <Card className="bg-white">
            <CardContent>
              <div className="space-y-3">
                <h2 className="text-lg font-bold">Bagikan Musique</h2>
                <p className="text-sm text-gray-600">
                  Bagikan link ini, jadi orang lain dapat menambahkan lagu juga
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 border-2 rounded-md border-border py-2 px-3 text-sm text-gray-800 flex items-center select-all cursor-pointer">
                    <p
                      title={copyUrl}
                      onClick={() => {
                        if (copyUrl) navigator.clipboard.writeText(copyUrl);
                      }}
                    >
                      {copyUrl}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="neutral"
                    onClick={handleCopyUrl}
                  >
                    <CopyIcon className="size-4" />
                    Copy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
        >
          <YoutubePlayer />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
        >
          <Card className="bg-white">
            <CardContent>
              <div className="space-y-3">
                <h2 className="text-lg font-bold">Tambahkan Lagu</h2>
                <p className="text-sm text-gray-600">
                  Masukan lagu yang ingin ditambahkan, pastikan berada di
                  Youtube
                </p>
                <FindSong isLimit={isLimit} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
        >
          <Card className="bg-white text-foreground">
            <CardContent>
              <div className="space-y-3">
                <h2 className="text-lg font-bold">Playlist</h2>
                <PlaylistTable
                  listSong={listSong}
                  setListSong={setListSong}
                  setCurrentSongIndex={setCurrentSongIndex}
                  currentSongIndex={currentIndexSong}
                  isCreator={isCreator}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
