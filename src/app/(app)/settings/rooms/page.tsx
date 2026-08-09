import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { listRooms } from "./actions";
import RoomList from "./RoomList";
import { DoorOpen } from "lucide-react";

export default async function RoomsSettingsPage() {
  const session = await auth();
  if (session?.user?.role !== "OWNER" || !session.user.clinicId) {
    notFound();
  }

  const rooms = await listRooms();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
          <DoorOpen className="h-6 w-6 text-slate-500" />
          Salles de soins
        </h1>
        <p className="mt-1 text-slate-500">
          Configurez les salles où les patients sont appelés ou consultés.
        </p>
      </div>

      <RoomList initialRooms={rooms} />
    </div>
  );
}
