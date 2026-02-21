import React from "react";
import Countdown, { CountdownProps, CountdownRenderProps, zeroPad } from "react-countdown";
type TimeUnits = "d" | "h" | "m" | "s";

type Variant = `${TimeUnits}${TimeUnits}` | `${TimeUnits}${TimeUnits}${TimeUnits}` | `${TimeUnits}${TimeUnits}${TimeUnits}${TimeUnits}` | TimeUnits;

interface Props extends CountdownProps {
  variant: Variant;
  className?: string;
}

const CustomCountDown = ({ variant, className, ...props }: Props) => {
  const renderer = (rendererProps: CountdownRenderProps) => <CustomRenderer {...rendererProps} className={className} variant={variant} />;

  return <Countdown renderer={renderer} {...props}></Countdown>;
};

export default CustomCountDown;

interface CustomRenderer extends CountdownRenderProps {
  variant?: Variant;
  className?: string;
}
const CustomRenderer = ({ className, variant = "dhms", days, hours, minutes, seconds }: CustomRenderer) => {
  const formattedDisplay: (number | string)[] = Array.from(variant).map((el, i) => {
    if (el == "d") return days;
    if (el == "h") return hours;
    if (el == "m") return minutes;
    if (el == "s") return zeroPad(seconds);
    return 0;
  });

  return <span className={className}>{formattedDisplay.join(":")}</span>;
};
