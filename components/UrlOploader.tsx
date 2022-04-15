import React from "react";
export interface UrlUploaderPropsInterface {
  isLinkChoosen: boolean;
  setIfLinkIsChoosen: React.Dispatch<React.SetStateAction<boolean>>;
  onClick: () => void;
}
export const UrlUploader: React.FC<UrlUploaderPropsInterface> = (props) => {
  return (
    <>
      <img
        src={"./video.svg"}
        alt="Upload own mood"
        onClick={() => {
          props.setIfLinkIsChoosen(true);
          props.onClick();
        }}
      />
    </>
  );
};
