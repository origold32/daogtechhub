/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";

const TableHead = ({ children, className }: any): React.JSX.Element => {
  return (
    <thead className={`text-xs text-left  uppercase bg-[#F4F7FC] dark:bg-gray-700 dark:text-gray-400 ${className}`}>
      <tr>{children}</tr>
    </thead>
  );
};

export default TableHead;
