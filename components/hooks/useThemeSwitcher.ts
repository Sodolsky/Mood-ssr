import { useEffect, useState } from "react";

export const useThemeSwitcher = () => {
  const [theme, setTheme] = useState<"bright" | "dark">("bright");
  useEffect(() => {
    if (theme === "dark") {
      document.body.style.backgroundImage = "none";
      document.body.style.backgroundColor = "#1a1a1a";
    } else {
      document.body.style.backgroundImage =
        "linear-gradient(  to bottom, #a9c9ff 0%,#ffbbec 25%,#a9c9ff 75%)";
      document.body.style.backgroundColor = "#a9c9ff";
    }
  }, [theme]);
  return { theme, setTheme };
};
