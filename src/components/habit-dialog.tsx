"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useHabitStore } from "@/lib/store";
import type { Habit, HabitEntry } from "@/lib/types";
import { Minus, Plus } from "lucide-react";

const habits: { id: Habit; label: string }[] = [
  { id: "BOB", label: "BOB" },
  { id: "FL", label: "FL" },
];

const formSchema = z.object({
  habits: z.record(z.nativeEnum(Object.keys(habits.reduce((acc, h) => ({...acc, [h.id]: ''}), {})) as unknown as { [s: string]: "" | "BOB" | "FL" }), z.number().optional()),
  partner: z.string().optional(),
}).refine((data) => {
  const hasHabits = Object.values(data.habits).some(count => count && count > 0);
  const hasPartner = data.partner && data.partner.trim() !== '';
  return hasHabits || hasPartner;
}, {
  message: "You must log at least one habit or enter a partner.",
  path: ["habits"],
});


type HabitDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  date: Date;
  entry?: HabitEntry;
};

export function HabitDialog({
  isOpen,
  setIsOpen,
  date,
  entry,
}: HabitDialogProps) {
  const setHabitEntry = useHabitStore((state) => state.setHabitEntry);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      habits: entry?.habits || {},
      partner: entry?.partner || "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        habits: entry?.habits || {},
        partner: entry?.partner || "",
      });
    }
  }, [isOpen, entry, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    const newEntry: HabitEntry = {
      date: format(date, "yyyy-MM-dd"),
      habits: values.habits,
      partner: values.partner,
    };
    setHabitEntry(newEntry);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Habits for {format(date, "MMMM d, yyyy")}</DialogTitle>
          <DialogDescription>
            Log your habits for the day. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <FormLabel>Completed Habits</FormLabel>
              <FormDescription>
                Use the buttons to log how many times you completed each habit.
              </FormDescription>
              {habits.map((habit) => (
                <FormField
                  key={habit.id}
                  control={form.control}
                  name={`habits.${habit.id}`}
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <FormLabel className="text-base font-normal">{habit.label}</FormLabel>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => field.onChange(Math.max(0, (field.value || 0) - 1))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center text-lg font-bold">{field.value || 0}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => field.onChange((field.value || 0) + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormItem>
                  )}
                />
              ))}
               <FormMessage>{form.formState.errors.habits?.message}</FormMessage>
            </div>


            <FormField
              control={form.control}
              name="partner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partner</FormLabel>
                  <FormControl>
                    <Input placeholder="Name of person (optional)" {...field} />
                  </FormControl>
                  <FormDescription>
                    Did someone join you? Add their name here.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
