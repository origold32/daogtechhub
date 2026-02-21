"use client";

import * as React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@mantine/hooks";
import TitleCatption, { TitleCaptionProps } from "./title-caption";

type DrawerData = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  content?: ((closeDrawer: () => void) => React.ReactNode) | React.ReactNode;
  className?: string;
  direction?: "top" | "bottom" | "right" | "left";
  showClose?: boolean;
  showHandle?: boolean;
  modalContentClassName?: string;
};
type ContextProps = {
  openDrawer: (data: DrawerData) => void;
  closeDrawer: () => void;
};
type DrawerProviderProps = {
  children: React.ReactNode;
};

const DrawerContext = React.createContext<ContextProps | null>(null);
const DrawerProvider = ({ children }: DrawerProviderProps) => {
  const isMobile = useMediaQuery("(max-width:640px)");
  const [drawerData, setDrawerData] = React.useState<DrawerData | undefined>();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const modalContentClassName = drawerData?.modalContentClassName;
  const openFrom = isMobile ? "bottom" : drawerData?.direction ?? "right";
  const showHandle: boolean = isMobile
    ? drawerData?.showHandle ?? true
    : drawerData?.showHandle ?? false;
  const showClose: boolean = drawerData?.showClose ?? false;
  const className = drawerData?.className ?? "";

  const openDrawer = (data?: DrawerData) => {
    setDrawerData(data);
    setIsOpen(true);
  };

  const closeDrawer = () => {
    setIsOpen(false);
    setDrawerData({
      direction: openFrom,
      modalContentClassName: modalContentClassName,
    });
  };

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer }}>
      <Drawer
        open={isOpen}
        onOpenChange={(open) => setIsOpen(open)}
        onClose={() => closeDrawer()}
        shouldScaleBackground={true}
        direction={openFrom}
      >
        <DrawerContent
          className={cn(
            !modalContentClassName
              ? "flex flex-col  max-h-[87vh] sm:max-h-full w-auto sm:max-w-[500px] fixed z-50 rounded-t-xl sm:rounded-none"
              : modalContentClassName,
            openFrom == "right" && " !right-0",
            openFrom == "top" && "!top-0",
            openFrom == "left" && "!left-0",
            openFrom == "bottom" && "!bottom-0"
          )}
        >
          {showClose ? (
            <DrawerClose asChild>
              <Button
                onClick={() => setIsOpen(false)}
                variant={"ghost"}
                size={"icon-sm"}
                className=" absolute right-4 top-4 text-muted-foreground"
              >
                <X size={16} />
              </Button>
            </DrawerClose>
          ) : null}
          {showHandle ? (
            <div
              className={cn(
                " rounded-full bg-muted",
                openFrom == "right" &&
                  "absolute left-4 top-1/2 -translate-y-1/2 w-2 h-[100px]",
                openFrom == "left" &&
                  "absolute right-4 top-1/2 -translate-y-1/2 w-2 h-[100px]",
                openFrom == "top" &&
                  "absolute mx-auto bottom-4 inset-x-0 h-2 w-[100px]",
                openFrom == "bottom" &&
                  "absolute mx-auto top-4 inset-x-0 h-2 w-[100px]"
              )}
            />
          ) : null}
          <div
            className={cn(
              "p-6 lg:p-10 overflow-y-auto h-full space-y-2",
              className
            )}
          >
            {drawerData?.title || drawerData?.description ? (
              <DrawerHeader className="p-0">
                {drawerData?.title ? (
                  <DrawerTitle>{drawerData.title}</DrawerTitle>
                ) : null}
                {drawerData?.description ? (
                  <DrawerDescription>
                    {drawerData.description}
                  </DrawerDescription>
                ) : null}
              </DrawerHeader>
            ) : null}
            {drawerData
              ? typeof drawerData.content == "function"
                ? drawerData.content(closeDrawer)
                : drawerData.content
              : null}
          </div>
        </DrawerContent>
      </Drawer>
      {children}
    </DrawerContext.Provider>
  );
};

const useDrawer = (modalConfig?: DrawerData) => {
  const context = React.useContext(DrawerContext);

  if (!context) {
    throw "useDrawer must be used withing a modal context provider";
  }
  const openDrawer = (extraConfig?: DrawerData) => {
    context.openDrawer({ ...modalConfig, ...extraConfig });
  };

  const closeDrawer = () => {
    context.closeDrawer();
  };

  return { openDrawer, closeDrawer };
};

const DrawerTitleCaption = (props: TitleCaptionProps) => {
  return (
    <TitleCatption
      className="mb-10 mt-4 sm:mt-0"
      titleClassName=" text-2xl sm:text-3xl"
      {...props}
    />
  );
};

export { DrawerProvider, useDrawer, DrawerTitleCaption };
