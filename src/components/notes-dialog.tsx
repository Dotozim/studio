
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { LoggedHabit } from "@/lib/types";
import { format, parseISO } from "date-fns";

type NotesDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  entry: LoggedHabit;
  onSave: (id: string, notes: string) => void;
};

export function NotesDialog({ isOpen, setIsOpen, entry, onSave }: NotesDialogProps) {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (entry) {
      setNotes(entry.notes || "");
    }
  }, [entry]);

  const handleSave = () => {
    onSave(entry.id, notes);
  };

  if (!entry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notes for {format(parseISO(entry.startTime), "HH:mm")}</DialogTitle>
          <DialogDescription>
            Add or edit notes for this habit entry on {format(parseISO(entry.startTime), "MMMM d, yyyy")}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="notes-input">Notes</Label>
          <Textarea
            id="notes-input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[150px]"
            placeholder="Type your notes here..."
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save Notes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
