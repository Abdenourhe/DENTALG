"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { createRoom, updateRoom, deleteRoom } from "./actions";
import { Room } from "@prisma/client";
import {
  DoorOpen,
  GripVertical,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

interface RoomListProps {
  initialRooms: Room[];
}

export default function RoomList({ initialRooms }: RoomListProps) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pending, setPending] = useState(false);

  async function handleCreate(formData: FormData) {
    setPending(true);
    setErrors({});
    const data = Object.fromEntries(formData.entries());
    const res = await createRoom(data);
    setPending(false);

    if (!res.ok) {
      setErrors(res.errors);
      return;
    }

    setRooms((prev) =>
      [...prev, res.room].sort(
        (a, b) =>
          a.order - b.order || a.createdAt.getTime() - b.createdAt.getTime(),
      ),
    );
  }

  async function handleUpdate(formData: FormData) {
    if (!editingId) return;
    setPending(true);
    setErrors({});
    const data = Object.fromEntries(formData.entries());
    const res = await updateRoom(editingId, data);
    setPending(false);

    if (!res.ok) {
      setErrors(res.errors);
      return;
    }

    setRooms((prev) =>
      prev
        .map((r) => (r.id === editingId ? res.room : r))
        .sort(
          (a, b) =>
            a.order - b.order || a.createdAt.getTime() - b.createdAt.getTime(),
        ),
    );
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette salle ?")) return;
    setPending(true);
    const res = await deleteRoom(id);
    setPending(false);

    if (res.ok) {
      setRooms((prev) => prev.filter((r) => r.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="text-base font-semibold">
            Ajouter une salle
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form action={handleCreate}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div className="sm:col-span-7">
                <Input
                  name="name"
                  label="Nom"
                  placeholder="Ex : Salle 1, Salle d'urgence..."
                  error={errors.name?.[0]}
                  disabled={pending}
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  name="order"
                  label="Ordre"
                  type="number"
                  defaultValue="0"
                  disabled={pending}
                />
              </div>
              <div className="flex items-end sm:col-span-3">
                <Button
                  type="submit"
                  disabled={pending}
                  className="w-full gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter
                </Button>
              </div>
            </div>
          </form>

          {errors.global && (
            <p className="mt-3 text-sm text-red-600">{errors.global[0]}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="text-base font-semibold">
            Salles configurées
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {rooms.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              Aucune salle configurée.
            </p>
          ) : (
            <div className="divide-y">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className={`flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-slate-50 ${
                    room.isActive ? "" : "bg-slate-50/50"
                  }`}
                >
                  {editingId === room.id ? (
                    <form action={handleUpdate} className="w-full">
                      <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-12">
                        <div className="sm:col-span-5">
                          <Input
                            name="name"
                            label="Nom"
                            defaultValue={room.name}
                            error={errors.name?.[0]}
                            disabled={pending}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Input
                            name="order"
                            label="Ordre"
                            type="number"
                            defaultValue={room.order}
                            disabled={pending}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Switch
                            name="isActive"
                            label="Active"
                            defaultChecked={room.isActive}
                            disabled={pending}
                            onCheckedChange={() => {}}
                          />
                        </div>
                        <div className="flex gap-2 sm:col-span-3">
                          <Button
                            type="submit"
                            size="sm"
                            disabled={pending}
                            className="gap-1"
                          >
                            <Save className="h-3.5 w-3.5" />
                            Enregistrer
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditingId(null)}
                            disabled={pending}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <GripVertical className="h-5 w-5 text-slate-300" />
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            room.isActive ? "bg-violet-50" : "bg-slate-100"
                          }`}
                        >
                          <DoorOpen
                            className={`h-5 w-5 ${
                              room.isActive
                                ? "text-violet-600"
                                : "text-slate-400"
                            }`}
                          />
                        </div>
                        <div>
                          <p
                            className={`font-medium ${
                              room.isActive
                                ? "text-slate-900"
                                : "text-slate-500 line-through"
                            }`}
                          >
                            {room.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            Ordre {room.order} ·{" "}
                            {room.isActive ? "Active" : "Inactive"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(room.id)}
                          disabled={pending}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(room.id)}
                          disabled={pending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
