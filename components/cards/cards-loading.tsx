import React from "react";
import { Skeleton } from "../ui/skeleton";

type Props = {};

const LoadingCards = (props: Props) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 gap-y-10 ">
      {Array.from({ length: 6 }).map((el, i) => {
        return (
          <div key={i} className="flex flex-col space-y-3">
            <Skeleton className=" aspect-[400/225] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LoadingCards;
