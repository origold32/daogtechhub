"use client";

import React, { ReactNode } from "react";
import TitleCatption, { TitleCaptionProps } from "./title-caption";
import { cn } from "@/lib/utils";
import { motion as m } from "framer-motion";
import { Button, ButtonLink, ButtonProps, LinkButtonProps } from "./ui/button";
import Image from "next/image";

export interface TitleCaptionStatusInfoProps extends TitleCaptionProps {
  img?: string | ReactNode;
  variant?: "warn" | "success" | "error";
  imgClassName?: string;
  rootClassName?: string;
  btnLabels?: string[];
  btnsProps?: ButtonProps[];
  btnsLinkProps?: LinkButtonProps[];
  btnDivsClassName?: string;
}

const TitleCaptionStatusInfo = (properties: TitleCaptionStatusInfoProps) => {
  const {
    rootClassName,
    img,
    imgClassName,
    variant,
    title,
    caption,
    btnLabels,
    btnDivsClassName,
    btnsProps,
    btnsLinkProps,
    titleClassName,
    captionClassName,
    ...props
  } = properties;
  return (
    <div
      className={cn(
        "flex flex-col gap-4 items-center clip-box max-w-[342px] mx-auto",
        rootClassName
      )}
    >
      <m.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, transition: { delay: 0.3 } }}
      >
        {typeof img == "string" ? (
          <Image
            alt="status-information"
            height={162}
            width={162}
            className={cn(" w-[162px] h-[162px] object-contain", imgClassName)}
            src={img}
          />
        ) : (
          img
        )}
        {variant == "warn" ? (
          <Image
            alt="status-information"
            height={162}
            width={162}
            className={cn(" w-[162px] h-[162px] object-contain", imgClassName)}
            src={"/images/caution-rectangle.png"}
          />
        ) : null}
        {variant == "success" ? (
          <Image
            alt="status-information"
            height={162}
            width={162}
            className={cn(" w-[162px] h-[162px] object-contain", imgClassName)}
            src={"/images/tick.png"}
          />
        ) : null}
        {variant == "error" ? (
          <Image
            alt="status-information"
            height={162}
            width={162}
            className={cn(" w-[162px] h-[162px] object-contain", imgClassName)}
            src={"/images/caution-rectangle.png"}
          />
        ) : null}
      </m.div>
      <TitleCatption
        title={
          <m.div
            initial={{ y: "100%", scale: 0.7, z: 100 }}
            animate={{ y: "0%", scale: 1, transition: { delay: 0.2 } }}
          >
            {title}
          </m.div>
        }
        caption={
          <m.div
            initial={{ y: "50%", opacity: 0, scale: 0.7, z: 100 }}
            animate={{
              y: "0%",
              scale: 1,
              opacity: 1,
              transition: { delay: 0.6 },
            }}
          >
            {caption}
          </m.div>
        }
        className=" text-center"
        titleClassName={cn(
          " text-3xl font-semibold clip-box overflow-hidden",
          titleClassName
        )}
        captionClassName={cn(" clip-box /overflow-hidden", captionClassName)}
        {...props}
      />
      <div className=" mt-4 clip-box w-full">
        <m.div
          initial={{ y: "40%", opacity: 0, scale: 0.8 }}
          animate={{
            y: "0%",
            opacity: 1,
            scale: 1,
            transition: { delay: 0.7 },
          }}
          className={cn(
            "grid gap-4 items-stretch self-stretch w-full",
            btnDivsClassName
          )}
        >
          {btnLabels?.map((el, i) => {
            return (
              <Button
                {...(btnsProps ? btnsProps[i] : {})}
                className={cn("w-full", btnsProps && btnsProps[i]?.className)}
                key={i}
              >
                {el}
              </Button>
            );
          })}
          {btnsLinkProps?.map((btnLinkProps, i) => {
            return (
              <ButtonLink
                {...btnLinkProps}
                key={i}
                className={cn("w-full", btnLinkProps?.className)}
              />
            );
          })}
          {btnsProps?.map((btnProps, i) => {
            return (
              <Button
                {...btnProps}
                key={i}
                className={cn("w-full", btnProps.className)}
              />
            );
          })}
        </m.div>
      </div>
    </div>
  );
};

export default TitleCaptionStatusInfo;
