# 🎵 Musique — Collaborative YouTube Music Player

**Musique** adalah proyek eksperimen untuk memahami cara kerja pemutar musik seperti Spotify, namun menggunakan **React**, **Next.js**, dan **YouTube IFrame API**.  
Aplikasi ini memungkinkan pengguna untuk membuat _box musik_ (playlist), menambahkan lagu dari YouTube, serta memutar lagu secara terurut.

---

## 🚀 Fitur Utama

- 🎧 **Pemutar Musik YouTube** — Lagu diputar langsung dari YouTube menggunakan IFrame API.
- 🧩 **Box (Playlist) Kolaboratif** — Pengguna bisa membuat dan membagikan link playlist ke teman.
- ➕ **Tambah Lagu** — Cukup tempel URL YouTube, lagu akan otomatis ditambahkan ke playlist.
- ⏭️ **Next & Previous Song** — Navigasi antar lagu seperti pemutar musik pada umumnya.
- 🟢 **Status Lagu (QUEUED / PLAYING / PLAYED)** — Menandai lagu yang sedang dan sudah diputar.
- 🧠 **State Management Context API** — Mengatur status global pemutar lagu.
- ⚙️ **Server Actions (Next.js 15)** — Untuk interaksi database tanpa API tradisional.
- 💾 **Prisma + PostgreSQL (Neon)** — Penyimpanan data user, lagu, dan box.

---

## 🧠 Tujuan Proyek

Tujuan utama proyek ini adalah agar pengguna dapat **mendengarkan lagu tanpa gangguan iklan**, dengan pengalaman mirip layanan streaming populer.  
Namun perlu dicatat bahwa **proyek ini dibuat semata-mata untuk keperluan pembelajaran dan eksperimen**, bukan untuk penggunaan komersial atau distribusi publik.

Selain itu, proyek ini juga menjadi sarana untuk mempelajari:

- Integrasi dengan YouTube IFrame API.
- Manajemen state global untuk playlist dinamis.
- Penanganan efek samping saat lagu berpindah dan status lagu berubah.

---

## 🧩 Stack Teknologi

| Bagian           | Teknologi                           |
| ---------------- | ----------------------------------- |
| Frontend         | Next.js 15 (App Router), TypeScript |
| Database         | PostgreSQL (Neon)                   |
| ORM              | Prisma                              |
| State Management | React Context API                   |
| Player           | YouTube IFrame API                  |
| Deployment       | Vercel                              |

---

## 🛠️ Cara Menjalankan (Development)

```bash
# 1. Clone repository ini
git clone https://github.com/username/musique.git
cd musique

# 2. Install dependencies
npm install

# 3. Atur file .env
DATABASE_URL=your_postgres_connection
NEXT_PUBLIC_BASE_URL=http://localhost:3000
YOUTUBE_API_KEY=your_youtube_api_key

# 4. Jalankan Prisma
npx prisma generate
npx prisma db push

# 5. Jalankan development server
npm run dev

# 6. Buka di browser
http://localhost:3000
```
