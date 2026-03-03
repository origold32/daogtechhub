import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export type TitleCaptionProps = {
  title: ReactNode;
  titleClassName?: string;
  caption?: ReactNode;
  captionClassName?: string;
  className?: string;
  invert?: boolean;
  titleLoading?: boolean;
  captionLoading?: boolean;
  loadingBg?: string;
};

const TitleCatption = (props: TitleCaptionProps) => {
  const defaultVariant = !props.invert;

  if (defaultVariant) {
    return (
      <div
        className={cn("relative flex flex-col text-black/90", props.className)}
      >
        <div
          className={cn(
            "relative font-semibold text-3xl w-fit ",
            props.caption && "mb-.5",
            props.titleClassName
          )}
        >
          <span className={cn(props.titleLoading && "opacity-0")}>
            {props.title}
          </span>
          {props.titleLoading && (
            <Skeleton
              className={cn(
                "absolute inset-0 h-5 /my-auto min-w-[130px] w-full",
                props.loadingBg
              )}
            />
          )}
        </div>
        {props.caption ? (
          <div
            className={cn(
              "font-normal text-sm text-muted-foreground",
              props.captionClassName
            )}
          >
            <span className={cn(props.captionLoading && "opacity-0")}>
              {props.caption}
            </span>
            {props.captionLoading && (
              <Skeleton
                className={cn(
                  "absolute inset-0 h-5 my-auto w-[90%]",
                  props.loadingBg
                )}
              />
            )}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cn("relative flex flex-col text-black/90", props.className)}
    >
      {props.caption ? (
        <div
          className={cn(
            "relative font-normal text-sm text-muted-foreground ",
            props.captionClassName
          )}
        >
          <span className={cn(props.captionLoading && "opacity-0")}>
            {props.caption}
          </span>
          {props.captionLoading && (
            <Skeleton
              className={cn(
                "absolute inset-0 min-h-5 /my-auto w-[90%]",
                props.loadingBg
              )}
            />
          )}
        </div>
      ) : null}
      <div
        className={cn(
          "relative first-letter:font-semibold text-3xl ",
          props.caption && "mt-.5",
          props.titleClassName
        )}
      >
        <span className={cn(props.titleLoading && "opacity-0")}>
          {props.title}
        </span>
        {props.titleLoading && (
          <Skeleton
            className={cn(
              "absolute min-w-[130px] inset-0 h-5 my-auto w-full",
              props.loadingBg
            )}
          />
        )}
      </div>
    </div>
  );
};

export default TitleCatption;
