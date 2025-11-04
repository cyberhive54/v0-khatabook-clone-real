"use client";
import { useEffect } from "react";

export default function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // register only on production (optional)
      const isProd = process.env.NODE_ENV === "production";
      if (!isProd) {
        // still ok to register in dev if you want, but it's optional
      }
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          // console.log('SW registered', reg);
        })
        .catch(() => {
          // console.warn('SW registration failed');
        });
    }
  }, []);

  return null;
}
