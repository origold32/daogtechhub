/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { useTableRowLink } from "./context/TableBodyRowLinkProvider";
import Link from "next/link";

const TableBodyCol = ({ children, className, ...props }: any) => {
  // console.log("chilrdren is", children);
  const rowLink = useTableRowLink();

  if (rowLink?.link) {
    return (
      <td {...props}>
        <Link
          className="px-6 py-4 block  first:rounded-l-lg last:rounded-r-lg"
          href={rowLink.link}
        >
          {" "}
          {children || <span>&#8212;</span>}
        </Link>
      </td>
    );
  }
  return (
    <td className="px-8 py-4  first:rounded-l-lg last:rounded-r-lg" {...props}>
      {children || <span>&#8212;</span>}
    </td>
  );
};

export default TableBodyCol;
