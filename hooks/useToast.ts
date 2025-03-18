"use client";

import { toast as SonnerToast  } from "sonner"; // Rename import to avoid conflict

type ToastVariant =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "destructive";

interface ToastOptions {
  variant?: ToastVariant;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function useToast() {
  const toast = (message: string, options?: ToastOptions) => {
    switch (options?.variant) {
      case "destructive":
        SonnerToast.error(message, {
          description: options?.description,
          action: options?.action
            ? {
                label: options.action.label,
                onClick: options.action.onClick,
              }
            : undefined,
        });
        break;
      case "success":
        SonnerToast.success(message, {
          description: options?.description,
          action: options?.action
            ? {
                label: options.action.label,
                onClick: options.action.onClick,
              }
            : undefined,
        });
        break;
      case "info":
        SonnerToast.info(message, {
          description: options?.description,
          action: options?.action
            ? {
                label: options.action.label,
                onClick: options.action.onClick,
              }
            : undefined,
        });
        break;
      default:
        SonnerToast(message, {
          description: options?.description,
          action: options?.action
            ? {
                label: options.action.label,
                onClick: options.action.onClick,
              }
            : undefined,
        });
        break;
    }
  };

  return { toast };
}