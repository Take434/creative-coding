import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
  RouterProvider,
} from "@tanstack/react-router";
import { Layout } from "@/components/layout/layout.tsx";
import { Overview } from "@/components/overview/overview.tsx";
import { Farbfleck } from "@/projects/1_farbfleck/farbfleck";
import { About } from "@/components/about/about";
import { Unwahrscheinlich } from "@/projects/2_unwahrscheinlich/unwahrscheinlich";
import { Loop } from "@/projects/3_loop/loop";
import { Fokus } from "@/projects/4_fokus/fokus";
import { Zeichen } from "@/projects/5_zeichen/zeichen";

const rootRoute = createRootRoute({
  component: Layout,
  notFoundComponent: () => {
    return Navigate({ to: "/" });
  },
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Overview,
});

const farbfleckRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "farbfleck",
  component: Farbfleck,
});

const unwahrscheinlichRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "unwahrscheinlich",
  component: Unwahrscheinlich,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "about",
  component: About,
});

const loopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "loop",
  component: Loop,
});

const fokusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "fokus",
  component: Fokus,
});

const zeichenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "gib-mir-ein-zeichen",
  component: Zeichen,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  farbfleckRoute,
  aboutRoute,
  unwahrscheinlichRoute,
  loopRoute,
  fokusRoute,
  zeichenRoute,
]);

const hashHistory = createHashHistory();
const router = createRouter({ routeTree, history: hashHistory });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
