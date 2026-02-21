import CircularProgress from "@mui/joy/CircularProgress";
import Typography from "@mui/joy/Typography";
import { useCountUp } from "use-count-up";
import { useEffect, useState } from "react";

type UploadProgressProps = {
  progress: number;
  size?: "sm" | "md" | "lg";
};

export default function CircularUploadProgress({
  progress,
  size = "lg",
}: UploadProgressProps) {
  const [target, setTarget] = useState(progress);

  useEffect(() => {
    setTarget(progress);
  }, [progress]);

  const { value } = useCountUp({
    isCounting: true,
    duration: 0.5,
    start: 0,
    end: target,
  });

  return (
    <CircularProgress size={size} determinate value={Number(value)}>
      <Typography level="body-sm" fontWeight="lg">
        {Math.round(Number(value))}%
      </Typography>
    </CircularProgress>
  );
}
