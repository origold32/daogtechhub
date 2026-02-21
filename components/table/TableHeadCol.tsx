/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";

const TableHeadCol = ({ children, className, divClassName }: any) => {
  return (
    <th scope="col" className={` first:pl-0 last:pr-0 px-1 py-3  ${className}`}>
      <div className={`  px-6 ${divClassName}`}>{children}</div>
    </th>
    //   <th scope="col" class=" ">
    //   <div className=" bg-[#F6FBFD] rounded-lg p-4 font-semibold text-base text-black capitalize ">{children}</div>
    // </th>
  );
};

export default TableHeadCol;
