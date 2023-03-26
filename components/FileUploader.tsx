import * as React from "react";
import { useRef } from "react";
import { currentlyLoggedInUserContext } from "../utils/interfaces";

export const FileUploader: React.FC<any> = ({ onFileSelect }) => {
  const fileInput = useRef<HTMLLabelElement>(null);
  const currentlyLoggedInUser = React.useContext(currentlyLoggedInUserContext);
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files![0];
    if (
      file.type === "video/mp4" ||
      file.type === "video/ogg" ||
      file.type === "video/webm"
    ) {
      if (currentlyLoggedInUser.userRole === "Normal") {
        if (file.size > 100000000) {
          //Normal value 800000000
          return alert(
            "Your File is bigger than 100MB Try to upload smaller one"
          );
        } else {
          onFileSelect(file);
        }
      } else {
        onFileSelect(file);
      }
    } else {
      if (currentlyLoggedInUser.userRole === "Normal") {
        if (file.size > 30000000) {
          return alert(
            "Your File is bigger than 30MB Try to upload smaller one"
          );
        } else {
          onFileSelect(file);
        }
      } else {
        onFileSelect(file);
      }
    }
  };
  return (
    <>
      <label
        htmlFor="file-input"
        onClick={(e) => fileInput.current && fileInput.current.click()}
      >
        <img src={"./insertpic.svg"} alt="Upload own mood" />
      </label>
      <input
        type="file"
        id="file-input"
        name="Img"
        accept="image/png, image/gif, image/jpeg ,video/*"
        onChange={handleFileInput}
      />
    </>
  );
};
