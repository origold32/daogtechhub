"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

type DialogData = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  content?: ((closeDialog: () => void) => React.ReactNode) | React.ReactNode;
  modalContentClassName?: string;
};
type ContextProps = {
  openDialog: (data: DialogData) => void;
  closeDialog: () => void;
};
type DialogProviderProps = {
  children: React.ReactNode;
};

const DialogContext = React.createContext<ContextProps | null>(null);
const DialogProvider = ({ children }: DialogProviderProps) => {
  const [data, setData] = React.useState<DialogData | undefined>();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const modalContentClassName = data?.modalContentClassName;

  const openDialog = (data?: DialogData) => {
    setData(data);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setData({ modalContentClassName: modalContentClassName });
  };

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <div className={cn(" /overflow-y-auto h-full scroll_hide ")}>
            {data?.title || data?.description ? (
              <DrawerHeader className="p-0">
                {data?.title ? <DrawerTitle>{data.title}</DrawerTitle> : null}
                {data?.description ? (
                  <DrawerDescription>{data.description}</DrawerDescription>
                ) : null}
              </DrawerHeader>
            ) : null}
            {data
              ? typeof data.content == "function"
                ? data.content(closeDialog)
                : data.content
              : null}
          </div>
        </DialogContent>
      </Dialog>
      {children}
    </DialogContext.Provider>
  );
};

const useDialog = (modalConfig?: DialogData) => {
  const context = React.useContext(DialogContext);

  if (!context) {
    throw "useDialog must be used withing a DialogProvider context provider";
  }
  const openDialog = (extraConfig?: DialogData) => {
    context.openDialog({ ...modalConfig, ...extraConfig });
  };

  const closeDialog = () => {
    context.closeDialog();
  };

  return { openDialog, closeDialog };
};

export { DialogProvider, useDialog };
