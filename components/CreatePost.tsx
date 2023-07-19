import * as React from "react";
import { useState } from "react";
import { ModalBody, Modal, Button, Alert } from "react-bootstrap";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import BackArrowIcon from "../public/backarrow.png";
import { v4 as uuidv4 } from "uuid";
import TextareAutosize from "react-textarea-autosize";
import { FileUploader } from "./FileUploader";
import { useEffect } from "react";
import { UrlUploader } from "./UrlOploader";
import { getLinkId, validateYouTubeUrl } from "./ValidateYoutubeUrl";
import { AddPostIcon } from "./AddPostIcon";
import {
  currentlyLoggedInUserContext,
  likeTypes,
  peopleThatLikedInterface,
  themeContext,
  UserData,
} from "../utils/interfaces";
import { useContext } from "react";
import { db, storageRef } from "../firebase/firebase";
import { doc, increment, Timestamp, writeBatch } from "@firebase/firestore";
import { ref } from "@firebase/storage";
import { downloadImageIfPostHasOne, UserForFirebase } from "./Post";
import { LoadingRing } from "./LoadingRing";
import { useMediaQuery } from "@react-hook/media-query";
import { checkIfTextHaveHashtags } from "./likeFunctions";
import { uniq } from "lodash";
import moment from "moment";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import Image, { StaticImageData } from "next/image";
import { getDownloadURL, uploadBytesResumable } from "firebase/storage";
import heart from "../public/heart.png";
import poop from "../public/poop.png";
import laughing from "../public/laughing.png";
import crying from "../public/crying.png";
import questionMark from "../public/question-mark.png";
import clown from "../public/clown.png";
import skull from "../public/skull.png";
import openMouth from "../public/openMouth.png";

