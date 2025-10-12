"use client";

import { isSameMonth, format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useHabitStore } from "@/lib/store";
import { Separator } from "./ui/separator";

type MonthlySummaryProps = {
  month: Date;
};

export function MonthlySummary({ month }: MonthlySummaryProps) {
  const entries = useHabitStore((state) => state.entries);

  const monthlyEntries = entries.filter((entry) =>
    isSameMonth(new Date(entry.date), month)
  );

  const bobCount = monthlyEntries.filter((e) => e.habits.includes("BOB")).length;
  const flCount = monthlyEntries.filter((e) => e.habits.includes("FL")).length;

  const partnerCounts = monthlyEntries.reduce((acc, entry) => {
    if (entry.partner) {
      const partnerName = entry.partner.trim();
      if(partnerName) {
        acc[partnerName] = (acc[partnerName] || 0) + 1;
      }
    }
    return acc;
  }, {} as Record<string, number>);

  const total = bobCount + flCount;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          {format(month, "MMMM yyyy")} Summary
        </CardTitle>
        <CardDescription>Your progress for the month.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">BOB</span>
          <span className="font-semibold">{bobCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">FL</span>
          <span className="font-semibold">{flCount}</span>
        </div>
        
        {Object.keys(partnerCounts).length > 0 && (
          <>
            <Separator />
            {Object.entries(partnerCounts).map(([name, count]) => (
              <div key={name} className="flex justify-between items-center">
                <span className="text-muted-foreground">{name}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </>
        )}

        <Separator />
        <div className="flex justify-between items-center font-bold text-base">
          <span>TOTAL</span>
          <span>{total}</span>
        </div>
      </CardContent>
    </Card>
  );
}
