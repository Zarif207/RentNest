"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register once; import gsap, ScrollTrigger and useGSAP from here, never directly.
// useGSAP reverts every tween and ScrollTrigger it created on unmount.
gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };
