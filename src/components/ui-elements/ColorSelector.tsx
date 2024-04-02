import { useState, MouseEvent, useContext } from "react";
import { ToolContext } from "@/contexts";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import CheckIcon from "@mui/icons-material/Check";

type ColorToggleButtonProps = {
  current: string;
};

export default function ColorToggleButton(props: ColorToggleButtonProps) {
  const { schema } = useContext(ToolContext);
  const colors: string[] = JSON.parse(schema.colors);
  const [currentColor, setCurrentColor] = useState(props.current);

  const handleChange = (event: MouseEvent<HTMLElement>, newColor: string) => {
    setCurrentColor(newColor);
  };

  return (
    <ToggleButtonGroup
      color="primary"
      value={currentColor}
      exclusive
      onChange={handleChange}
      aria-label="Color"
      sx={{
        "& .MuiToggleButton-root.Mui-selected": {
          bgcolor: currentColor,
        },
        "& .MuiToggleButton-root:hover": {
          bgcolor: "transparent",
        },
      }}
    >
      {colors.map((color) => (
        <ToggleButton
          value={color}
          key={color}
          sx={{
            bgcolor: color,
            color: "transparent",
            p: 2,
          }}
        >
          <CheckIcon color="inherit" />
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
