/* eslint-disable @next/next/no-img-element */
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { ReactNode } from "react";
import { Badge, BadgeProps } from "../ui/badge";
import { cn } from "@/lib/utils";

export type CardBaseProps = {
  id?: number;
  title: string;
  description?: string;
  link?: string;
  coverImage?: string;
  imageAlt?: string;
  buttonText?: string;
  badge?: BadgeProps;
  className?: string;
  children?: ReactNode;
};

const CardBase = ({
  className,
  title,
  description,
  link,
  coverImage = "/images/children.jpg",
  imageAlt,
  buttonText = "Read more",
  badge,
  children,
}: CardBaseProps) => {
  if (link) {
    return (
      <Link href={link}>
        <Card
          className={cn(
            "flex flex-col max-w-sm bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700 group hover:shadow-md transition-all",
            className
          )}
        >
          {coverImage ? (
            <div className="p-3 ">
              <div className=" overflow-hidden rounded-lg">
                <img
                  className="rounded-lg h-[150px] bg-muted object-cover w-full group-hover:scale-[1.03] transition-all"
                  src={coverImage}
                  alt={imageAlt ?? `${title} image`}
                  width={400}
                  height={225}
                />
              </div>
            </div>
          ) : null}
          <div className="p-3 flex flex-col flex-1">
            {badge ? <Badge size={"sm"} className="mb-2" {...badge} /> : null}
            <Link href={link || "#"}>
              <h5 className="mb-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {title}
              </h5>
            </Link>
            {description && (
              <p
                className={cn(
                  " font-normal text-gray-700 dark:text-gray-400 line-clamp-1",
                  children && "mb-2"
                )}
              >
                {description}
              </p>
            )}
            {/* {children ? <hr /> : null} */}
            {children ? children : null}
          </div>
        </Card>
      </Link>
    );
  }
  return (
    <Card
      className={cn(
        "flex flex-col max-w-sm bg-white border border-gray-200 rounded-xl dark:bg-gray-800 dark:border-gray-700 group",
        className
      )}
    >
      {coverImage ? (
        <div className="p-3 ">
          <div className=" overflow-hidden rounded-lg">
            <img
              className="rounded-lg h-[150px] object-cover w-full group-hover:scale-[1.02] transition-all"
              src={coverImage}
              alt="Card image"
              width={400}
              height={225}
            />
          </div>
        </div>
      ) : null}
      <div className="p-3 flex flex-col flex-1">
        {badge ? <Badge size={"sm"} className="mb-2" {...badge} /> : null}
        <Link href={link || "#"}>
          <h5 className="mb-1 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h5>
        </Link>
        {description && (
          <p
            className={cn(
              " font-normal text-gray-700 dark:text-gray-400 line-clamp-1",
              children && "mb-2"
            )}
          >
            {description}
          </p>
        )}
        {/* {children ? <hr /> : null} */}
        {children ? children : null}
      </div>
    </Card>
  );
};

export default CardBase;
