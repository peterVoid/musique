import {
  FileX2Icon,
  MapIcon,
  Sparkles,
  StarIcon,
  StarsIcon,
} from "lucide-react";
import { SparklesText } from "../ui/sparkles-text";
import { Marquee } from "../ui/marquee";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

export function HomePage() {
  return (
    <div>
      <div className="min-h-[calc(98dvh-70px)] flex items-center justify-center w-full bg-background bg-grid">
        <div className="w-[1300px] max-w-full mx-auto flex items-center justify-center">
          <div className="flex flex-col w-full items-center p-4 text-center">
            {/* Mobile */}
            <div className="block lg:hidden">
              <div className="inline-flex items-start gap-3 text-xs font-bold! bg-white rounded-full border-2 border-border px-4 py-1.5 shadow-md mb-7">
                <StarIcon className="size-4" />
                100% gratis no iklan!
                <Sparkles className="size-4" />
              </div>
              <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
                Ubah HP kamu jadi <br className="hidden sm:block" />
                <SparklesText className="inline text-main text-3xl sm:text-5xl">
                  Musique
                </SparklesText>
              </h1>
              <div className="space-y-3 mt-7">
                <div className="flex items-center justify-center gap-2">
                  <span>🌐</span>
                  <p>100% gratis tanpa iklan</p>
                </div>
                <div className="flex  items-center justify-center gap-2">
                  <span>🕵️</span>
                  <p className="text-center">
                    Akun anonim - tanpa perlu daftar atau email
                  </p>
                </div>
                <div className="flex  items-center justify-center gap-2">
                  <span>✨</span>
                  <p>Bagikan tautan, tambahkan lagu bareng teman anda</p>
                </div>
                <div className="flex  items-center justify-center gap-2">
                  <span>🚫</span>
                  <p>Tidak perlu install aplikasi atau login</p>
                </div>
              </div>
            </div>
            {/* Desktop */}
            <div className="hidden lg:block">
              <div className="inline-flex items-start gap-3 text-xs font-bold! bg-white rounded-full border-2 border-border px-4 py-1.5 shadow-md mb-7">
                <StarIcon className="size-4" />
                100% gratis no iklan!
                <Sparkles className="size-4" />
              </div>
              <h1 className="text-7xl font-bold leading-tight">
                Ubah HP kamu <br />
                jadi{" "}
                <SparklesText className="inline text-main font-extrabold! text-7xl!">
                  Musique
                </SparklesText>
              </h1>
              <div className="space-y-3 mt-7">
                <div className="flex items-center justify-center gap-2">
                  <span>🌐</span>
                  <p>100% gratis tanpa iklan</p>
                </div>
                <div className="flex  items-center justify-center gap-2">
                  <span>🕵️</span>
                  <p className="text-center">
                    Akun anonim - tanpa perlu daftar atau email
                  </p>
                </div>
                <div className="flex  items-center justify-center gap-2">
                  <span>✨</span>
                  <p>Bagikan tautan, tambahkan lagu bareng teman anda</p>
                </div>
                <div className="flex  items-center justify-center gap-2">
                  <span>🚫</span>
                  <p>Tidak perlu install aplikasi atau login</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-secondary-background border-t-4 border-b-4 border-border">
        <Marquee className="h-[60px] lg:h-[100px] flex items-center justify-center text-xl font-medium">
          <div className="flex items-center">
            <StarsIcon className="text-foreground md:size-[30px] lg:size-[50px] mx-2 size-5" />
            <span className="flex items-center gap-2 text-sm xl:text-xl">
              Collaborative Playlist
            </span>
          </div>
          <div className="flex items-center">
            <MapIcon className="text-foreground md:size-[30px] lg:size-[50px] mx-2 size-5" />
            <span className="flex items-center gap-2 text-sm xl:text-xl">
              Add songs from your device
            </span>
          </div>
          <div className="flex items-center">
            <FileX2Icon className="text-foreground md:size-[30px] lg:size-[50px] mx-2 size-5" />
            <span className="flex items-center gap-2 text-sm xl:text-xl">
              No app required
            </span>
          </div>
        </Marquee>
      </div>

      <div className="bg-background/70 flex flex-col items-center justify-center py-14 px-4">
        <h1 className="text-3xl md:text-4xl text-center font-bold mb-8">
          Frequently Asked Questions
        </h1>
        <div className="w-full max-w-xl">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1">
              <AccordionTrigger className="bg-main text-black font-bold">
                Harushkah saya membuat akun untuk menggunakan Musique?
              </AccordionTrigger>
              <AccordionContent>
                Tidak butuh akun atau login to membuat atau bergabung dengan
                Musique. Langsung buat box saja dan share link nya kepada teman
                anda.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="bg-main text-black font-bold">
                Lagu apa saja yang tersedia?
              </AccordionTrigger>
              <AccordionContent>
                Sebernya apapun content yang ada di Youtube itu tersedia.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="bg-main text-black font-bold">
                Bagaimana saya bisa kontribusi?
              </AccordionTrigger>
              <AccordionContent>Saat ini masih belum bisa.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
