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
import { Farbfleck } from "@/projects/farbfleck/farbfleck.tsx";
import { About } from "@/components/about/about";
import { Unwahrscheinlich } from "@/projects/unwahrscheinlich/unwahrscheinlich";

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

const routeTree = rootRoute.addChildren([
  indexRoute,
  farbfleckRoute,
  aboutRoute,
  unwahrscheinlichRoute,
]);
const hashHistory = createHashHistory();
const router = createRouter({ routeTree, history: hashHistory });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
