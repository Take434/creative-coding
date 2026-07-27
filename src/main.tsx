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
import { Nochmal } from "@/projects/6_nochmal/nochmal";
import { Wachstum } from "@/projects/7_wachstum/wachstum";
import { Unterbrechung } from "@/projects/8_unterbrechung/unterbrechung";
import { Zusammensetzung } from "@/projects/9_zusammensetzung/zusammensetzung";
import { Disconnect } from "@/projects/10_disconnect/disconnect";
import { Klartext } from "@/projects/11_klartext/klartext";
import { Verfolgt } from "@/projects/12_verfolgt/verfolgt";
import { Spiegelbild } from "@/projects/13_spiegelbild/spiegelbild";

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

const nochmalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "nochmal",
  component: Nochmal,
});

const wachstumRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "wachstum",
  component: Wachstum,
});

const unterbrechungRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "unterbrechung",
  component: Unterbrechung,
});

const zusammensetzungRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "zusammensetzung",
  component: Zusammensetzung,
});

const disconnectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "disconnect",
  component: Disconnect,
});

const klartextRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "klartext",
  component: Klartext,
});

const verfolgtRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "verfolgt",
  component: Verfolgt,
});

const spiegelbildRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "spiegelbild",
  component: Spiegelbild,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  farbfleckRoute,
  aboutRoute,
  unwahrscheinlichRoute,
  loopRoute,
  fokusRoute,
  zeichenRoute,
  nochmalRoute,
  wachstumRoute,
  unterbrechungRoute,
  zusammensetzungRoute,
  disconnectRoute,
  klartextRoute,
  verfolgtRoute,
  spiegelbildRoute,
]);

const hashHistory = createHashHistory();
const router = createRouter({ routeTree, history: hashHistory });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
