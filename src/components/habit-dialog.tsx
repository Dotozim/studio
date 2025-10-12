"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
  habits: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
  }),
  partner: z.string().optional(),
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newEntry: HabitEntry = {
      date: format(date, "yyyy-MM-dd"),
      habits: values.habits as Habit[],
      partner: values.partner,
    };
    setHabitEntry(newEntry);
    setIsOpen(false);
    form.reset();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Habits for {format(date, "MMMM d, yyyy")}</DialogTitle>
          <DialogDescription>
            Select the habits you completed. Click save when you're done.
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
