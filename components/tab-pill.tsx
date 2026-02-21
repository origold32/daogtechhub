"use client";

import React, { act, ReactNode, useEffect, useId, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion as m } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUrlState } from "@/hooks/useUrlState";
import Loader3 from "./loaders/loader-3";

type TabsProps = {
  tabs: TabItem[];
  defaultValue?: string;
  queryName?: string;
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  onChange?: (value: string) => void;
  tabClassName?: string;
  containerClassName?: string;
  tabsTriggerClassName?: string;
  activeTabClassName?: string;
  contentClassName?: string;
  tabListClassName?: string;
  activeTabBgClassName?: string;
  activeTextClassName?: string;
};
export type TabItem = {
  value: string;
  valueDisplay?: ReactNode;
  content: ReactNode;
};

const TabsPill = ({
  tabs,
  defaultValue = tabs[0].value,
  leftContent,
  rightContent,
  onChange = () => {},
  tabClassName,
  containerClassName,
  tabListClassName,
  tabsTriggerClassName,
  activeTabClassName,
  contentClassName,
  activeTabBgClassName,
  activeTextClassName,
}: TabsProps) => {
  const [activeTab, setActiveTab] = useState<string>();
  const id = useId();

  React.useEffect(() => {
    setActiveTab(defaultValue ?? "");
  }, [defaultValue]);
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        setActiveTab(value);
        onChange(value);
      }}
      defaultValue={defaultValue}
      className={cn("w-full", tabClassName)}
    >
      <div
        className={cn(
          "flex items-center flex-wrap gap-4 mb-10",
          containerClassName
        )}
      >
        {leftContent ? leftContent : null}
        <TabsList
          className={cn(
            "bg-[#FAFCFF] gap-4 border-b justify-normal",
            tabListClassName
          )}
        >
          {tabs.map((tab, i) => {
            return (
              <TabsTrigger
                key={i}
                className={cn(
                  "relative bg-transparent rounded-full",
                  tabsTriggerClassName,
                  activeTab == tab.value
                    ? activeTabClassName
                    : "text-[#777E90] hover:text-[#39BD78]"
                )}
                value={tab.value}
              >
                {activeTab == tab.value ? (
                  <m.div
                    layoutId={id}
                    className={cn(
                      "bg-[#39BD78] absolute inset-0 rounded-full z-0",
                      activeTabBgClassName
                    )}
                  />
                ) : null}
                <span
                  className={cn(
                    "relative z-20 transition-colors delay-200",
                    activeTab == tab.value
                      ? ["text-[#39BD78]", activeTextClassName]
                      : "text-[#777E90]"
                  )}
                >
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
          <TabsContent key={i} value={value} className={cn(contentClassName)}>
            {content}
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

export default TabsPill;

export const TabsPillURL = ({
  tabs,
  defaultValue = tabs[0].value,
  queryName = "tab",
  leftContent,
  rightContent,
  onChange = () => {},
  tabClassName,
  containerClassName,
  tabsTriggerClassName,
  activeTabClassName,
  contentClassName,
  tabListClassName,
}: TabsProps) => {
  const [activeTab, setActiveTab] = useUrlState<string>(
    queryName,
    defaultValue
  );
  const id = useId();

  const isReady = !!activeTab;

  useEffect(() => {
    // sync the default if missing from query
    if (!activeTab) {
      setActiveTab(defaultValue);
    }
  }, [activeTab, defaultValue, setActiveTab]);

  if (!isReady) return <Loader3 />;

  return (
    <Tabs
      // key={activeTab}
      value={activeTab}
      onValueChange={(value) => {
        setActiveTab(value);
        onChange(value);
      }}
      className={cn("w-full", tabClassName)}
    >
      <div
        className={cn(
          "flex items-center flex-wrap gap-4 mb-10",
          containerClassName
        )}
      >
        {leftContent ? leftContent : null}
        <TabsList
          className={cn(
            "bg-[#FAFCFF] gap-4 border-b justify-normal",
            tabListClassName
          )}
        >
          {tabs.map((tab, i) => {
            return (
              <TabsTrigger
                key={i}
                className={cn(
                  "relative !bg-transparent rounded-full",
                  tabsTriggerClassName,
                  activeTab == tab.value
                    ? activeTabClassName
                    : "text-[#777E90] hover:text-[#39BD78]"
                )}
                value={tab.value}
              >
                {activeTab == tab.value ? (
                  <m.div
                    layoutDependency={""}
                    layoutId={id}
                    className="absolute inset-0 rounded-full z-0"
                  />
                ) : null}
                <span
                  className={cn(
                    "relative z-20 transition-colors delay-200",
                    activeTab == tab.value
                      ? " text-[#39BD78]"
                      : "text-[#777E90]"
                  )}
                >
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
          <TabsContent key={i} value={value} className={cn(contentClassName)}>
            {content}
          </TabsContent>
        );
      })}
    </Tabs>
  );
};
