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
    { id: "neutral", name: "Neutral", color: "#0F172A" },
    { id: "blue", name: "Blue", color: "#3B82F6" },
    { id: "emerald", name: "Emerald", color: "#10B981" },
    { id: "teal", name: "Teal", color: "#14B8A6" },
    { id: "cyan", name: "Cyan", color: "#06B6D4" },
    { id: "lime", name: "Lime", color: "#84CC16" },
    { id: "amber", name: "Amber", color: "#F59E0B" },
    { id: "purple", name: "Purple", color: "#8B5CF6" },
    { id: "rose", name: "Rose", color: "#F43F5E" },
    { id: "slate", name: "Slate", color: "#64748B" },
    { id: "stone", name: "Stone", color: "#78716C" },
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

  const [accentColor, setAccentColor] = useState(() => {
    // Initialize from localStorage when available to avoid extra renders after mount
    if (typeof window === "undefined") return "neutral";
    return localStorage.getItem("accent-color") ?? "neutral";
  });
  const { theme, setTheme } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [defaultHomeView, setDefaultHomeView] = useState("dashboard");
  const [fontSize, setFontSize] = useState("default");
  const [language, setLanguage] = useState("ja");

  // Sync accent color changes to DOM/localStorage without extra state updates
  useEffect(() => {
    if (accentColor === "neutral") {
      document.documentElement.removeAttribute("data-accent");
      localStorage.removeItem("accent-color");
      return;
    }
    document.documentElement.setAttribute("data-accent", accentColor);
    localStorage.setItem("accent-color", accentColor);
  }, [accentColor]);

  // Apply accent color change
  const handleAccentChange = (newAccent: string) => {
    setAccentColor(newAccent);
  };

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
                  const isSelected = theme === mode.id;
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
              <Select value={accentColor} onValueChange={handleAccentChange}>
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((themeItem) => (
                    <SelectItem key={themeItem.id} value={themeItem.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full border border-gray-200"
                          style={{ backgroundColor: themeItem.color }}
                        />
                        <span>{themeItem.name}</span>
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
                {themes.map((themeItem) => {
                  const isSelected = accentColor === themeItem.id;
                  return (
                    <button
                      key={themeItem.id}
                      onClick={() => handleAccentChange(themeItem.id)}
                      className={cn(
                        "h-5 w-5 rounded-full transition-all flex items-center justify-center cursor-pointer",
                        !isSelected && "hover:scale-110"
                      )}
                      style={{
                        backgroundColor: themeItem.color,
                        boxShadow: isSelected
                          ? `0 0 0 2px var(--background), 0 0 0 4px ${themeItem.color}`
                          : undefined,
                      }}
                      title={themeItem.name}
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
