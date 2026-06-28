"use server";

import { redirect } from "next/navigation";
import { createProduct } from "@/lib/actions/business";

function getText(formData: FormData, key: string, maxLength: number): string | undefined {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

export async function createDashboardProduct(formData: FormData) {
  const result = await createProduct({
    description: getText(formData, "description", 4000),
    summary: getText(formData, "summary", 1000),
    title: getText(formData, "title", 240) ?? "",
  });

  if (!result.ok) {
    redirect("/dashboard/products?error=create_failed");
  }

  redirect("/dashboard/products?result=created");
}
