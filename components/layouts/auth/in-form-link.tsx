import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

type Props = {
  mainText: string;
  link: string;
  linkContent: string;
  className?: string;
  onClick?: () => void;
};

const InFormLink = ({ mainText, link, linkContent, onClick, className }: Props) => {
  return (
    <p className={cn("block text-sm text-muted-foreground px-2 mt-2 text-center", className)}>
      {mainText}
      <Link onClick={onClick} className=" text-primary font-medium ml-1" href={link}>
        {linkContent}
      </Link>
    </p>
  );
};

export default InFormLink;
