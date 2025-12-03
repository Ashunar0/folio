"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical, Pencil, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDragReorder } from "@/hooks/use-drag-reorder";
import {
  useCreateEvent,
  useDeleteEvent,
  useEvents,
  useUpdateEvent,
} from "@/lib/api/events";
import { EventItem } from "@/lib/schemas";
import { useTeam } from "@/providers/team-provider";

export default function EventsClient() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [newEventName, setNewEventName] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingDate, setEditingDate] = useState("");

  const eventsQuery = useEvents();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const { teamId, currentTeamRole } = useTeam();

  const canManage = useMemo(
    () => ["admin", "manager"].includes(currentTeamRole ?? ""),
    [currentTeamRole]
  );

  useEffect(() => {
    if (eventsQuery.data) {
      setEvents(eventsQuery.data);
      if (editingId) {
        const target = eventsQuery.data.find((e) => e.id === editingId);
        if (target) {
          setEditingName(target.name);
          setEditingDate(target.date ?? "");
        }
      }
    }
  }, [eventsQuery.data, editingId]);

  const {
    handleDragStart: handleEventDragStart,
    handleDragEnter: handleEventDragEnter,
    handleDragEnd: handleEventDragEnd,
  } = useDragReorder(events, setEvents);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = newEventName.trim();
    if (!name) return;
    try {
      await createEvent.mutateAsync({
        name,
        date: newEventDate ? newEventDate : null,
      });
      setNewEventName("");
      setNewEventDate("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditStart = (event: EventItem) => {
    if (!canManage || event.teamId !== teamId) return;
    setEditingId(event.id);
    setEditingName(event.name);
    setEditingDate(event.date ?? "");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName("");
    setEditingDate("");
  };

  const handleEditSave = async () => {
    if (!editingId) return;
    const name = editingName.trim();
    if (!name) return;
    const target = events.find((e) => e.id === editingId);
    if (!target) return;
    try {
      await updateEvent.mutateAsync({
        id: target.id,
        name,
        date: editingDate || null,
        teamId: target.teamId,
      });
      setEditingId(null);
      setEditingName("");
      setEditingDate("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (event: EventItem) => {
    if (!canManage || event.teamId !== teamId) return;
    const ok = window.confirm(
      `Delete event "${event.name}"? This cannot be undone.`
    );
    if (!ok) return;
    try {
      await deleteEvent.mutateAsync({ id: event.id, teamId: event.teamId });
    } catch (err) {
      console.error(err);
    }
  };

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
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium">Event Master</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => eventsQuery.refetch()}
                  disabled={eventsQuery.isFetching}
                >
                  Refresh
                </Button>
              </div>
            </div>
            <form
              onSubmit={handleSubmit}
              className="grid gap-2 sm:grid-cols-[2fr,1fr,auto] sm:items-center"
            >
              <Input
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                placeholder="Add a new event"
              />
              <Input
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
              />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="h-9 sm:w-24"
                disabled={createEvent.isPending || !newEventName.trim()}
              >
                <Plus className="mr-2 h-3 w-3" />
                Add
              </Button>
            </form>
            <div className="border rounded-md divide-y">
              {eventsQuery.isLoading ? (
                <div className="p-3 text-sm text-muted-foreground">
                  Loading events...
                </div>
              ) : events.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">
                  No events found.
                </div>
              ) : (
                events.map((event, index) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 hover:bg-muted/50 group"
                    draggable
                    onDragStart={() => handleEventDragStart(index)}
                    onDragEnter={() => handleEventDragEnter(index)}
                    onDragEnd={handleEventDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      {editingId === event.id ? (
                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="h-8"
                            autoFocus
                          />
                          <Input
                            type="date"
                            value={editingDate}
                            onChange={(e) => setEditingDate(e.target.value)}
                            className="h-8 sm:w-44"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          <span className="text-sm">{event.name}</span>
                          {event.date ? (
                            <span className="text-xs text-muted-foreground">
                              {event.date}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>
                    {editingId === event.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={handleEditSave}
                          disabled={updateEvent.isPending}
                        >
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={handleEditCancel}
                          disabled={updateEvent.isPending}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleEditStart(event)}
                          disabled={!canManage || event.teamId !== teamId}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-600 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(event)}
                          disabled={!canManage || event.teamId !== teamId}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
