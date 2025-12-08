"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Palette, Sun, Moon, Monitor, Check, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function AppearanceClient() {
  const themes = [
    { name: "Neutral", color: "#0F172A" },
    { name: "Blue", color: "#3B82F6" },
    { name: "Emerald", color: "#10B981" },
    { name: "Amber", color: "#F59E0B" },
    { name: "Purple", color: "#8B5CF6" },
    { name: "Rose", color: "#F43F5E" },
    { name: "Slate", color: "#64748B" },
  ];

  const colorModes = [
    { id: "light", name: "Light", icon: Sun },
    { id: "dark", name: "Dark", icon: Moon },
    { id: "system", name: "System", icon: Monitor },
  ];

  const homeViews = [
    { id: "dashboard", name: "Dashboard" },
    { id: "expense-form", name: "Expense Form" },
    { id: "expense-list", name: "Expense List" },
    { id: "transactions", name: "Transactions" },
  ];

  const fontSizes = [
    { id: "small", name: "Small" },
    { id: "default", name: "Default" },
    { id: "large", name: "Large" },
  ];

  const languages = [
    { id: "ja", name: "日本語" },
    { id: "en", name: "English" },
  ];

  const [selectedTheme, setSelectedTheme] = useState("Neutral");
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [defaultHomeView, setDefaultHomeView] = useState("dashboard");
  const [fontSize, setFontSize] = useState("default");
  const [language, setLanguage] = useState("ja");

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="w-full max-w-3xl space-y-10">
      {/* Section 1: カラーモード */}
      <section className="space-y-4">
        <h2 className="text-lg flex items-center gap-2">
          <Sun size={18} />
          Color Mode
        </h2>
        <Card className="py-0 rounded-md">
          <CardContent className="p-0">
            {/* Color Mode Selection */}
            <div className="flex flex-col py-4 px-6 gap-4">
              <div className="space-y-0.5">
                <div className="text-sm">Appearance</div>
                <div className="text-xs text-muted-foreground">
                  Select your preferred color mode
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {colorModes.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = mounted && theme === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setTheme(mode.id)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/50"
                      )}
                    >
                      <Icon
                        size={24}
                        className={cn(
                          isSelected
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      />
                      <span
                        className={cn(
                          "text-sm font-medium",
                          isSelected
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      >
                        {mode.name}
                      </span>
                      {isSelected && (
                        <Check size={16} className="text-primary absolute top-2 right-2" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 2: テーマカラー */}
      <section className="space-y-4">
        <h2 className="text-lg flex items-center gap-2">
          <Palette size={18} />
          Theme
        </h2>
        <Card className="py-0 rounded-md">
          <CardContent className="p-0">
            {/* Theme Color Selection */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Accent Color</div>
                <div className="text-xs text-muted-foreground">
                  Select your preferred accent color
                </div>
              </div>
              <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((theme) => (
                    <SelectItem key={theme.name} value={theme.name}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full border border-gray-200"
                          style={{ backgroundColor: theme.color }}
                        />
                        <span>{theme.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Separator />

            {/* Theme Color Preview */}
            <div className="flex flex-col py-4 px-6 gap-4">
              <div className="space-y-0.5">
                <div className="text-sm">Color Preview</div>
                <div className="text-xs text-muted-foreground">
                  Preview of available accent colors
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {themes.map((theme) => {
                  const isSelected = selectedTheme === theme.name;
                  return (
                    <button
                      key={theme.name}
                      onClick={() => setSelectedTheme(theme.name)}
                      className={cn(
                        "h-5 w-5 rounded-full transition-all flex items-center justify-center cursor-pointer",
                        !isSelected && "hover:scale-110"
                      )}
                      style={{
                        backgroundColor: theme.color,
                        boxShadow: isSelected
                          ? `0 0 0 2px var(--background), 0 0 0 4px ${theme.color}`
                          : undefined,
                      }}
                      title={theme.name}
                    >
                      {isSelected && (
                        <Check size={16} className="text-white drop-shadow-md" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 3: アクセシビリティ */}
      <section className="space-y-4">
        <h2 className="text-lg flex items-center gap-2">
          <Monitor size={18} />
          Accessibility
        </h2>
        <Card className="py-0 rounded-md">
          <CardContent className="p-0">
            {/* Default Home View */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Default home view</div>
                <div className="text-xs text-muted-foreground">
                  Which view is opened when you open up the app
                </div>
              </div>
              <Select value={defaultHomeView} onValueChange={setDefaultHomeView}>
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue placeholder="Select view" />
                </SelectTrigger>
                <SelectContent>
                  {homeViews.map((view) => (
                    <SelectItem key={view.id} value={view.id}>
                      {view.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Separator />

            {/* Font Size */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Font size</div>
                <div className="text-xs text-muted-foreground">
                  Adjust the size of text across the app
                </div>
              </div>
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {fontSizes.map((size) => (
                    <SelectItem key={size.id} value={size.id}>
                      {size.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Separator />

            {/* Reduce Motion */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Reduce Motion</div>
                <div className="text-xs text-muted-foreground">
                  Disable animations and transitions
                </div>
              </div>
              <Switch
                checked={reduceMotion}
                onCheckedChange={setReduceMotion}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 4: Language & Region */}
      <section className="space-y-4">
        <h2 className="text-lg flex items-center gap-2">
          <Globe size={18} />
          Language & Region
        </h2>
        <Card className="py-0 rounded-md">
          <CardContent className="p-0">
            {/* Language */}
            <div className="flex items-center justify-between py-4 px-6">
              <div className="space-y-0.5">
                <div className="text-sm">Language</div>
                <div className="text-xs text-muted-foreground">
                  Select your preferred language
                </div>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.id} value={lang.id}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
