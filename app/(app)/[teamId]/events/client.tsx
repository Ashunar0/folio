"use client";

import { useState } from "react";

import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical, Pencil, Trash } from "lucide-react";
import { useDragReorder } from "@/hooks/use-drag-reorder";

export default function EventsClient() {
  const [events, setEvents] = useState([
    { id: 1, name: "Q1 Planning" },
    { id: 2, name: "Team Building" },
    { id: 3, name: "Annual Conference" },
  ]);

  const {
    handleDragStart: handleEventDragStart,
    handleDragEnter: handleEventDragEnter,
    handleDragEnd: handleEventDragEnd,
  } = useDragReorder(events, setEvents);

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight">Event Management</h1>
      <Card className="py-0 rounded-md">
        <CardContent className="p-6 space-y-6">
          {/* Input Mode */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Event Input Mode</Label>
            <RadioGroup defaultValue="select" className="flex gap-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="select" id="r1" />
                <Label
                  htmlFor="r1"
                  className="text-sm font-normal cursor-pointer"
                >
                  Select from Master
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="free" id="r2" />
                <Label
                  htmlFor="r2"
                  className="text-sm font-normal cursor-pointer"
                >
                  Free Input
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Event List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Event Master</h3>
              <Button variant="outline" size="sm" className="h-8">
                <Plus className="mr-2 h-3 w-3" />
                Add
              </Button>
            </div>
            <div className="border rounded-md divide-y">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 hover:bg-muted/50 group cursor-move"
                  draggable
                  onDragStart={() => handleEventDragStart(index)}
                  onDragEnter={() => handleEventDragEnter(index)}
                  onDragEnd={handleEventDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div className="flex items-center gap-3 pointer-events-none">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{event.name}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-600 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
