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

  const countHabits = (habitName: "BOB" | "FL") => {
    return monthlyEntries.reduce((acc, e) => {
      const habitTimes = e.habits[habitName];
      if (habitTimes) {
        return acc + Object.values(habitTimes).reduce((sum, count) => sum + (count || 0), 0);
      }
      return acc;
    }, 0);
  }

  const bobCount = countHabits("BOB");
  const flCount = countHabits("FL");
  
  const socialCount = monthlyEntries.reduce((acc, entry) => {
    return acc + (entry.social?.count || 0);
  }, 0);

  const partnerCounts = monthlyEntries.reduce((acc, entry) => {
    if (entry.social && entry.social.count > 0 && entry.social.partners) {
      entry.social.partners.forEach(partnerNameRaw => {
        const partnerName = partnerNameRaw.trim();
        if (partnerName) {
          // We assume each interaction involves all partners listed, so we add the count to each.
          // If the logic should be different (e.g., count is per partner), this needs adjustment.
          // For now, let's say if count is 2 and partners are A and B, A gets 2 and B gets 2.
          acc[partnerName] = (acc[partnerName] || 0) + entry.social!.count;
        }
      });
    }
    return acc;
  }, {} as Record<string, number>);
  
  const total = bobCount + flCount + socialCount;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">
          {format(month, "MMMM yyyy")} Summary
        </CardTitle>
        <CardDescription>Your progress for the month.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex justify-between items-center p-3 rounded-lg bg-primary/20">
          <span className="font-medium text-card-foreground">BOB</span>
          <span className="font-semibold text-card-foreground">{bobCount}</span>
        </div>
        <div className="flex justify-between items-center p-3 rounded-lg bg-accent/30">
          <span className="font-medium text-accent-foreground">FL</span>
          <span className="font-semibold text-accent-foreground">{flCount}</span>
        </div>
        
        <div className="flex justify-between items-center p-3 rounded-lg bg-destructive/20">
          <span className="font-medium text-card-foreground">Social</span>
          <span className="font-semibold text-card-foreground">{socialCount}</span>
        </div>
        
        {Object.keys(partnerCounts).length > 0 && (
          <>
            <Separator />
            <p className="font-medium text-muted-foreground pt-2">Partners</p>
            {Object.entries(partnerCounts).map(([name, count]) => (
              <div key={name} className="flex justify-between items-center p-3 rounded-lg bg-destructive/10">
                <span className="font-medium text-card-foreground">{name}</span>
                <span className="font-semibold text-card-foreground">{count}</span>
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
