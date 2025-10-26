
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format, set } from "date-fns";
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
import type { HabitType, LoggedHabit, TimeOfDay } from "@/lib/types";
import { Plus, Users, BookHeart, Leaf } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const formSchema = z.object({
  habitType: z.enum(["BOB", "FL", "SOCIAL"]),
  partners: z.string().optional(),
});

type HabitDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  date: Date;
  timerData?: {startTime: string, duration: number, edgeCount: number};
};

export function HabitDialog({
  isOpen,
  setIsOpen,
  date,
  timerData,
}: HabitDialogProps) {
  const addHabit = useHabitStore((state) => state.addHabit);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      habitType: "BOB",
      partners: "",
    },
  });
  
  const habitType = form.watch("habitType");

  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        habitType: "BOB",
        partners: "",
      });
    }
  }, [isOpen, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    const startTime = timerData ? timerData.startTime : set(date, { hours: 12 }).toISOString();
    const duration = timerData ? timerData.duration : 0;
    const edgeCount = timerData ? timerData.edgeCount : 0;
    
    const newHabit: Omit<LoggedHabit, 'id'> = {
        type: values.habitType,
        startTime: startTime,
        duration: duration,
        edgeCount: edgeCount > 0 ? edgeCount : undefined,
        partners: values.habitType === 'SOCIAL' ? values.partners?.split(',').map(p => p.trim()).filter(Boolean) : undefined,
    };
    
    addHabit(newHabit);
    setIsOpen(false);
  }
  
  const timerDescription = timerData 
    ? `(${formatDuration(timerData.duration)} logged${timerData.edgeCount > 0 ? `, ${timerData.edgeCount} edges` : ''})` 
    : '';

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Habit for {format(date, "MMMM d, yyyy")}</DialogTitle>
          <DialogDescription>
            What did you just complete? {timerDescription}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="habitType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Select Habit</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="BOB" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center gap-2">
                          <BookHeart /> BOB
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="FL" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center gap-2">
                          <Leaf /> FL
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="SOCIAL" />
                        </FormControl>
                        <FormLabel className="font-normal flex items-center gap-2">
                          <Users /> Social
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {habitType === 'SOCIAL' && (
                <FormField
                control={form.control}
                name="partners"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Partners</FormLabel>
                    <FormControl>
                        <Input placeholder="Alice, Bob..." {...field} />
                    </FormControl>
                    <FormDescription>
                        Who did you hang out with? (comma separated)
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
            )}

            <DialogFooter>
              <Button type="submit">Save Habit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
