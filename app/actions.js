"use server";

import { revalidatePath } from "next/cache";

export async function refreshInspectionData(slug) {
  revalidatePath(`/inspections/${slug}`, "page");
}

export async function refreshSchedulenData(slug) {
  revalidatePath(`/schedules/${slug}`, "page");
}

export async function refreshSchedulenQueryData(slug, searchQuery) {
  revalidatePath(`/schedules/${slug}?searchQuery=${searchQuery}`, "page");
}

export async function refreshTaskData() {
  revalidatePath(`/tasks`, "page");
}
