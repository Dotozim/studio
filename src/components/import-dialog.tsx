
"use client";

import { useState } from "react";
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
import { useHabitStore } from "@/lib/store";
import type { HabitEntry } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Label } from "./ui/label";

type ImportDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export function ImportDialog({ isOpen, setIsOpen }: ImportDialogProps) {
  const [importData, setImportData] = useState("");
  const setHabitEntry = useHabitStore((state) => state.setHabitEntry);
  const { toast } = useToast();

  const handleImport = () => {
    const lines = importData.trim().split('\n');
    if (lines.length < 2) {
        toast({
            variant: "destructive",
            title: "Invalid Format",
            description: "The import data is not in the correct format.",
        });
        return;
    }

    const year = parseInt(lines[0].trim(), 10);
    if (isNaN(year)) {
        toast({
            variant: "destructive",
            title: "Invalid Year",
            description: "The first line must be a valid year.",
        });
        return;
    }

    let importedCount = 0;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === "") continue;

      const parts = line.split('/');
      if (parts.length !== 2) continue;

      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);

      if (isNaN(day) || isNaN(month) || day < 1 || day > 31 || month < 1 || month > 12) {
        continue;
      }
      
      // Pad with leading zeros
      const monthStr = month.toString().padStart(2, '0');
      const dayStr = day.toString().padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;

      const newEntry: HabitEntry = {
        date: dateStr,
        habits: {
          BOB: { morning: 1 },
        },
      };

      setHabitEntry(newEntry);
      importedCount++;
    }
    
    toast({
        title: "Import Successful",
        description: `Successfully imported ${importedCount} entries.`,
    });

    setImportData("");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Data</DialogTitle>
          <DialogDescription>
            Paste your data below. The format should be the year on the first line, followed by dates (DD/MM) on subsequent lines.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <Label htmlFor="import-data">Data</Label>
            <Textarea
                id="import-data"
                placeholder="2024&#10;01/07&#10;03/07&#10;..."
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="min-h-[200px]"
            />
        </div>
        <DialogFooter>
          <Button onClick={handleImport}>Import Data</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
