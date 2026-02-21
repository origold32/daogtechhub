"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Card } from "./ui/card";
import Image from "next/image";
import EmptyAnimation from "@/public/lottie/empty-1.json";
import Lottie from "lottie-react";

interface EmptyStateProps extends React.ComponentPropsWithoutRef<"div"> {
  img?: string | ReactNode;
  imgClassName?: string;
  title: string;
  caption?: string | ReactNode;
}

const EmptyState = ({
  img,
  title,
  caption,
  className,
  imgClassName,
}: EmptyStateProps) => {
  return (
    <Card
      aria-label="empty-state"
      className={cn(
        `min-h-[300px] text-center w-full h-full flex flex-col items-center justify-center p-8 `,
        className
      )}
    >
      {typeof img == "string" ? (
        <Image
          height={73}
          className={` h-[73px] w-auto ${imgClassName}`}
          alt="empty-state-img"
          src={img}
        />
      ) : null}
      {typeof img != "string" && img ? (
        img
      ) : (
        <Lottie
          className={" w-full max-w-[100px] scale-[3] mt-[40px]"}
          animationData={EmptyAnimation}
          loop={true}
        />
      )}
      <span className="text-muted-foreground/80 font-medium text-lg mt-4">
        {title}
      </span>
      {caption ? (
        <span className=" text-muted-foreground font-normal text-sm mt-1">
          {caption}
        </span>
      ) : null}
    </Card>
  );
};

export default EmptyState;
