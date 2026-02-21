import TitleCatption, { TitleCaptionProps } from "@/components/title-caption";
import React from "react";

type Props = TitleCaptionProps & {};

const AuthTitleCaption = (props: Props) => {
  return (
    <TitleCatption className="mb-6" titleClassName="text-2xl font-bold mb-2 text-center mx-auto" captionClassName=" text-muted-foreground max-w-[300px] text-center mx-auto text-base " {...props} />
  );
};

export default AuthTitleCaption;
