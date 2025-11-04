"use client";

import { GithubIcon, InstagramIcon, UserIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { routes } from "@/config/routes";
import { CreateBoxDialog } from "./create-box-dialog";

export function PageLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div>
      <div className="min-h-dvh flex flex-col bg-secondary-background">
        <nav className="h-[70px] border-b-4 border-border flex items-center bg-secondary-background w-full px-5">
          <div className="w-[1300px] mx-auto flex items-center justify-between">
            <Link href={routes.home}>
              <h1 className="font-bold text-2xl">Musique</h1>
            </Link>

            <div>
              {(pathname === routes.home || pathname === routes.profile) && (
                <CreateBoxDialog />
              )}
            </div>

            <div className="flex items-center justify-end gap-2 md:gap-4">
              <Button size="icon" className="bg-white" asChild>
                <Link href="https://github.com/peterVoid" target="_blank">
                  <GithubIcon className="size-5" />
                </Link>
              </Button>
              <Button size="icon" className="bg-white" asChild>
                <Link
                  href="https://www.instagram.com/haikal._.12/"
                  target="_blank"
                >
                  <InstagramIcon className="size-5" />
                </Link>
              </Button>
              <Button size="icon" className="bg-white" asChild>
                <Link href={routes.profile}>
                  <UserIcon className="size-5" />
                </Link>
              </Button>
            </div>
          </div>
        </nav>

        <div className="flex-1">{children}</div>

        <footer className="py-6 border-t-4 border-border bg-secondary-background  px-5">
          <div className="w-[1300px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 text-sm text-foreground/60">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-4">
              <span>Made with 💖</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
