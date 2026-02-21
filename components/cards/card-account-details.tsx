import { Church, Copy } from "lucide-react";
import React from "react";
import TitleCatption from "../title-caption";

type Props = {};

const CardAccountDetails = (props: Props) => {
  const detailsItem = [
    { title: "Account Name", text: "9Payment Service Bank" },
    { title: "Bank Name", text: "9Payment Service Bank" },
    { title: "Account Number", text: "32234243524" },
  ];
  return (
    <div className=" bg-[#FAFCFF] h-max rounded-xl  border">
      <div className=" border-b/ px-5 py-4 mb-3">
        <TitleCatption
          titleClassName=" text-sm text-secondary font-semibold"
          title="TRANSFER DETAILS"
          caption="People can contribute directly to this goal via transfer."
        />
      </div>
      <div className="grid gap-4 px-4 pb-4">
        {detailsItem.map((el, i) => {
          return (
            <div
              key={i}
              className=" text-sm grid gap-1 border-b last:border-b-0 pb-1.5 w-full"
            >
              <div className=" text-primary text-xs">{el.title}</div>
              <div className="flex items-center gap-2 text-secondary font-semibold md:text-base">
                {el.text}{" "}
                <button
                  className=" ml-1 text-primary"
                  title="Copy to clipboard"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CardAccountDetails;
