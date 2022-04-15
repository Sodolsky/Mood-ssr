import Image from "next/image";
import React from "react";
import AddPostSvg from "../public/plus.png";
export interface AddPostIconInterface {
  setAddPostIconClicked: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AddPostIcon: React.FC<AddPostIconInterface> = (props) => {
  const { setAddPostIconClicked } = props;
  return (
    <div className="AddPostBox" onClick={() => setAddPostIconClicked(true)}>
      <Image src={AddPostSvg} width={64} height={64} alt="Add new Post" />
    </div>
  );
};
