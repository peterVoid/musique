export const endpoints = {
  getUser: (identifier: string) => `/api/users/${identifier}`,
  getBoxByIdentifier: (identifier: string) => `/api/boxes/${identifier}`,
  getYoutubeContent: (q: string, max: number = 10) =>
    `/api/youtube/search?q=${q}&max=${max}`,
  getSongByIds: (ids: string) => `/api/songs/by-ids?ids=${ids}`,
  createBoxSong: `/api/box-songs`,
  getBoxSongList: (identifier: string) => `/api/boxes/${identifier}/songs`,
};
