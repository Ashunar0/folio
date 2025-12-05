"use client"

import {
  CircleCheckBigIcon,
  CircleFadingArrowUpIcon,
  Loader2Icon,
  OctagonAlertIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckBigIcon className="size-4" />,
        info: <CircleFadingArrowUpIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonAlertIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "border shadow-lg",
          success:
            "!bg-emerald-50 dark:!bg-emerald-950 !text-emerald-600 dark:!text-emerald-400 !border-emerald-500/50 dark:!border-emerald-600/50",
          error:
            "!bg-red-50 dark:!bg-red-950 !text-red-600 dark:!text-red-400 !border-red-500/50 dark:!border-red-600/50",
          warning:
            "!bg-amber-50 dark:!bg-amber-950 !text-amber-600 dark:!text-amber-400 !border-amber-500/50 dark:!border-amber-600/50",
          info: "!bg-blue-50 dark:!bg-blue-950 !text-blue-600 dark:!text-blue-400 !border-blue-500/50 dark:!border-blue-600/50",
          description: "!text-inherit",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

