/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { createBoxSong } from "@/app/_actions/box-song";
import { createSong, updateBoxSongStatus } from "@/app/_actions/song";
import { createUser } from "@/app/_actions/user";
import { LOCALSTORAGE_KEY } from "@/config/constants";
import { endpoints } from "@/config/endpoint";
import { ListSong, PlayerSongType } from "@/config/types";
import { MusiqueContext } from "@/hooks/useMusiqueContext";
import { generateRandomUsername, toPlayerMusic } from "@/lib/utils";
import fingerprintjs from "@fingerprintjs/fingerprintjs";
import { Box, BoxSong, BoxSongStatus, Song, User } from "@prisma/client";
import { redirect, useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export type SongData = {
  title: string;
  youtubeId: string;
  youtubeUrl: string;
  duration: string;
  thumbnailUrl: string;
  artist: string;
};

export interface MusiqueContextValueType {
  box?: Box;
  user?: User;
  listSong: ListSong[];
  setListSong: (listSong: ListSong[]) => void;
  addSong: (songData: SongData) => Promise<void>;
  currentIndexSong: number | null;
  songs: PlayerSongType[];
  nextSong: () => void;
  prevSong: () => void;
  updateListBoxSongStatus: (
    currentSong: PlayerSongType,
    newStatus: BoxSongStatus
  ) => void;
  setCurrentSongIndex: (index: number) => void;
}

export function MusiqueProvider({ children }: { children: React.ReactNode }) {
  const { slug: boxSlug } = useParams<{ slug: string }>();

  const [listSong, setListSong] = useState<ListSong[]>([]);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [box, setBox] = useState<Box | undefined>(undefined);
  const [fingerPrint, setFingerPrint] = useState<string | null>(null);
  const [currentIndexSong, setCurrentSongIndex] = useState<number | null>(null);
  const songs = toPlayerMusic(listSong);

  useEffect(() => {
    if (!boxSlug) return;

    (async function getBoxes() {
      try {
        const response = await fetch(endpoints.getBoxByIdentifier(boxSlug));
        const data = await response.json();

        if (!response.ok) {
          const message = data?.error
            ? `${data.error}-${response.status}`
            : `Request failed with status ${response.status}`;

          throw new Error(message);
        }

        setBox(data.data);
      } catch (error) {
        if (error instanceof Error && error.message.includes("404")) {
          toast.error("Box not found");
          redirect("/");
        }

        toast.error("Something went wrong");
      }
    })();
  }, [boxSlug]);

  useEffect(() => {
    if (songs.length !== 0 && currentIndexSong == null) {
      setCurrentSongIndex(0);
    }
  }, [currentIndexSong, songs.length]);

  const fetchBoxSongs = useCallback(async () => {
    try {
      const boxSongsResp = await fetch(endpoints.getBoxSongList(boxSlug));
      const boxSongsData = await boxSongsResp.json();

      if (!boxSongsResp.ok) {
        const message = boxSongsData?.error
          ? `${boxSongsData.error}-${boxSongsData.status}`
          : `Request failed with status ${boxSongsData.status}`;

        throw new Error(message);
      }

      if (boxSongsData.data && boxSongsData.length === 0) {
        setListSong([]);
        return;
      }

      const songIds = boxSongsData.data.map(
        (boxSong: BoxSong) => boxSong.songId
      );

      const songs = await fetch(endpoints.getSongByIds(songIds));
      const songsResp = await songs.json();
      const songsMap = new Map<any, any>(
        songsResp.map((song: Song) => [song.id, song])
      );

      const userIds = boxSongsData.data.map(
        (boxSong: BoxSong) => boxSong.userId
      );
      const usersData = await Promise.all(
        userIds.map(async (id: string) => {
          const userRes = await fetch(endpoints.getUser(id));
          const userData = await userRes.json();
          return userData;
        })
      );

      const usersMap = new Map(usersData.map(({ data }) => [data.id, data]));

      const newBoxSongsList: ListSong[] = boxSongsData.data.map(
        (boxSong: BoxSong): ListSong => {
          const song: Song = songsMap.get(boxSong.songId || "");
          const user: User = usersMap.get(boxSong.userId || "");

          return {
            id: boxSong.id,
            title: song.title,
            position: boxSong.position,
            status: boxSong.status,
            duration: song.duration,
            user,
            youtubeId: song.youtubeId,
            youtubeUrl: song.youtubeUrl,
            artist: song.artist,
            thumbnailUrl: song.thumbnailUrl || "",
          };
        }
      );

      setListSong(newBoxSongsList);

      let readyToPlayIndex = newBoxSongsList.findIndex(
        (list) => list.status === "PLAYING" || list.status === "QUEUED"
      );

      if (newBoxSongsList.length && readyToPlayIndex === -1) {
        readyToPlayIndex = 0;
      }

      if (readyToPlayIndex != null && readyToPlayIndex !== -1) {
        setCurrentSongIndex(readyToPlayIndex);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log("Failed to get box songs");
      }
    }
  }, [boxSlug]);

  useEffect(() => {
    if (boxSlug !== box?.slug) {
      setListSong([]);
      setCurrentSongIndex(null);
      setBox(undefined);
    }
  }, [boxSlug, box?.slug]);

  useEffect(() => {
    if (!boxSlug || !box?.id) return;
    fetchBoxSongs();
  }, [box, boxSlug, fetchBoxSongs]);

  useEffect(() => {
    const getFingerPrint = localStorage.getItem(LOCALSTORAGE_KEY);
    if (getFingerPrint) {
      setFingerPrint(getFingerPrint);
    } else {
      fingerprintjs.load().then((fp) =>
        fp.get().then((result) => {
          const visitorId = result.visitorId;
          setFingerPrint(visitorId);
          localStorage.setItem(LOCALSTORAGE_KEY, visitorId);
        })
      );
    }
  }, []);

  useEffect(() => {
    if (!fingerPrint) return;

    (async function fetchOrCreateUser() {
      try {
        const response = await fetch(endpoints.getUser(fingerPrint));
        const data = await response.json();

        if (!response.ok) {
          const message = data?.error
            ? `${data.error}-${response.status}`
            : `Request failed with status ${response.status}`;

          throw new Error(message);
        }

        setUser(data.data);
      } catch (error) {
        if (error instanceof Error && error.message.includes("404")) {
          try {
            const username = generateRandomUsername();
            const newUser = await createUser({ fingerPrint, username });
            if (newUser.data) {
              setUser(newUser.data);
            }
          } catch (error) {
            console.error("Error creating new user", error);
          }
        }
      }
    })();
  }, [fingerPrint]);

  const addSong = async (songData: SongData) => {
    if (!user?.id || !boxSlug) return;

    const tempId = Math.floor(Math.random() * 1000).toString();
    const tempData: ListSong = {
      id: tempId,
      position: 999,
      title: songData.title,
      duration: songData.duration,
      youtubeId: songData.youtubeId,
      youtubeUrl: songData.youtubeUrl,
      status: BoxSongStatus.QUEUED,
      user,
      artist: songData.artist,
      thumbnailUrl: songData.thumbnailUrl,
    };

    setListSong((prev: ListSong[]) => {
      if (
        prev.some((song: ListSong) => song.youtubeId === tempData.youtubeId)
      ) {
        return prev;
      }
      return [...prev, tempData];
    });

    let song;
    try {
      const response = await fetch(endpoints.getSongByIds(tempData.youtubeId));
      const resData = await response.json();

      if (!response.ok) {
        const message = resData?.error
          ? `${resData.error}-${response.status}`
          : `Request failed with status ${response.status}`;

        throw new Error(message);
      }

      if (resData && resData.length > 0) {
        song = resData[0];
      } else {
        song = (await createSong(songData)).data;
      }
    } catch {
      song = (await createSong(songData)).data;
    }

    const boxSongsData = await createBoxSong({
      boxId: box?.id || "",
      songId: song.id,
      status: BoxSongStatus.QUEUED,
      userId: user.id,
    });

    if (!boxSongsData.success) {
      console.log("Error creating new Box Songs", boxSongsData.message);
    }

    const newList: ListSong = {
      id: boxSongsData.data.id || "",
      position: boxSongsData.data.position,
      status: boxSongsData.data.status || BoxSongStatus.QUEUED,
      title: songData.title,
      artist: songData.artist,
      youtubeId: songData.youtubeId,
      youtubeUrl: songData.youtubeUrl,
      duration: songData.duration,
      user,
      thumbnailUrl: songData.thumbnailUrl,
    };

    if (currentIndexSong == null) {
      setCurrentSongIndex(0);
    }

    if (songs.length !== [...songs].concat(newList).length) {
      setCurrentSongIndex(currentIndexSong);
    }

    setListSong((prev) => {
      const filtering = prev.filter(
        (list) => list.id !== tempId && list.youtubeId !== newList.youtubeId
      );

      return [...filtering, newList];
    });
  };

  const nextSong = () => {
    const currentSong = songs[currentIndexSong as number];

    if (currentSong) {
      updateBoxSongStatus(currentSong.id, BoxSongStatus.PLAYED);
    }

    updateListBoxSongStatus(currentSong, BoxSongStatus.PLAYED);

    setCurrentSongIndex((currentIndexSong ?? 0) + 1);
  };

  const prevSong = () => {
    const currentSong = songs[currentIndexSong as number];

    if (currentSong) {
      updateBoxSongStatus(currentSong.id, BoxSongStatus.PLAYED);
    }

    updateListBoxSongStatus(currentSong, BoxSongStatus.PLAYED);

    setCurrentSongIndex((currentIndexSong ?? 0) - 1);
  };

  function updateListBoxSongStatus(
    currentSong: PlayerSongType,
    newStatus: BoxSongStatus
  ) {
    setListSong((prev) => {
      const getUpdatedIndex = prev.findIndex(
        (lSong) => lSong.youtubeId === currentSong.youtubeId
      );
      return prev.map((bSong, index) => {
        if (index === getUpdatedIndex) {
          return {
            ...bSong,
            status: newStatus as BoxSongStatus,
          };
        }

        return bSong;
      });
    });
  }

  return (
    <MusiqueContext.Provider
      value={{
        user,
        box,
        listSong,
        addSong,
        currentIndexSong,
        songs: songs as PlayerSongType[],
        nextSong,
        prevSong,
        setListSong,
        updateListBoxSongStatus,
        setCurrentSongIndex,
      }}
    >
      {children}
    </MusiqueContext.Provider>
  );
}
