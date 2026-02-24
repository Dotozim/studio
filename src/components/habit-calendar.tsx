
"use client";

import * as React from "react";
import { Calendar as UICalendar, CalendarProps as UICalendarProps } from "@/components/ui/calendar";
import { useHabitStore } from "@/lib/store";
import type { HabitType } from "@/lib/types";
import { parseISO, format, addMonths, subMonths, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

type HabitCalendarProps = Omit<UICalendarProps, 'mode' | 'onSelect' | 'selected'> & {
  month: Date;
  onMonthChange: (date: Date) => void;
  onDateSelect: (date: Date | undefined) => void;
  onDateDoubleClick?: (date: Date | undefined) => void;
  onMonthSelect?: (date: Date) => void;
  disableNav?: boolean;
  showCaption?: boolean;
};

export function HabitCalendar({ month, onMonthChange, onDateSelect, onDateDoubleClick, onMonthSelect, disableNav = false, showCaption = true, ...props }: HabitCalendarProps) {
  const habitsByDay = useHabitStore((state) => state.habitsByDay);
  
  return (
    <UICalendar
      mode="single"
      onDayClick={onDateSelect}
      onDayDoubleClick={onDateDoubleClick}
      month={month}
      onMonthChange={onMonthChange}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
        Caption: ({ ...props }) => {
          if (!showCaption) return null;
          return (
            <div className="flex justify-center pt-1 relative items-center">
              {!disableNav && (
                <Button
                  variant="outline"
                  className="h-7 w-7 p-0 absolute left-1"
                  onClick={() => onMonthChange(subMonths(month, 1))}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
               <button
                className={cn("text-lg font-medium font-headline", onMonthSelect && !disableNav ? "cursor-pointer hover:bg-accent rounded-md px-2" : "")}
                onClick={onMonthSelect && !disableNav ? () => onMonthSelect(month) : undefined}
                aria-live="polite"
                disabled={!onMonthSelect || disableNav}
              >
                {format(props.displayMonth, "MMMM")}
              </button>
              {!disableNav && (
                 <Button
                  variant="outline"
                  className="h-7 w-7 p-0 absolute right-1"
                  onClick={() => onMonthChange(addMonths(month, 1))}
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        },
        Day: ({date, displayMonth, className, ...dayProps}) => {
          const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);
          
          const dayKey = format(date, "yyyy-MM-dd");
          const habitsForDay = habitsByDay.get(dayKey);

          const dayClass = cn({
            'day-bob': habitsForDay?.has('BOB'),
            'day-fl': habitsForDay?.has('FL'),
            'day-social': habitsForDay?.has('SOCIAL'),
          });
          
          const isOutside = date.getMonth() !== displayMonth.getMonth();
          
          if(isOutside) {
            return <div className="text-muted-foreground opacity-50 invisible h-full w-full">{date.getDate()}</div>
          }
          
          const handlePointerDown = () => {
            longPressTimer.current = setTimeout(() => {
              if (onDateDoubleClick) {
                onDateDoubleClick(date);
              }
            }, 700);
          };

          const handlePointerUp = () => {
            if (longPressTimer.current) {
              clearTimeout(longPressTimer.current);
            }
          };

          const handlePointerMove = () => {
            if (longPressTimer.current) {
              clearTimeout(longPressTimer.current);
            }
          };

          return (
            <div
              className={cn(dayClass, 'h-full w-full', className)}
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerMove={handlePointerMove}
              onDoubleClick={(dayProps as any).onDoubleClick}
            >
              {date.getDate()}
            </div>
          )
        }
      }}
      className="p-0"
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        caption_label: 'hidden', // Hide the default caption label
        caption: "flex justify-center pt-1 relative items-center",
        nav: "space-x-1 flex items-center",
        nav_button: `h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100`,
        table: "w-full border-collapse space-y-1",
        head_row: "flex justify-around",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-sm",
        row: "flex w-full mt-2 justify-around",
        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md relative",
        day_selected:"bg-primary/20 text-primary-foreground hover:bg-primary/30",
        day_today: "bg-primary text-primary-foreground",
        day_outside: "text-muted-foreground opacity-50 invisible",
        day_inner: "flex items-center justify-center h-full w-full",
      }}
      {...props}
    />
  );
}
