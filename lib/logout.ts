/** Client-side logout: clears the session cookie on the server, then does a full page load of /login. */
export async function logout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
  } finally {
    // Full navigation (not router.push) so no cached logged-in state survives.
    window.location.href = "/login";
  }
}
