"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import dbLib from "@/lib/db";
import entityLib from "@/lib/entity-configs";

const { getDb, getDbErrorMessage } = dbLib;
const { getEntityConfig } = entityLib;

function buildRedirectUrl(pathname, status, message) {
  const searchParams = new URLSearchParams({
    status,
    message
  });

  return `${pathname}?${searchParams.toString()}`;
}

function revalidateCommonPaths(pathname) {
  revalidatePath("/");
  revalidatePath("/reports");
  revalidatePath(pathname);
}

export async function createRecordAction(formData) {
  const entityKey = String(formData.get("entityKey") || "");
  const redirectPath = String(formData.get("redirectPath") || "/");
  const config = getEntityConfig(entityKey);

  if (!config) {
    redirect(buildRedirectUrl("/", "error", "Unknown entity configuration."));
  }

  const payload = Object.fromEntries(formData.entries());

  try {
    const db = await getDb();
    const message = await config.create(db, payload);
    revalidateCommonPaths(redirectPath);
    redirect(buildRedirectUrl(redirectPath, "success", message));
  } catch (error) {
    redirect(buildRedirectUrl(redirectPath, "error", getDbErrorMessage(error)));
  }
}

export async function updateRecordAction(formData) {
  const entityKey = String(formData.get("entityKey") || "");
  const redirectPath = String(formData.get("redirectPath") || "/");
  const config = getEntityConfig(entityKey);

  if (!config) {
    redirect(buildRedirectUrl("/", "error", "Unknown entity configuration."));
  }

  const payload = Object.fromEntries(formData.entries());

  try {
    const db = await getDb();
    const message = await config.update(db, payload);
    revalidateCommonPaths(redirectPath);
    redirect(buildRedirectUrl(redirectPath, "success", message));
  } catch (error) {
    redirect(buildRedirectUrl(redirectPath, "error", getDbErrorMessage(error)));
  }
}

export async function deleteRecordAction(formData) {
  const entityKey = String(formData.get("entityKey") || "");
  const redirectPath = String(formData.get("redirectPath") || "/");
  const config = getEntityConfig(entityKey);

  if (!config) {
    redirect(buildRedirectUrl("/", "error", "Unknown entity configuration."));
  }

  const payload = Object.fromEntries(formData.entries());

  try {
    const db = await getDb();
    const message = await config.remove(db, payload);
    revalidateCommonPaths(redirectPath);
    redirect(buildRedirectUrl(redirectPath, "success", message));
  } catch (error) {
    redirect(buildRedirectUrl(redirectPath, "error", getDbErrorMessage(error)));
  }
}
