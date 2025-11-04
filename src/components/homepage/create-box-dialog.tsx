"use client";

import { createBox } from "@/app/_actions/box";
import { useState, useTransition } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { useMusique } from "@/hooks/useMusiqueContext";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";

export function CreateBoxDialog() {
  const router = useRouter();
  const { user } = useMusique();

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [isLoading, startTransition] = useTransition();

  const handleButtonClick = () => {
    if (!user?.id) return;

    startTransition(async () => {
      try {
        const createdBox = await createBox(user.id, name);
        if (createdBox.success) {
          toast.success("Berhasil membuat box baru");
          router.push(routes.play(createdBox.data.slug));
          setIsOpen(false);
        }
      } catch (error) {
        console.error("Error creating box", error);
        toast.error("Error creating box. Please try again...");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="text-md font-semibold!">
          Buat Musique
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat musique baru</DialogTitle>
          <DialogDescription>
            Masukan nama untuk musique anda.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Input
            placeholder="Nama musique"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="neutral" disabled={isLoading}>
              Batal
            </Button>
          </DialogClose>
          <Button
            onClick={handleButtonClick}
            disabled={isLoading || !name.length}
          >
            {isLoading ? "Buat..." : "Buat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
