"use client";

import React from "react";
import {
  FormControl,
  InputLabel,
  OutlinedInput,
  Select,
  MenuItem,
  Chip,
  Box,
  useTheme,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export type SelectItem = { content?: React.ReactNode; value: string };

export interface MultiInputSelectV1Props {
  items: SelectItem[];
  label?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  rootClassName?: string;
  chipBgClassName?: string; // Class for chips
  chipBtnClassName?: string; // Class for delete icon in chips
  required?: boolean;
  requiredStar?: boolean;
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function MultiInputSelectV1({
  items,
  label = "Select Options",
  placeholder = "Select one or more",
  name,
  className,
  rootClassName,
  chipBgClassName,
  chipBtnClassName,
  required,
  requiredStar,
  defaultValue = [],
  onChange,
}: MultiInputSelectV1Props) {
  const id = React.useId();
  const theme = useTheme();
  const [selected, setSelected] = React.useState<string[]>(defaultValue);
  const [open, setOpen] = React.useState(false);

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    const newValue = typeof value === "string" ? value.split(",") : value;
    setSelected(newValue);
    onChange?.(newValue);
    setOpen(false);
  };

  const handleDelete = (valToDelete: string) => {
    const newValue = selected.filter((val) => val !== valToDelete);
    setSelected(newValue);
    onChange?.(newValue);
  };

  const getStyles = (value: string) => {
    return {
      fontWeight: selected.includes(value)
        ? theme.typography.fontWeightMedium
        : theme.typography.fontWeightRegular,
    };
  };

  return (
    <div className={cn("grid space-x-0 space-y-0", rootClassName)}>
      <FormControl
        fullWidth
        className={cn("relative", className)}
        required={required}
      >
        <InputLabel id={`${id}-label`}>
          {label}
          {requiredStar && required && " *"}
        </InputLabel>
        <Select
          multiple
          name={name}
          labelId={`${id}-label`}
          id={id}
          value={selected}
          onChange={handleChange}
          input={<OutlinedInput label={label} />}
          renderValue={() => placeholder}
          MenuProps={MenuProps}
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
        >
          {items.map((item, index) => (
            <MenuItem
              key={index}
              value={item.value}
              style={getStyles(item.value)}
            >
              {item.content ?? item.value}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selected.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
          {selected.map((val) => (
            <Chip
              key={val}
              label={items.find((i) => i.value === val)?.content ?? val}
              onDelete={() => handleDelete(val)}
              deleteIcon={
                <X
                  className={cn("w-4 h-4 !text-destructive", chipBtnClassName)}
                />
              }
              className={cn(
                "!bg-[#328BE01A] text-destructive !border !border-destructive",
                chipBgClassName
              )}
              sx={{
                padding: "8px",
                gap: "4px",
                backgroundColor: "transparent", // let Tailwind override
                color: "inherit",
                borderColor: "transparent",
              }}
            />
          ))}
        </Box>
      )}
    </div>
  );
}
