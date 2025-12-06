"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { IconPencil } from "@/lib/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { User, userSchema } from "@/lib/schemas";
import { useUpdateUserRole } from "@/lib/api/users";

type UserSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  defaultEditMode?: boolean;
  canEdit?: boolean;
};

export function UserSheet({
  open,
  onOpenChange,
  user,
  defaultEditMode = false,
  canEdit = true,
}: UserSheetProps) {
  const [isEditMode, setIsEditMode] = useState(defaultEditMode && canEdit);
  const [saveError, setSaveError] = useState<string | null>(null);
  const updateUserRole = useUpdateUserRole();

  const form = useForm<User>({
    resolver: zodResolver(userSchema) as Resolver<User>,
    defaultValues: {
      id: "",
      name: "",
      email: "",
      role: "member",
      status: "active",
      joinedAt: "",
      lastLogin: null,
    },
  });

  useEffect(() => {
    if (!open) return;
    const timeout = window.setTimeout(() => {
      setIsEditMode(defaultEditMode && canEdit);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [open, defaultEditMode, canEdit]);

  useEffect(() => {
    if (user) {
      form.reset(user);
    }
  }, [user, form]);

  const onSave = async (data: User) => {
    setSaveError(null);
    try {
      await updateUserRole.mutateAsync({ userId: data.id, role: data.role });
      setIsEditMode(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "保存に失敗しました";
      setSaveError(message);
    }
  };

  if (!user) return null;

  return (
    <Sheet
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          setIsEditMode(false);
          form.reset();
        }
        onOpenChange(open);
      }}
    >
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>ユーザー詳細</SheetTitle>
          <SheetDescription>
            ユーザー情報の確認・編集を行います。
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-4 p-4 text-sm">
          <div className="flex justify-end">
            {!isEditMode && canEdit && (
              <Button onClick={() => setIsEditMode(true)}>
                <IconPencil size={16} />
                <span>Edit</span>
              </Button>
            )}
          </div>

          {saveError && <div className="text-sm text-red-600">{saveError}</div>}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSave)} className="grid gap-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <div className="text-sm pt-1">{field.value}</div>{" "}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <div className="text-sm pt-1">{field.value}</div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    {isEditMode ? (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-sm pt-1 capitalize">
                        {field.value}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    {isEditMode ? (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="invited">Invited</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-sm pt-1 capitalize">
                        {field.value}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Readonly Info */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t mt-4">
                <div>
                  <div className="text-xs text-muted-foreground">Joined</div>
                  <div className="text-sm">{form.getValues("joinedAt")}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    Last Login
                  </div>
                  <div className="text-sm">
                    {form.getValues("lastLogin") ?? "-"}
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>

        <SheetFooter>
          {isEditMode ? (
            <>
              <Button onClick={form.handleSubmit(onSave)}>Save</Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditMode(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
