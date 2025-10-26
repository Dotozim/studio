
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MonthlySummary } from "./monthly-summary";
import { format } from "date-fns";

type MonthlySummaryDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  month: Date;
};

export function MonthlySummaryDialog({ isOpen, setIsOpen, month }: MonthlySummaryDialogProps) {

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Summary for {format(month, "MMMM yyyy")}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
            <MonthlySummary month={month} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
