"use client";

import { useState } from "react";

import { GripVertical, Pencil, Trash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useDragReorder } from "@/hooks/use-drag-reorder";

export default function CategoriesClient() {
  const [expenseCategories, setExpenseCategories] = useState([
    { id: 1, name: "Travel" },
    { id: 2, name: "Meals" },
    { id: 3, name: "Software" },
    { id: 4, name: "Office Supplies" },
  ]);

  const {
    handleDragStart: handleCategoryDragStart,
    handleDragEnter: handleCategoryDragEnter,
    handleDragEnd: handleCategoryDragEnd,
  } = useDragReorder(expenseCategories, setExpenseCategories);

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold tracking-tight">Category Management</h1>
      <Card className="py-0 rounded-md">
        <CardContent className="p-6 space-y-6">
          {/* Expense Categories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Expense Categories</h3>
              <Button variant="outline" size="sm" className="h-8">
                <Plus className="mr-2 h-3 w-3" />
                Add
              </Button>
            </div>
            <div className="border rounded-md divide-y">
              {expenseCategories.map((category, index) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 hover:bg-muted/50 group cursor-move"
                  draggable
                  onDragStart={() => handleCategoryDragStart(index)}
                  onDragEnter={() => handleCategoryDragEnter(index)}
                  onDragEnd={handleCategoryDragEnd}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <div className="flex items-center gap-3 pointer-events-none">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{category.name}</span>
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
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Reset to defaults
              </Button>
            </div>
          </div>

          <Separator />

          {/* Income Categories (Mock) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Income Categories</h3>
              <Button variant="outline" size="sm" className="h-8">
                <Plus className="mr-2 h-3 w-3" />
                Add
              </Button>
            </div>
            <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-md text-center border border-dashed">
              No income categories configured.
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
