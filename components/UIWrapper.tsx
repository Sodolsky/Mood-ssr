import { PropsWithChildren } from "react";
import { Navigation } from "./Navigation";
export const UIWrapper: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <div className="MainContentGrid">
      <Navigation />
      {children}
    </div>
  );
};
