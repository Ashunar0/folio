"use client";

import { useEffect, useMemo, useState } from "react";

import { GripVertical, Pencil, Trash, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useDragReorder } from "@/hooks/use-drag-reorder";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useReorderCategories,
  useUpdateCategory,
} from "@/lib/api/categories";
import { Category } from "@/lib/schemas";
import { useTeam } from "@/providers/team-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { Inbox } from "lucide-react";

export default function CategoriesClient() {
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newIncomeName, setNewIncomeName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const categoriesQuery = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const reorderCategories = useReorderCategories();
  const { teamId, currentTeamRole } = useTeam();

  const canManage = useMemo(
    () => ["admin", "manager"].includes(currentTeamRole ?? ""),
    [currentTeamRole]
  );

  useEffect(() => {
    if (!categoriesQuery.data) return;
    const timeout = window.setTimeout(() => {
      setExpenseCategories(
        categoriesQuery.data.filter((c) => c.type !== "income")
      );
      setIncomeCategories(
        categoriesQuery.data.filter((c) => c.type === "income")
      );
      if (editingId) {
        const target = categoriesQuery.data.find((c) => c.id === editingId);
        if (target) setEditingName(target.name);
      }
    }, 0);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [categoriesQuery.data, editingId]);

  const {
    handleDragStart: handleExpenseDragStart,
    handleDragEnter: handleExpenseDragEnter,
    handleDragEnd: handleExpenseDragEnd,
  } = useDragReorder(expenseCategories, setExpenseCategories, {
    onReorder: async (next) => {
      if (!teamId) return;
      const payload: {
        id: string;
        team_id: string;
        sort_order: number;
        type: "expense" | "income";
        name: string;
      }[] = [];
      let order = 0;
      next.forEach((cat) => {
        if (cat.teamId === teamId) {
          payload.push({
            id: cat.id,
            team_id: cat.teamId!,
            sort_order: order,
            type: cat.type === "income" ? "income" : "expense",
            name: cat.name,
          });
          order += 1;
        }
      });
      if (payload.length) {
        try {
          await reorderCategories.mutateAsync(payload);
          await categoriesQuery.refetch();
        } catch (err) {
          console.error(err);
        }
      }
    },
  });

  const {
    handleDragStart: handleIncomeDragStart,
    handleDragEnter: handleIncomeDragEnter,
    handleDragEnd: handleIncomeDragEnd,
  } = useDragReorder(incomeCategories, setIncomeCategories, {
    onReorder: async (next) => {
      if (!teamId) return;
      const payload: {
        id: string;
        team_id: string;
        sort_order: number;
        type: "expense" | "income";
        name: string;
      }[] = [];
      let order = 0;
      next.forEach((cat) => {
        if (cat.teamId === teamId) {
          payload.push({
            id: cat.id,
            team_id: cat.teamId!,
            sort_order: order,
            type: cat.type === "income" ? "income" : "expense",
            name: cat.name,
          });
          order += 1;
        }
      });
      if (payload.length) {
        try {
          await reorderCategories.mutateAsync(payload);
          await categoriesQuery.refetch();
        } catch (err) {
          console.error(err);
        }
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formType =
      (e.currentTarget.dataset.type as "expense" | "income") ?? "expense";
    const name =
      formType === "income" ? newIncomeName.trim() : newExpenseName.trim();
    if (!name) return;
    try {
      await createCategory.mutateAsync({ name, type: formType });
      if (formType === "income") {
        setNewIncomeName("");
      } else {
        setNewExpenseName("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditStart = (category: Category) => {
    if (!canManage || !category.teamId || category.teamId !== teamId) return;
    setEditingId(category.id);
    setEditingName(category.name);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleEditSave = async () => {
    if (!editingId) return;
    const name = editingName.trim();
    if (!name) return;
    const target =
      expenseCategories.find((c) => c.id === editingId) ??
      incomeCategories.find((c) => c.id === editingId);
    if (!target) return;
    try {
      await updateCategory.mutateAsync({
        id: target.id,
        name,
        teamId: target.teamId,
        type: target.type === "income" ? "income" : "expense",
      });
      setEditingId(null);
      setEditingName("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!canManage || !category.teamId || category.teamId !== teamId) return;
    const ok = window.confirm(
      `Delete category "${category.name}"? This cannot be undone.`
    );
    if (!ok) return;
    try {
      await deleteCategory.mutateAsync({
        id: category.id,
        teamId: category.teamId,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const renderList = (
    list: Category[],
    type: "expense" | "income",
    handlers: {
      dragStart: (index: number) => void;
      dragEnter: (index: number) => void;
      dragEnd: () => void;
    }
  ) => (
    <div className="border rounded-md divide-y">
      {categoriesQuery.isLoading ? (
        <div className="p-3 text-sm text-muted-foreground">
          Loading categories...
        </div>
      ) : list.length === 0 ? (
        <EmptyState icon={<Inbox size={24} />} title="No categories found" />
      ) : (
        list.map((category, index) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-3 hover:bg-muted/50 group"
            draggable={
              !!category.teamId && category.teamId === teamId && canManage
            }
            onDragStart={() => handlers.dragStart(index)}
            onDragEnter={() => handlers.dragEnter(index)}
            onDragEnd={handlers.dragEnd}
            onDragOver={(e) => e.preventDefault()}
          >
            <div className="flex items-center gap-3 flex-1">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              {editingId === category.id ? (
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="h-8"
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm">{category.name}</span>
                  {!category.teamId ? (
                    <span className="text-[11px] text-muted-foreground px-2 py-0.5 border rounded">
                      Shared
                    </span>
                  ) : null}
                </div>
              )}
            </div>
            {editingId === category.id ? (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={handleEditSave}
                  disabled={updateCategory.isPending}
                >
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  onClick={handleEditCancel}
                  disabled={updateCategory.isPending}
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
                  onClick={() => handleEditStart(category)}
                  disabled={
                    !canManage || !category.teamId || category.teamId !== teamId
                  }
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-600 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(category)}
                  disabled={
                    !canManage || !category.teamId || category.teamId !== teamId
                  }
                >
                  <Trash className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight">Category Management</h1>
      <Card className="py-0 rounded-md">
        <CardContent className="p-6 space-y-6">
          {/* Expense Categories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium">Expense Categories</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => categoriesQuery.refetch()}
                  disabled={categoriesQuery.isFetching}
                >
                  Refresh
                </Button>
              </div>
            </div>
            <form
              onSubmit={handleSubmit}
              data-type="expense"
              className="flex flex-col sm:flex-row gap-2"
            >
              <Input
                value={newExpenseName}
                onChange={(e) => setNewExpenseName(e.target.value)}
                placeholder="Add a new category"
              />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="h-9 sm:w-24"
                disabled={createCategory.isPending || !newExpenseName.trim()}
              >
                <Plus className="mr-2 h-3 w-3" />
                Add
              </Button>
            </form>
            {renderList(expenseCategories, "expense", {
              dragStart: handleExpenseDragStart,
              dragEnter: handleExpenseDragEnter,
              dragEnd: handleExpenseDragEnd,
            })}
          </div>

          <Separator />

          {/* Income Categories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium">Income Categories</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => categoriesQuery.refetch()}
                  disabled={categoriesQuery.isFetching}
                >
                  Refresh
                </Button>
              </div>
            </div>
            <form
              onSubmit={handleSubmit}
              data-type="income"
              className="flex flex-col sm:flex-row gap-2"
            >
              <Input
                value={newIncomeName}
                onChange={(e) => setNewIncomeName(e.target.value)}
                placeholder="Add a new income category"
              />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="h-9 sm:w-28"
                disabled={createCategory.isPending || !newIncomeName.trim()}
              >
                <Plus className="mr-2 h-3 w-3" />
                Add
              </Button>
            </form>
            {renderList(incomeCategories, "income", {
              dragStart: handleIncomeDragStart,
              dragEnter: handleIncomeDragEnter,
              dragEnd: handleIncomeDragEnd,
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
