/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMusique } from "@/hooks/useMusiqueContext";
import { useEffect, useState, useTransition } from "react";
import { Button } from "../ui/button";
import { updateUser } from "@/app/_actions/user";
import { toast } from "sonner";

export function ProfilePageContent() {
  const { user } = useMusique();
  const [isUpdating, startTransition] = useTransition();

  const [username, setUsername] = useState("");

  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user]);

  const handleButtonClick = () => {
    if (!user?.fingerPrint) return;

    startTransition(async () => {
      try {
        const updatedUser = await updateUser(user.fingerPrint, username);
        if (updatedUser.data) {
          toast.success(updatedUser.message);
        }
      } catch (error) {
        console.error("Error updating user", error);
        toast.error("Error updating user. Please try again...");
      }
    });
  };

  return (
    <div className="bg-grid  h-[calc(93dvh-70px)] flex items-center justify-center px-4 sm:px-0">
      <Card className="w-full max-w-2xl bg-white">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Profile anda
          </CardTitle>
          <CardDescription className="text-lg md:text-xl leading-relaxed text-gray-600">
            Beginilah tampilan Anda di mata pengguna lain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-lg w-full mx-auto">
            <div>
              <label
                htmlFor="username"
                className="text-sm font-medium text-gray-700 text-left"
              >
                Username
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isUpdating}
              />
            </div>
            <Button
              type="button"
              className="w-full text-md"
              disabled={isUpdating || !username}
              onClick={handleButtonClick}
            >
              Update Username
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
