"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function login(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  // Use the server-side client to check the database
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("auth_users")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .single()

  if (error || !data) {
    return { error: "Invalid username or password" }
  }

  const cookieStore = await cookies()
  cookieStore.set("is_authenticated", "true", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })

  redirect("/")
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("is_authenticated")
  redirect("/auth")
}
