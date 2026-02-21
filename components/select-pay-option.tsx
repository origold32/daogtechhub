import { useState } from "react";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import Image from "next/image";
import { cn } from "@/lib/utils";
import TitleCatption from "./title-caption";

type Props = { onSelect: (opt: string) => void };

const SelectPaymentOption = ({ onSelect }: Props) => {
  const [active, setActive] = useState<string>();

  const opts = [
    {
      name: "Paystack",
      img: "/images/logo-paystack.svg",
    },
    // { name: "Flutterwave", img: "/images/logo-flutterwave.svg" },
    // { name: "Fincra", img: "/images/logo-fincra.svg" },
    // { name: "Bank Transfer", img: "/images/logo-bank.svg" },
  ];
  return (
    <div>
      <TitleCatption
        className=" text-center mb-8"
        title="Payment Method"
        caption="Select payment method"
        captionClassName=" text-black/80 text-base"
      />

      <RadioGroup
        className=" grid gap-4"
        onValueChange={(val) => {
          setActive(val);
          onSelect(val);
        }}
      >
        {opts.map((opt, i) => {
          return (
            <Label
              key={i}
              className={cn(
                "flex items-center p-5 py-3.5 rounded-lg border transition-all hover:scale-[1.01]",
                active == opt.name && "ring-2 ring-offset-2 ring-primary"
              )}
            >
              <Image
                height={130}
                width={130}
                className=" h-[30px]"
                alt="payment-logo"
                src={opt.img}
              />
              {/* <span className=" text-base text-black/70 uppercase ml-6">
                {opt.name}
              </span> */}
              <RadioGroupItem className="ml-auto" value={opt.name} />
            </Label>
          );
        })}
      </RadioGroup>
    </div>
  );
};

export default SelectPaymentOption;
