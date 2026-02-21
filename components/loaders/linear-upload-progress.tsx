import LinearProgress, {
  LinearProgressProps,
} from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useCountUp } from "use-count-up";
import { useEffect, useState } from "react";

type LinearUploadProgressProps = {
  progress: number;
};

function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number }
) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress
          variant="determinate"
          {...props}
          sx={{ height: 15, borderRadius: 10, ...props.sx }}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary" }}
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

export default function LinearUploadProgress({
  progress,
}: LinearUploadProgressProps) {
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
    <Box sx={{ width: "100%" }}>
      <LinearProgressWithLabel value={Number(value)} />
    </Box>
  );
}
