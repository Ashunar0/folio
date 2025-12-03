"use client";

import { useEffect, useMemo, useState } from "react";

import { GripVertical, Pencil, Trash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDragReorder } from "@/hooks/use-drag-reorder";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from "@/lib/api/categories";
import { Category } from "@/lib/schemas";
import { useTeam } from "@/providers/team-provider";

export default function CategoriesClient() {
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const categoriesQuery = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const { teamId, currentTeamRole } = useTeam();

  const canManage = useMemo(
    () => ["admin", "manager"].includes(currentTeamRole ?? ""),
    [currentTeamRole]
  );

  useEffect(() => {
    if (categoriesQuery.data) {
      setExpenseCategories(categoriesQuery.data);
      if (editingId) {
        const target = categoriesQuery.data.find((c) => c.id === editingId);
        if (target) setEditingName(target.name);
      }
    }
  }, [categoriesQuery.data, editingId]);

  const {
    handleDragStart: handleCategoryDragStart,
    handleDragEnter: handleCategoryDragEnter,
    handleDragEnd: handleCategoryDragEnd,
  } = useDragReorder(expenseCategories, setExpenseCategories);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;
    try {
      await createCategory.mutateAsync({ name });
      setNewCategoryName("");
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
    const target = expenseCategories.find((c) => c.id === editingId);
    if (!target) return;
    try {
      await updateCategory.mutateAsync({
        id: target.id,
        name,
        teamId: target.teamId,
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
              className="flex flex-col sm:flex-row gap-2"
            >
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Add a new category"
              />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="h-9 sm:w-24"
                disabled={createCategory.isPending || !newCategoryName.trim()}
              >
                <Plus className="mr-2 h-3 w-3" />
                Add
              </Button>
            </form>
            <div className="border rounded-md divide-y">
              {categoriesQuery.isLoading ? (
                <div className="p-3 text-sm text-muted-foreground">
                  Loading categories...
                </div>
              ) : expenseCategories.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">
                  No categories found.
                </div>
              ) : (
                expenseCategories.map((category, index) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 hover:bg-muted/50 group"
                    draggable
                    onDragStart={() => handleCategoryDragStart(index)}
                    onDragEnter={() => handleCategoryDragEnter(index)}
                    onDragEnd={handleCategoryDragEnd}
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
                            !canManage ||
                            !category.teamId ||
                            category.teamId !== teamId
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
                            !canManage ||
                            !category.teamId ||
                            category.teamId !== teamId
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
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
