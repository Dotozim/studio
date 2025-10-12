"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useForm, useFieldArray } from "react-hook-form";
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
import type { Habit, HabitEntry, TimeOfDay } from "@/lib/types";
import { Minus, Plus, Sun, Moon, Sunrise, Sunset, HelpCircle, Users, Trash2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";

const habits: { id: Habit; label: string }[] = [
  { id: "BOB", label: "BOB" },
  { id: "FL", label: "FL" },
];

const timesOfDay: { id: TimeOfDay; label: string; icon: React.ElementType }[] = [
  { id: "dawn", label: "Dawn", icon: Sunrise },
  { id: "morning", label: "Morning", icon: Sun },
  { id: "afternoon", label: "Afternoon", icon: Sunset },
  { id: "night", label: "Night", icon: Moon },
  { id: "not-sure", label: "Not Sure", icon: HelpCircle },
];

const formSchema = z.object({
  habits: z.record(z.string(), z.record(z.string(), z.number().optional()).optional()),
  social: z.object({
    partners: z.array(z.object({ value: z.string() })).optional(),
    times: z.record(z.string(), z.number().optional()).optional(),
  }).optional(),
}).refine((data) => {
  const hasHabits = Object.values(data.habits).some(habitTimes => 
    habitTimes && Object.values(habitTimes).some(count => count && count > 0)
  );
  const socialTimes = data.social?.times;
  const hasSocialTime = socialTimes && Object.values(socialTimes).some(count => count && count > 0);
  const hasSocialPartners = data.social?.partners?.some(p => p.value.trim() !== '');

  return hasHabits || hasSocialTime || hasSocialPartners;
}, {
  message: "You must log at least one habit or social interaction.",
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
      social: { 
        partners: entry?.social?.partners?.map(p => ({ value: p })) || [{ value: "" }],
        times: entry?.social?.times || {},
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "social.partners",
  });
  
  const socialPartners = form.watch("social.partners");
  const socialTimes = form.watch("social.times");

  React.useEffect(() => {
    const totalSocialCount = Object.values(socialTimes || {}).reduce((acc, count) => acc + (count || 0), 0);
    if (socialPartners && socialPartners.some(p => p.value.trim() !== '') && totalSocialCount === 0) {
        // If there's a partner but no time is logged, default 'not-sure' to 1
        const currentNotSure = form.getValues("social.times.not-sure") || 0;
        if (currentNotSure === 0) {
            form.setValue("social.times.not-sure", 1, { shouldValidate: true });
        }
    }
  }, [socialPartners, socialTimes, form]);


  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        habits: entry?.habits || {},
        social: {
          times: entry?.social?.times || {},
          partners: entry?.social?.partners?.map(p => ({ value: p }))?.length ? entry?.social?.partners?.map(p => ({ value: p })) : [{value: ''}],
        },
      });
    }
  }, [isOpen, entry, form]);


  function onSubmit(values: z.infer<typeof formSchema>) {
    const socialTimes = values.social?.times || {};
    let socialCount = Object.values(socialTimes).reduce((acc, count) => acc + (count || 0), 0);
    
    const validPartners = values.social?.partners?.map(p => p.value).filter(p => p.trim() !== '') || [];
    const hasSocialPartners = validPartners.length > 0;

    if (hasSocialPartners && socialCount === 0) {
      socialCount = 1;
      if(!socialTimes['not-sure']) {
        socialTimes['not-sure'] = 1;
      }
    }

    const newEntry: HabitEntry = {
      date: format(date, "yyyy-MM-dd"),
      habits: values.habits as HabitEntry['habits'],
      social: {
        count: socialCount,
        partners: validPartners,
        times: socialTimes,
      },
    };

    setHabitEntry(newEntry);
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Log Habits for {format(date, "MMMM d, yyyy")}</DialogTitle>
          <DialogDescription>
            Log your habits for the day. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 h-full flex flex-col">
            <ScrollArea className="pr-4 flex-1">
              <div className="space-y-4">
                <div>
                  <FormLabel>Completed Habits</FormLabel>
                  <FormDescription>
                    Use the buttons to log how many times you completed each habit.
                  </FormDescription>
                </div>
                {habits.map((habit) => (
                  <Collapsible key={habit.id} className="rounded-lg border p-4">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between w-full cursor-pointer">
                          <FormLabel className="text-base font-normal">{habit.label}</FormLabel>
                          <Button type="button" variant="ghost" size="sm" className="w-9 p-0">
                              <Plus className="h-4 w-4" />
                              <span className="sr-only">Toggle</span>
                          </Button>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 pt-4">
                        <Separator />
                        {timesOfDay.map((time) => (
                            <FormField
                            key={time.id}
                            control={form.control}
                            name={`habits.${habit.id}.${time.id}`}
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between p-2 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <time.icon className="h-4 w-4 text-muted-foreground" />
                                    <FormLabel className="text-sm font-normal">{time.label}</FormLabel>
                                  </div>
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
                      </CollapsibleContent>
                  </Collapsible>
                ))}
                <FormMessage>{form.formState.errors.habits?.message}</FormMessage>
              
                <Collapsible className="rounded-lg border p-4">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between w-full cursor-pointer">
                        <FormLabel className="text-base font-normal flex items-center gap-2"><Users /> Social</FormLabel>
                        <Button type="button" variant="ghost" size="sm" className="w-9 p-0">
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Toggle</span>
                        </Button>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-4 pt-4">
                      <Separator />
                        {timesOfDay.map((time) => (
                          <FormField
                          key={time.id}
                          control={form.control}
                          name={`social.times.${time.id}`}
                          render={({ field }) => (
                              <FormItem className="flex items-center justify-between p-2 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <time.icon className="h-4 w-4 text-muted-foreground" />
                                  <FormLabel className="text-sm font-normal">{time.label}</FormLabel>
                                </div>
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
                        <Separator/>
                        <div className="space-y-2 p-2">
                          <FormLabel>Partners</FormLabel>
                          <FormDescription>
                              Who did you hang out with?
                          </FormDescription>
                          {fields.map((field, index) => (
                            <FormField
                              key={field.id}
                              control={form.control}
                              name={`social.partners.${index}.value`}
                              render={({ field }) => (
                                <FormItem>
                                  <div className="flex items-center gap-2">
                                    <FormControl>
                                      <Input placeholder="Name of person" {...field} />
                                    </FormControl>
                                    {fields.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => remove(index)}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                    )}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ value: "" })}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Partner
                          </Button>
                        </div>
                    </CollapsibleContent>
                </Collapsible>
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4">
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
