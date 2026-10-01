"use client";

import { useEffect, useState } from "react";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;

// Whether this browser is logged in to the Studio (mounted at /studio, so it
// shares this site's origin). The Studio keeps its session either as a token
// in localStorage or as a cookie on the Sanity API — the latter only shows
// up by asking the API who we are. False until known, and on any failure.
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
