import { updateBoxSongPosition } from "@/app/_actions/box-song";
import { ListSong } from "@/config/types";
import {
  formatBoxSongStatus,
  formatTime,
  parseYouTubeDuration,
} from "@/lib/utils";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BoxSongStatus } from "@prisma/client";
import {
  CheckIcon,
  ClockIcon,
  GripVerticalIcon,
  Loader2Icon,
  PlayIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface PlaylistTableProps {
  listSong: ListSong[];
  setListSong: (listSong: ListSong[]) => void;
  setCurrentSongIndex: (index: number) => void;
  currentSongIndex: number | null;
  isCreator?: boolean;
}

export function PlaylistTable({
  listSong,
  setListSong,
  setCurrentSongIndex,
  currentSongIndex,
  isCreator = false,
}: PlaylistTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && over.id !== active.id) {
      const oldIndex = listSong.findIndex((lSong) => lSong.id === active.id);
      const newIndex = listSong.findIndex((lSong) => lSong.id === over.id);

      const arrMove = arrayMove(listSong, oldIndex, newIndex);

      setListSong(arrMove);

      const newPosition = listSong[newIndex];
      if (newIndex !== -1) {
        const { message, success } = await updateBoxSongPosition(
          active.id as string,
          newPosition.position
        );

        if (success) {
          const reorderingPosition = arrMove.map((lSong, index) => {
            return {
              ...lSong,
              position: index + 1,
            };
          });

          setCurrentSongIndex(newIndex);

          setListSong(reorderingPosition);

          toast.success(message);
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
    >
      <SortableContext
        strategy={verticalListSortingStrategy}
        items={listSong.map((lSong) => lSong.id)}
      >
        <Table>
          <TableCaption className="font-medium text-lg underline italic">
            Maksimal 10 Lagu 😁
          </TableCaption>
          <TableHeader>
            <TableRow className="bg-white">
              {isCreator && <TableHead className="w-20"></TableHead>}
              <TableHead>#</TableHead>
              <TableHead className="w-[500px] text-left">Judul</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead>Durasi</TableHead>
              <TableHead>Ditambahkan oleh</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listSong.map((lSong) => {
              return (
                <PlaylistTableRow
                  key={lSong.id}
                  lSong={lSong}
                  isCreator={isCreator}
                />
              );
            })}
          </TableBody>
        </Table>
      </SortableContext>
    </DndContext>
  );
}

interface PlaylistTableRowProps {
  lSong: ListSong;
  isCreator?: boolean;
}

function PlaylistTableRow({ lSong, isCreator = false }: PlaylistTableRowProps) {
  const { attributes, listeners, setNodeRef, transition, transform } =
    useSortable({ id: lSong.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <TableRow
        ref={setNodeRef}
        style={style}
        {...attributes}
        className="bg-gray-200"
      >
        {isCreator && (
          <TableCell {...listeners}>
            <GripVerticalIcon className="size-4 cursor-grab" />
          </TableCell>
        )}
        <TableCell>
          {lSong.position === 999 ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            lSong.position
          )}
        </TableCell>
        <TableCell className="line-clamp-1 truncate">{lSong.title}</TableCell>
        <TableCell className={lSong.artist != "" ? "" : "italic text-gray-600"}>
          {lSong.artist || "Tidak dapat menemukan"}
        </TableCell>
        <TableCell>
          {formatTime(parseYouTubeDuration(lSong.duration))}
        </TableCell>
        <TableCell>{lSong.user.username}</TableCell>
        <TableCell>
          <div className="flex items-center gap-1.5">
            {lSong.status === BoxSongStatus.PLAYED && (
              <CheckIcon className="size-4" />
            )}
            {lSong.status === BoxSongStatus.PLAYING && (
              <PlayIcon className="size-4 text-green-500" />
            )}
            {lSong.status === BoxSongStatus.QUEUED && (
              <ClockIcon className="size-4" />
            )}
            <p>{formatBoxSongStatus(lSong.status)}</p>
          </div>
        </TableCell>
      </TableRow>
    </>
  );
}
