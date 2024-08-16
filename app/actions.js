"use server";

import { revalidatePath } from "next/cache";

export async function refreshInspectionData(slug) {
  revalidatePath(`/inspections/${slug}`, "page");
}

export async function refreshTaskData() {
  revalidatePath(`/tasks`, "page");
}
