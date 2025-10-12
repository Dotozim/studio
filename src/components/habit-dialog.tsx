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
import { Checkbox } from "@/components/ui/checkbox";
import { useHabitStore } from "@/lib/store";
import type { Habit, HabitEntry } from "@/lib/types";

const habits: { id: Habit; label: string }[] = [
  { id: "BOB", label: "BOB" },
  { id: "FL", label: "FL" },
];

const formSchema = z.object({
  habits: z.array(z.string()),
  partner: z.string().optional(),
}).refine((data) => data.habits.length > 0 || (data.partner && data.partner.trim() !== ''), {
  message: "You must select at least one habit or enter a partner.",
  path: ["habits"], // assign error to habits field
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
      habits: entry?.habits || [],
      partner: entry?.partner || "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        habits: entry?.habits || [],
        partner: entry?.partner || "",
      });
    }
  }, [isOpen, entry, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    const newEntry: HabitEntry = {
      date: format(date, "yyyy-MM-dd"),
      habits: values.habits as Habit[],
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
            Select habits or add a partner. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="habits"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Completed Habits</FormLabel>
                    <FormDescription>
                      Select the habits you've done today.
                    </FormDescription>
                  </div>
                  {habits.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="habits"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />

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
