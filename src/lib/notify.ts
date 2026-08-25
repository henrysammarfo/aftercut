"use client";

import { toast } from "sonner";

export function notifySuccess(message: string) {
  toast.success(message);
}

export function notifyInfo(message: string) {
  toast(message);
}

export function notifyWarn(message: string) {
  toast.warning(message);
}

export function notifyError(message: string) {
  toast.error(message);
}

export function notifyBusy(message: string, id = "aftercut-busy") {
  toast.loading(message, { id });
  return id;
}

export function notifyIdle(id = "aftercut-busy") {
  toast.dismiss(id);
}
