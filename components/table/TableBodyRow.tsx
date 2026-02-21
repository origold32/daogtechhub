/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import React from "react";
import { ProviderTableBodyRowLink } from "./context/TableBodyRowLinkProvider";

const TableBodyRow = ({ link, children, className, ...props }: any) => {
  return (
    <tr
      className={` bg-white  /dark:bg-gray-700 /dark:text-gray-400  text-sm font-medium  text-[rgba(18,21,40,0.77)] /even:bg-gray-50 border-b  dark:border-gray-700 hover:bg-[#F3F6F6] ${className}`}
      {...props}
    >
      {!link ? (
        children
      ) : (
        <ProviderTableBodyRowLink link={link}>
          {children}
        </ProviderTableBodyRowLink>
      )}
    </tr>
  );
};

export default TableBodyRow;
