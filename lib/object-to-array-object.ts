import { formatFullDateTime } from "./format-date";

type DataObject = { [key: string]: any };
type DataOutput = { name: string; value: string };

const isLikelyDate = (value: string): boolean => {
  const parsed = Date.parse(value);
  return !isNaN(parsed);
};

export const objectToArrayOfObject = (data: DataObject): DataOutput[] => {
  let output: DataOutput[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === "string" && isLikelyDate(value)) {
      output.push({ name: key, value: formatFullDateTime(value) });
    } else if (
      typeof value !== "object" ||
      value === null ||
      Array.isArray(value)
    ) {
      output.push({ name: key, value: String(value) });
    } else {
      let subOutput = objectToArrayOfObject(value);
      output = [...output, ...subOutput];
    }
  });

  return output;
};

// Example usage:
const data = {
  a: 1,
  b: {
    c: "2024-06-04T04:30:00Z",
    d: {
      e: "2024-07-05T17:45:00+02:00",
      f: 42,
    },
  },
};

console.log(objectToArrayOfObject(data));
