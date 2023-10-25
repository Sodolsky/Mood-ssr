import * as React from "react";
import { useRef } from "react";
import { currentlyLoggedInUserContext } from "../utils/interfaces";
import { maxImageSize, maxVideoSize } from "./CreatePost";
import { toast } from "react-toastify";
interface IFileUploader {
  onFileSelect: React.Dispatch<React.SetStateAction<File | undefined>>;
}
export const FileUploader: React.FC<IFileUploader> = ({ onFileSelect }) => {
  const fileInput = useRef<HTMLLabelElement>(null);
  const currentlyLoggedInUser = React.useContext(currentlyLoggedInUserContext);
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files![0];
    if (file) {
      if (
        file.type === "video/mp4" ||
        file.type === "video/ogg" ||
        file.type === "video/webm" ||
        file.type === "video/quicktime"
      ) {
        if (currentlyLoggedInUser.userRole === "Normal") {
          if (file.size > maxVideoSize) {
            return alert(
              "Your File is bigger than 100MB Try to upload smaller one"
            );
          } else {
            if (file.type === "video/quicktime") {
              toast.error("Sorry but we currently don't support .MOV files");
            } else onFileSelect(file);
          }
        } else {
          if (file.type === "video/quicktime") {
            toast.error("Sorry but we currently don't support .MOV files");
          } else onFileSelect(file);
        }
      } else {
        if (currentlyLoggedInUser.userRole === "Normal") {
          if (file.size > maxImageSize) {
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
