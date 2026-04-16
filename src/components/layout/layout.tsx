import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Link, Outlet } from "@tanstack/react-router";
import styx from "../../assets/ProjectPreviewCovers/styx-cover.png";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/states";

export function Layout() {
  const toggle = useTheme((state) => state.toggle);

  return (
    <>
      <NavigationMenu className="max-w-full pe-10 py-2 bg-primary-foreground">
        <NavigationMenuList className="justify-start">
          <NavigationMenuItem>
            <NavigationMenuLink render={<img src={styx} className="h-10" />} />
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              render={<Link to={"/projects"}>projects</Link>}
            />
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink render={<Link to={"/about"}>about</Link>} />
          </NavigationMenuItem>
          <NavigationMenuItem className="ml-auto">
            <NavigationMenuLink
              render={<Button onClick={toggle}>Dark</Button>}
            />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      <Outlet />
    </>
  );
}
