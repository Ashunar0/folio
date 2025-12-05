"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { createTeamSchema, type CreateTeamFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Plus, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function CreateTeamForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();

  const form = useForm<CreateTeamFormValues>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
    },
  });

  async function onSubmit(data: CreateTeamFormValues) {
    setIsLoading(true);
    try {
      const { data: newTeamId, error } = await supabase.rpc("create_team", {
        name: data.name,
      });

      if (error) {
        throw error;
      }

      toast.success("チームを作成しました");
      router.push(`/${newTeamId}/dashboard`);
      router.refresh();
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error("チームの作成に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className={cn("flex flex-col items-center gap-3", className)}
      {...props}
    >
      <h2 className="text-2xl font-bold">Create Team</h2>
      <p className="text-sm text-muted-foreground">
        Create a new team to start managing expenses.
      </p>
      
      <Card className="w-full">
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
      </Card>

      <Button
        onClick={form.handleSubmit(onSubmit)}
        className="cursor-pointer w-full gap-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus size={16} />
        )}
        Create Team
      </Button>

      <Button
        variant="outline"
        type="button"
        className="cursor-pointer lw-full gap-2"
        onClick={() => router.back()}
        disabled={isLoading}
      >
        <ArrowLeft size={16} />
        Back
      </Button>
    </div>
  );
}
