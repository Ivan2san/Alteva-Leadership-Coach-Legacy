// src/vitals.ts
import { onLCP, onCLS, onINP } from "web-vitals";

const post = (name: string, value: number) =>
  navigator.sendBeacon?.("/vitals", JSON.stringify({ name, value })) ??
  fetch("/vitals", { method: "POST", keepalive: true, body: JSON.stringify({ name, value }) });

onLCP(v => post("LCP", v.value));
onCLS(v => post("CLS", v.value));
onINP(v => post("INP", v.value));