import { Checkbox } from "antd";
interface reaction {
  imageData: StaticImageData;
  likeType: likeTypes;
}
const allReactions: reaction[] = [
  { imageData: heart, likeType: "heart" },
  { imageData: poop, likeType: "poop" },
  { imageData: laughing, likeType: "laughing" },
  { imageData: openMouth, likeType: "openMouth" },
  { imageData: crying, likeType: "crying" },
  { imageData: questionMark, likeType: "questionMark" },
  { imageData: clown, likeType: "clown" },
  { imageData: skull, likeType: "skull" },
];
//Key needs to be changed
const uploadUserImageToStorageBucket = async (
  key: string,
  img: Blob | File
) => {
  const pathRef = ref(storageRef, "PostImages");
  const fileRef = ref(pathRef, `${key}`);
  const uploadTask = await uploadBytesResumable(fileRef, img);
  await getDownloadURL(fileRef);
};
export interface CommentInterface {
  userThatAddedComment: {
    Avatar: string;
    Login: string;
  };
  content: string;
  date: any;
  usersThatLikedThisComment: UserForFirebase[];
  img: string;
  id?: string;
  parentPostRef?: string;
}
export const CreatePost: React.FC = () => {
  const createPostRef = React.useRef<HTMLDivElement | null>(null);
  const themeCTX = useContext(themeContext);
  const [addPostIconClicked, setAddPostIconClicked] = useState<boolean>(false);
  const [newPostText, setNewPostText] = useState<string>("");
  const [userImage, setUserImage] = useState<File>();
  const [isLinkChoosen, setIfLinkIsChoosen] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [YTLink, setYTLink] = useState<string | undefined>("");
  const [progressNumber, setprogressNumber] = useState<number>(0);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [postType, setPostType] = useState<string>("");
  const currentlyLoggedInUser = useContext(currentlyLoggedInUserContext);
  const [imgPrevievSrc, setImgPrevievSrc] = useState<undefined | string>(
    undefined
  );
  const [imglock, setImgLock] = useState<boolean>(false);
  const [postLoading, setPostLoading] = useState<boolean>(false);
  const [rawImageBlob, setRawImageBlob] = useState<File | Blob>();
  const [likeType, setLikeType] = useState<likeTypes>("heart");
  const [spoiler, setSpoiler] = useState<boolean>(false);
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const match = useMediaQuery("only screen and (min-width:450px");
  const addNewPostIntoDataBase = async (
    postType: string,
    userThatPostedThis: UserData,
    text: string,
    likeCount: number,
    poepleThatLiked: peopleThatLikedInterface[],
    date: string,
    timestamp: Timestamp,
    hashtags: string[],
    URL: string,
    hallOfFame: boolean,
    img?: string,
    fileType?: string,
    YTLink?: string,
    spoiler?: boolean
  ) => {
    try {
      const newPostBatch = writeBatch(db);
      newPostBatch.set(doc(db, "Posts", `${date}`), {
        postType: postType,
        userThatPostedThis: {
          Login: userThatPostedThis.Login,
          Avatar: userThatPostedThis.Avatar,
        },
        text: text,
        img: img,
        fileType: fileType,
        hashtags: hashtags,
        YTLink: YTLink,
        likeCount: likeCount,
        poepleThatLiked: poepleThatLiked,
        date: date,
        timestamp: timestamp,
        URL: URL,
        hallOfFame: hallOfFame,
        spoiler: spoiler,
      });
      //Evil Sodol is my testing account and i dont want to increment post count
      if (currentlyLoggedInUser.Login !== "EVILSODOL") {
        newPostBatch.update(
          doc(db, "Users", `${currentlyLoggedInUser.Login}`),
          {
            postCount: increment(1),
          }
        );
      }
      await newPostBatch.commit();
    } catch (error) {
      console.error("Error happened while adding document", error);
    }
  };
  const handleChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ): void => {
    const value = event.target.value;
    setNewPostText(value);
  };
  useEffect(() => {
    if (userImage === undefined) {
      return setImgPrevievSrc("");
    }
    setRawImageBlob(userImage);
    return setImgPrevievSrc(URL.createObjectURL(userImage));
  }, [userImage]);
  useEffect(() => {
    isLinkChoosen ? setPostType("video") : setPostType("photo");
  }, [isLinkChoosen]);
  useEffect(() => {
    if (createPostRef.current) {
      createPostRef.current.onpaste = function (event) {
        if (!addPostIconClicked) return;
        if (event.clipboardData) {
          var items = event.clipboardData.items;
          for (var index in items) {
            var item = items[index];
            if (item.kind === "string") {
              item.getAsString((mess) => {
                if (validateYouTubeUrl(mess)) {
                  if (document.activeElement !== textareaRef.current) {
                    setIfLinkIsChoosen(true);
                    setYTLink(mess);
                  }
                }
              });
            }
            if (item.kind === "file") {
              var blob = item.getAsFile();
              var reader = new FileReader();
              reader.onload = function (event) {
                if (event.target) {
                }
              };
              if (blob) {
                if (
                  blob.type === "video/mp4" ||
                  blob.type === "video/ogg" ||
                  blob.type === "video/webm"
                ) {
                  if (currentlyLoggedInUser.userRole === "Normal") {
                    if (blob.size > 40000000) {
                      //Normal value is 40MB
                      return alert(
                        "Your File is bigger than 40MB Try to paste smaller one"
                      );
                    } else {
                    }
                  }
                } else {
                  if (currentlyLoggedInUser.userRole === "Normal") {
                    if (blob.size > 15000000) {
                      return alert(
                        "Your File is bigger than 15MB Try to paste smaller one"
                      );
                    }
                  }
                  setRawImageBlob(blob);

                  checkFileType(blob);
                  setUserImage(blob);
                  const data = URL.createObjectURL(blob);
                  setImgPrevievSrc(data);
                  reader.readAsDataURL(blob);
                }
              }
            }
          }
        }
      };
    }
  }, [addPostIconClicked]);
  //Reset state when user dismisses or adds new post
  const dismissPost = (): void => {
    setNewPostText("");
    setImgPrevievSrc("");
    setUserImage(undefined);
    setShowModal(false);
    setYTLink("");
    setIfLinkIsChoosen(false);
    setAddPostIconClicked(false);
    setRawImageBlob(undefined);
    setPostLoading(false);
    setLikeType("heart");
    setSpoiler(false);
    setImgLock(false);
  };
  const editPost = (): void => {
    setShowModal(false);
  };
  const handlePost = async () => {
    setImgLock(true);
    setPostLoading(true);
    const format = "DD.MM.YYYY, HH:mm:ss";
    const postDate: string = moment(new Date()).format(format);
    let imageUrl: string = "";
    let fileType: string = "";
    if (rawImageBlob !== undefined) {
      await uploadUserImageToStorageBucket(postDate, rawImageBlob);
      await downloadImageIfPostHasOne(postDate).then((item) => {
        imageUrl = item;
      });
    }
    const hashtagArray: string[] = checkIfTextHaveHashtags(newPostText);
    const loweredCaseHashtagArray: string[] = hashtagArray.map((item) => {
      return item.toLowerCase();
    });
    const uniqueHashtagArray = uniq(loweredCaseHashtagArray);
    checkFileType(rawImageBlob)
      ? (fileType = "image")
      : (fileType = "uservideo");
    const userObjForFirebase: peopleThatLikedInterface = {
      Login: currentlyLoggedInUser.Login as string,
      Avatar: currentlyLoggedInUser.Avatar as string,
      type: likeType,
    };
    addNewPostIntoDataBase(
      postType,
      currentlyLoggedInUser,
      newPostText,
      1,
      [userObjForFirebase],
      postDate,
      Timestamp.fromDate(new Date()),
      uniqueHashtagArray,
      uuidv4(),
      false,
      imageUrl,
      fileType,
      YTLink,
      spoiler
    );
    dismissPost();
  };
  return (
    <>
      {addPostIconClicked ? (
        <div className="createPost" ref={createPostRef}>
          <div className="NewPostBody">
            <TextareAutosize
              autoFocus={true}
              maxLength={250}
              ref={textareaRef}
              maxRows={3}
              onChange={handleChange}
              value={newPostText}
              name="Text"
              placeholder="Describe your Current Mood"
            />
          </div>
          <div className="NewPostFeatures">
            {isLinkChoosen && (
              <div className="YoutubeUrl">
                <Image
                  onClick={() => {
                    setYTLink("");
                    setIfLinkIsChoosen(false);
                  }}
                  className="BackArrow"
                  width={32}
                  height={32}
                  src={BackArrowIcon}
                  alt="Go back and select Post Type Again"
                />
                <input
                  type="text"
                  placeholder="Paste YT Link"
                  onChange={(event) =>
                    setYTLink(() => (event.target.name = event.target.value))
                  }
                  value={YTLink}
                />
              </div>
            )}
            {!isLinkChoosen && (
              <div className="CanBeAddedContainer">
                Is Image Uploaded:
                {rawImageBlob !== undefined &&
                userImage &&
                imgPrevievSrc !== "" &&
                !isLinkChoosen
                  ? "✅"
                  : "❌"}
              </div>
            )}
            <div className="PictureAndSubmit">
              <div className="Picture">
                {!isLinkChoosen && <FileUploader onFileSelect={setUserImage} />}
                <UrlUploader
                  isLinkChoosen={isLinkChoosen}
                  setIfLinkIsChoosen={setIfLinkIsChoosen}
                  onClick={() => {
                    setRawImageBlob(undefined);
                    setImgPrevievSrc("");
                    setUserImage(undefined);
                  }}
                />
              </div>
            </div>
          </div>
          {((YTLink !== "" && newPostText.replaceAll(/\s/g, "").length > 0) ||
            userImage !== undefined) && (
            <div className="CssButtonContainer">
              <hr />
              <div className="wrapperForPrevievButton">
                <button
                  onClick={() => {
                    //TODO Tutaj dodac sprawdzanie czy jest link wybrany i wtedy podjac odpowiednia akcje
                    if (isLinkChoosen) {
                      if (validateYouTubeUrl(YTLink || "") === false) {
                        return setShowAlert(true);
                      } else {
                        return setShowModal(true);
                      }
                    } else if (rawImageBlob && imgPrevievSrc !== "") {
                      return setShowModal(true);
                    }
                  }}
                  className="PrevievInModal"
                >
                  See your Own Post
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <AddPostIcon
          setAddPostIconClicked={setAddPostIconClicked}
          theme={themeCTX.theme}
        />
      )}
      <Modal show={showModal} centered={true}>
        <ModalBody>
          <div className="ListWrapper">
            <div className="Post">
              <div className="PostHeader">
                <div className="NameAndDescription">
                  {currentlyLoggedInUser.Avatar && (
                    <img
                      src={currentlyLoggedInUser.Avatar}
                      className="userAvatar"
                      alt="Your Icon"
                    />
                  )}
                  <span>{currentlyLoggedInUser.Login}</span>
                </div>
              </div>
              <div className="PostBody">
                <div className="PostText">{newPostText}</div>
                <div className="PostPhoto">
                  {postLoading ? (
                    <LoadingRing colorVariant={"black"} />
                  ) : !isLinkChoosen ? (
                    <div className="userImageContainer">
                      {checkFileType(rawImageBlob) ? (
                        <img
                          src={imgPrevievSrc}
                          alt={"Preview Photo"}
                          style={{ width: "100%", height: "100%" }}
                        />
                      ) : (
                        <video controls src={imgPrevievSrc} />
                      )}
                    </div>
                  ) : (
                    <LiteYouTubeEmbed
                      id={getLinkId(YTLink as string).id}
                      params={getLinkId(YTLink as string).timestamp || ""}
                      title="YouTube video player"
                      adNetwork={false}
                      playlist={false}
                      noCookie={true}
                      webp={true}
                    ></LiteYouTubeEmbed>
                  )}
                </div>
                <div className="ReactionContainer">
                  <span>Choose your Reaction</span>
                  <span className="ImagesContainer">
                    {allReactions.map((x) => (
                      <figure
                        className={
                          likeType === x.likeType ? "highlightedReaction" : ""
                        }
                        onClick={() => setLikeType(x.likeType)}
                        key={x.likeType}
                      >
                        <Image src={x.imageData.src} height={32} width={32} />
                      </figure>
                    ))}
                  </span>
                </div>
                {!isLinkChoosen && (
                  <Checkbox
                    onChange={() => setSpoiler((prev) => !prev)}
                    checked={spoiler}
                  >
                    Spoiler
                  </Checkbox>
                )}
              </div>
            </div>
          </div>
        </ModalBody>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={
              !imglock
                ? handlePost
                : () => {
                    return console.log("Blokada");
                  }
            }
          >
            Post
          </Button>
          <Button variant="secondary" onClick={editPost}>
            Edit
          </Button>
          <Button variant="secondary" onClick={dismissPost}>
            Dismiss
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="InvalidLinkAlert">
        <Alert
          variant="danger"
          className="Alert"
          onClose={() => setShowAlert(false)}
          dismissible
          show={showAlert}
        >
          Provide us with a valid Youtube URL
        </Alert>
      </div>
    </>
  );
};
const checkFileType = (rawImageBlob: File | Blob | undefined) => {
  let returnVal: boolean = true;
  switch (rawImageBlob?.type) {
    case "image/png":
    case "image/jpg":
    case "image/gif":
      break;
    case "video/mp4":
    case "video/ogg":
    case "video/webm":
      returnVal = false;
      break;
  }
  return returnVal;
};
