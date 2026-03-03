import React, { ReactNode, useMemo } from "react";
import TitleCatption, { TitleCaptionProps } from "./title-caption";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { extractFirstLetters } from "@/lib/text";
import { getFallbackBgClassFromKey } from "@/lib/getFallbackBgClassFromKey";

type Props = TitleCaptionProps & {
  avartarUrl?: string;
  rootClassName?: string;
  avartarClassName?: string;
  fbTextClassName?: string;
  fallbackText?: string;
};

const TitleCatptionAvartar = ({
  avartarUrl,
  fallbackText,
  rootClassName,
  avartarClassName,
  fbTextClassName,
  ...props
}: Props) => {
  const fallbackInitials = useMemo(() => {
    if (fallbackText) {
      return extractFirstLetters(fallbackText, 3);
    }
    if (typeof props.title === "string") {
      return extractFirstLetters(props.title, 2);
    }
    return "??";
  }, [fallbackText, props.title]);

  const fallbackBgClass = useMemo(() => {
    const key =
      (typeof props.title === "string" && props.title) || fallbackText || "";
    return getFallbackBgClassFromKey(key);
  }, [props.title, fallbackText]);

  return (
    <div className={cn("flex items-center relative", rootClassName)}>
      <Avatar className={cn("mr-2 relative", avartarClassName)}>
        <AvatarImage src={avartarUrl} />
        <AvatarFallback
          className={cn(
            "text-white font-semibold",
            fallbackBgClass,
            fbTextClassName
          )}
        >
          {fallbackInitials}
        </AvatarFallback>
      </Avatar>
      <TitleCatption {...props} />
    </div>
  );
};

export default TitleCatptionAvartar;
