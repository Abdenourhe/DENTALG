"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { createRoom, updateRoom, deleteRoom } from "./actions";
import { Room } from "@prisma/client";
import { GripVertical, Pencil, Trash2, Plus } from "lucide-react";

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
      <form action={handleCreate} className="flex items-end gap-3">
        <div className="flex-1">
          <Input
            name="name"
            label="Nom de la salle"
            placeholder="Ex : Salle 1, Salle d'urgence..."
            error={errors.name?.[0]}
            disabled={pending}
          />
        </div>
        <Input
          name="order"
          label="Ordre"
          type="number"
          defaultValue="0"
          className="w-24"
          disabled={pending}
        />
        <Button type="submit" disabled={pending} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </form>

      {errors.global && (
        <p className="text-sm text-red-600">{errors.global[0]}</p>
      )}

      <div className="space-y-3">
        {rooms.map((room) => (
          <Card key={room.id} className={room.isActive ? "" : "opacity-60"}>
            <CardContent className="flex items-center justify-between gap-4 p-4">
              {editingId === room.id ? (
                <form
                  action={handleUpdate}
                  className="flex w-full items-end gap-3"
                >
                  <div className="flex-1">
                    <Input
                      name="name"
                      label="Nom"
                      defaultValue={room.name}
                      error={errors.name?.[0]}
                      disabled={pending}
                    />
                  </div>
                  <Input
                    name="order"
                    label="Ordre"
                    type="number"
                    defaultValue={room.order}
                    className="w-24"
                    disabled={pending}
                  />
                  <div className="pb-2">
                    <Switch
                      name="isActive"
                      label="Active"
                      defaultChecked={room.isActive}
                      disabled={pending}
                      onCheckedChange={() => {}}
                    />
                  </div>
                  <Button type="submit" size="sm" disabled={pending}>
                    Enregistrer
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingId(null)}
                    disabled={pending}
                  >
                    Annuler
                  </Button>
                </form>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-5 w-5 text-slate-300" />
                    <div>
                      <p className="font-medium text-slate-900">{room.name}</p>
                      <p className="text-xs text-slate-500">
                        Ordre {room.order} ·{" "}
                        {room.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
            </CardContent>
          </Card>
        ))}

        {rooms.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">
            Aucune salle configurée.
          </p>
        )}
      </div>
    </div>
  );
}
