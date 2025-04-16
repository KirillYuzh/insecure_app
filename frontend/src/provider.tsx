import type { NavigateOptions } from "react-router-dom";
import {ToastProvider} from "@heroui/toast";
import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import { useState } from "react";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [placement, setPlacement] = useState("top-right");
  setPlacement("top-right")

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <ToastProvider placement={placement} toastOffset={placement.includes("top") ? 60 : 0} />
      {children}
    </HeroUIProvider>
  );
}
