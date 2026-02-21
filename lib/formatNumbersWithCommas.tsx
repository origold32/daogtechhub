const addCommas = (num: string | number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const removeNonNumeric = (num: string | number) => {
  let formattedNo = num?.toString().replace(/[^0-9]/g, "");
  if (formattedNo) {
    return parseInt(formattedNo);
  } else {
    console.log("returning 0");
    return "";
  }
};

export function removeDecimal(number: string | number) {
  // Convert the number to a string, split at the decimal point, and take the first part
  const stringWithoutDecimal = String(number).split(".")[0];
  return stringWithoutDecimal;
}

const formatNumberWithCommas = (num: string | number, ignoreDecimals: boolean = false) => {
  if (!num) {
    num = 0;
  }
  const [integerPart, decimalPart] = num?.toString()?.split(".");

  // Format the integer part with commas
  const formattedIntegerPart = addCommas(removeNonNumeric(removeDecimal(integerPart)));

  // If there is a decimal part, append it to the formatted integer part
  if (decimalPart !== undefined && !ignoreDecimals) {
    return `${formattedIntegerPart}.${removeNonNumeric(decimalPart)}`;
  } else {
    return formattedIntegerPart;
  }
};

export default formatNumberWithCommas;
