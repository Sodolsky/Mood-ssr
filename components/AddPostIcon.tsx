import Image from "next/image";
import React from "react";
import AddPostSvg from "../public/plus.png";
import AddPostSvgDarkMode from "../public/addPost.svg";
import { themeTypes } from "../utils/interfaces";
export interface AddPostIconInterface {
  setAddPostIconClicked: React.Dispatch<React.SetStateAction<boolean>>;
  theme: themeTypes;
}

export const AddPostIcon: React.FC<AddPostIconInterface> = (props) => {
  const { setAddPostIconClicked, theme } = props;
  return (
    <div className={`AddPostBox`} onClick={() => setAddPostIconClicked(true)}>
      <Image
        src={theme === "bright" || !theme ? AddPostSvg : AddPostSvgDarkMode}
        width={64}
        height={64}
        alt="Add new Post"
      />
    </div>
  );
};
