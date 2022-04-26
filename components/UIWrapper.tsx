import { PropsWithChildren } from "react";
import { Header } from "./Header";
import { Navigation } from "./Navigation";
export const UIWrapper: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <>
      <Header />
      <div className="MainContentGrid">
        <Navigation />
        {children}
      </div>
    </>
  );
};
