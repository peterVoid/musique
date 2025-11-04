"use client";

import { endpoints } from "@/config/endpoint";
import { YoutubeSearchResult } from "@/config/types";
import { useMusique } from "@/hooks/useMusiqueContext";
import {
  extractArtistFromTitle,
  normalizeTitle,
  parseYouTubeDuration,
} from "@/lib/utils";
import { Loader2Icon, PlusIcon, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";

interface YoutubePlayerProps {
  isLimit: boolean;
}

export function FindSong({ isLimit }: YoutubePlayerProps) {
  const { addSong, listSong } = useMusique();

  const [query, setQuery] = useState("");
  const [querying, setQuerying] = useState(false);
  const [searchResult, setSearchResult] = useState<YoutubeSearchResult[]>([]);
  const [addIds, setAddIds] = useState<Set<string>>(new Set());

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLimit) {
      setQuery("");
    }
  }, [isLimit]);

  const handleSearchContent = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setQuerying(false);
      setQuery("");
      setSearchResult([]);

      return;
    }

    setQuerying(true);

    try {
      const response = await fetch(
        endpoints.getYoutubeContent(searchQuery, 10)
      );
      const data = await response.json();

      if (!response.ok) {
        const message = data?.error
          ? `${data.error}-${response.status}`
          : `Request failed with status ${response.status}`;

        throw new Error(message);
      }

      setSearchResult(data);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to get Youtube content");
      }

      toast.error("Something went wrong");
    } finally {
      setQuerying(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setQuerying(true);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      handleSearchContent(newValue);
    }, 2000);
  };

  const handleSelectSong = async (songData: YoutubeSearchResult) => {
    setAddIds((prev) => new Set(prev).add(songData.id));

    try {
      const cleanTitle = normalizeTitle(songData.title);
      const possibleArtist = extractArtistFromTitle(songData.title);

      await addSong({
        title: cleanTitle,
        youtubeId: songData.id,
        youtubeUrl: songData.url,
        artist: possibleArtist || "",
        duration: songData.duration,
        thumbnailUrl: songData.thumbnail,
      });
    } catch (error) {
      console.log("Error add new song", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 size-4" />
          <Input
            placeholder="Cari lagu di Youtube"
            className="px-10"
            value={query}
            onChange={handleInputChange}
            disabled={isLimit}
          />
        </div>
        {querying && (
          <div className="flex items-center">
            <Loader2Icon className="size-4 animate-spin text-gray-500" />
          </div>
        )}
      </div>

      <div>
        {searchResult.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <h3 className="font-semibold text-lg">Hasil Pencarian</h3>
            <div className="grid gap-3 max-h-96 h-fit overflow-y-auto scroll">
              <AnimatePresence>
                {searchResult
                  .filter(
                    (res) => !listSong.some((list) => list.youtubeId === res.id)
                  )
                  .map((result) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.25 }}
                    >
                      <Card className="p-0">
                        <CardContent className="p-4">
                          <div className="flex items-center">
                            <div className="flex-1 gap-3 flex items-center">
                              <Image
                                src={result.thumbnail}
                                alt={result.title}
                                width={100}
                                height={100}
                                className="w-18 h-12 object-cover rounded-md"
                              />
                              <div>
                                <h5 className="text-sm font-medium text-wrap">
                                  {result.title}
                                </h5>
                                <p className="text-xs text-gray-600 text-wrap">
                                  {result.channelTitle}
                                </p>
                                <p className="text-xs text-gray-600 text-wrap">
                                  {parseYouTubeDuration(result.duration)}
                                </p>
                              </div>
                            </div>
                            <div>
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleSelectSong(result)}
                                disabled={addIds.has(result.id) || isLimit}
                              >
                                <PlusIcon
                                  className="
                            size-4"
                                />{" "}
                                Tambah
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
