"use client";
import * as React from "react";
import { InputInfoProps } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import InputV1, { InputV1Props } from "@/components/input-v1";

export interface InputPasswordV1Props extends InputV1Props, InputInfoProps {}

const InputPasswordV1 = React.forwardRef<HTMLInputElement, InputPasswordV1Props>(({ ...props }, ref) => {
  const [type, setType] = React.useState("password");

  return (
    <InputV1 ref={ref} {...props} type={type} className=" pr-12">
      <Button
        variant={"ghost"}
        size={"icon"}
        onClick={() => {
          type == "text" ? setType("password") : setType("text");
        }}
        className=" text-muted-foreground h-auto w-auto rounded-lg rounded-l-none absolute right-0 inset-y-0 border border-input border-l-0 px-3"
      >
        {type == "password" ? <EyeOff size={22} /> : <Eye size={22} />}
      </Button>
    </InputV1>
  );
});

InputPasswordV1.displayName = "InputPasswordV1";
export default InputPasswordV1;
