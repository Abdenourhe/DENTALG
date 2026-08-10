"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Save, UserCog } from "lucide-react";

type SoundType = "ding" | "chime" | "bell" | "none";

const soundOptions = [
  { value: "ding", label: "Ding court" },
  { value: "chime", label: "Carillon" },
  { value: "bell", label: "Cloche" },
  { value: "none", label: "Aucun" },
];

function playSound(type: SoundType) {
  try {
    const AudioCtx =
      window.AudioContext ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const audioCtx = new AudioCtx();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;
    gainNode.gain.setValueAtTime(0.3, now);

    switch (type) {
      case "ding":
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, now);
        oscillator.frequency.exponentialRampToValueAtTime(440, now + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
        break;
      case "chime":
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(523.25, now);
        oscillator.frequency.setValueAtTime(659.25, now + 0.1);
        oscillator.frequency.setValueAtTime(783.99, now + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        oscillator.start(now);
        oscillator.stop(now + 0.6);
        break;
      case "bell":
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(523.25, now);
        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        oscillator.start(now);
        oscillator.stop(now + 0.8);
        break;
      default:
        audioCtx.close();
    }
  } catch {
    // ignore
  }
}

export default function AccountSettingsPage() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundType, setSoundType] = useState<SoundType>("ding");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedEnabled = localStorage.getItem("dentalg_waiting_room_sound");
    const storedType = localStorage.getItem("dentalg_waiting_room_sound_type");
    setSoundEnabled(storedEnabled === "true");
    setSoundType((storedType as SoundType) || "ding");
  }, []);

  function save() {
    localStorage.setItem("dentalg_waiting_room_sound", String(soundEnabled));
    localStorage.setItem("dentalg_waiting_room_sound_type", soundType);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
          <UserCog className="h-6 w-6 text-slate-500" />
          Paramètres du compte
        </h1>
        <p className="mt-1 text-slate-500">
          Personnalisez votre expérience dans l&apos;application.
        </p>
      </div>

      <Card>
        <CardHeader className="border-b px-6 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Volume2 className="h-5 w-5 text-violet-600" />
            Salle d&apos;attente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
            <div>
              <p className="font-medium text-slate-900">Son de notification</p>
              <p className="text-sm text-slate-500">
                Émettre un son quand un nouveau patient arrive en salle
                d&apos;attente.
              </p>
            </div>
            <Switch
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
              label=""
            />
          </div>

          <div className="max-w-sm">
            <Select
              label="Type de son"
              value={soundType}
              onChange={(e) => setSoundType(e.target.value as SoundType)}
              disabled={!soundEnabled}
              options={soundOptions}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              className="gap-2"
              onClick={() => playSound(soundType)}
              disabled={soundType === "none"}
            >
              {soundType === "none" ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
              Tester le son
            </Button>
            <Button type="button" className="gap-2" onClick={save}>
              <Save className="h-4 w-4" />
              {saved ? "Enregistré" : "Enregistrer"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
