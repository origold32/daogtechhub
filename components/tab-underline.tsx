"use client";

import React, { act, ReactNode, useId, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useUrlQueryState from "@/hooks/useUrlQueryState";
import { motion as m, AnimatePresence } from "framer-motion";
import { useUrlState } from "@/hooks/useUrlState";

type TabsProps = {
  tabs: TabItem[];
  defaultValue?: string;
  queryName?: string;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  onChange?: (value: string) => void;
};
export type TabItem = {
  value: string;
  valueDisplay?: ReactNode;
  content: ReactNode;
};

const TabsUnderline = ({
  tabs,
  defaultValue = tabs[0].value,
  leftContent,
  rightContent,
  onChange = () => {},
}: TabsProps) => {
  const [activeTab, setActiveTab] = useState<string>();
  const id = useId();

  React.useEffect(() => {
    defaultValue && setActiveTab(defaultValue);
  }, [defaultValue]);
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        setActiveTab(value);
        onChange(value);
      }}
      defaultValue={defaultValue}
      className="w-full w-[400px]/"
    >
      <div className="flex items-center">
        {leftContent ? leftContent : null}

        <TabsList className="mb-3 p-0 justify-start rounded-none shadow-none bg-transparent border-b">
          {tabs.map((tab, i) => {
            return (
              <TabsTrigger
                key={i}
                className="h-full relative !bg-transparent !shadow-none rounded-none"
                value={tab.value}
              >
                {activeTab == tab.value ? (
                  <m.div
                    layoutDependency={""}
                    layoutId={id}
                    className="h-0.5 bg-primary absolute bottom-0 inset-x-0"
                  ></m.div>
                ) : null}{" "}
                <span className="relative z-10">
                  {tab.valueDisplay ?? tab.value}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {rightContent ? rightContent : null}
      </div>
      {tabs.map(({ content, value }, i) => {
        return (
          <TabsContent key={i} value={value}>
            {content}
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

export default TabsUnderline;

export const TabsUnderlineURL = ({
  tabs,
  defaultValue = tabs[0].value,
  queryName = "tabu",
  leftContent,
  rightContent,
  onChange = () => {},
}: TabsProps) => {
  const [activeTab, setActiveTab] = useUrlState<string>(
    queryName,
    defaultValue
  );
  const id = useId();

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        setActiveTab(value);
        onChange(value);
      }}
      defaultValue={defaultValue}
      className="w-full"
    >
      <div className="flex items-center mb-2 sm:mb-6">
        {leftContent ? leftContent : null}
        <TabsList className=" !bg-transparent gap-2 justify-between overflow-auto h-auto">
          {tabs.map((tab, i) => {
            return (
              <TabsTrigger
                key={i}
                className="relative !bg-transparent py-2.5 h-auto !shadow-none"
                value={tab.value}
              >
                {activeTab == tab.value ? (
                  <m.div
                    layoutDependency={""}
                    layoutId={id}
                    className="h-0.5 bg-primary absolute bottom-0 inset-x-0"
                  ></m.div>
                ) : null}
                <span className="relative z-10 text-sm">
                  {tab.valueDisplay ?? tab.value}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {rightContent ? rightContent : null}
      </div>
      {tabs.map(({ content, value }, i) => {
        return (
          <TabsContent key={i} value={value}>
            {content}
          </TabsContent>
        );
      })}
    </Tabs>
  );
};
