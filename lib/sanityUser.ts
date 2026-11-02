"use client";

import { useEffect, useState } from "react";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;

export function useSanityLoggedIn() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let token: string | undefined;
    try {
      const stored = window.localStorage.getItem(
        `__studio_auth_token_${projectId}`,
      );
      token = stored ? JSON.parse(stored)?.token : undefined;
    } catch {}

    fetch(`https://${projectId}.api.sanity.io/v2024-01-01/users/me`, {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        if (!cancelled) setLoggedIn(Boolean(user?.id));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return loggedIn;
}
