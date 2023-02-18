import * as React from "react";
import "tippy.js/animations/scale.css";
import {
  currentlyLoggedInUserContext,
  likeTypes,
  peopleThatLikedInterface,
  themeContext,
  UserData,
} from "../utils/interfaces";
import { getLinkId } from "./ValidateYoutubeUrl";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { useState } from "react";
import { useEffect } from "react";
import { useContext } from "react";
import { getRandomInt } from "./likeFunctions";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storageRef } from "../firebase/firebase";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "@firebase/firestore";
import { useMediaQuery } from "@react-hook/media-query";
import { CommentInterface } from "./CreatePost";
import { CommentComponent } from "./CommentComponent";
import moment from "moment";
import { getProperImage, LikePost } from "./LikePost";
import { LazyLoadedImage } from "./LazyLoadedImage";
import Link from "next/link";
import { Image, Input, InputRef, message, Modal, Spin } from "antd";
import SkeletonPost from "./SkeletonPost";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import { NotificationInterface } from "../utils/interfaces";
import { Accordion } from "react-bootstrap";
import { CustomToggle } from "./CustomToggle";
import MoreIcon from "../public/more.png";
import EmptyStarIcon from "../public/emptyStar.png";
import StarIcon from "../public/star.png";
import PinIcon from "../public/pin.png";
import LinkIcon from "../public/link.png";
import CommentIcon from "../public/Comment.svg";
import { has } from "lodash";
import AddImageToPostIcon from "../public/insertpic.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWindowClose } from "@fortawesome/free-solid-svg-icons";
import { v4 } from "uuid";
import { default as NextImage } from "next/image";
import { toast } from "react-toastify";
import { increment } from "firebase/firestore";
import { ShowSpoilerButton } from "./ShowSpoilerButton";
export const Post: React.FC<{ date: string } | PostPropsInteface> = (props) => {
  const match = useMediaQuery("only screen and (min-width:450px");
  const postRef = React.useRef<HTMLDivElement | null>(null);
  const commentTextInputRef = React.useRef<InputRef | null>(null);
  const submitCommentButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const [wasFadedIn, setWasFadedIn] = useState<boolean>(false);
  const [showModal, setshowModal] = useState(false);
  const [wasShowSpoilerClicked, setWasShowSpoilerClicked] =
    useState<boolean>(false);
  const themeCTX = useContext(themeContext);
  //We are defining date as another variable to avoid name collison when passing props to comment element
  const parentDate = props.date;

  const myDate = moment(parentDate, "DD-MM-YYYY  HH:mm:ss").toDate();
  const [commentIsBeingAdded, setCommentIsBeingAdded] =
    useState<boolean>(false);
  const [allComments, setAllComments] = useState<CommentInterface[]>([]);
  const [topComment, setTopComment] = useState<null | CommentInterface>(null);
  const [commentVal, changeCommentVal] = useState<{
    text: string;
    img: string;
    imgBlob: File | Blob | null;
  }>({ text: "", img: "", imgBlob: null });
  const [commentCount, setCommentCount] = useState<number>(0);
  const [postData, setPostData] = useState<Omit<
    PostPropsInteface,
    "date"
  > | null>(null);
  const [addingCommentSelected, setIfAddingCommentIsSelected] =
    useState<boolean>(false);
  const firstRender = React.useRef<boolean>(true);
  interface counterInterface {
    [key: string]: number;
  }
  const reactionsCounter: counterInterface = {};
  postData?.poepleThatLiked.forEach((x) => {
    const key = x.type ?? "heart";
    reactionsCounter[key] = (reactionsCounter[key] || 0) + 1;
  });
  // Here we are fetching the comments data and setting up top comment
  useEffect(() => {
    let PostSubscription = () => {};
    if (has(props, "URL")) {
      setPostData(props as PostPropsInteface);
    } else {
      const refForPost = doc(db, "Posts", `${props.date}`);
      PostSubscription = onSnapshot(refForPost, (doc) => {
        const data = doc.data() as PostPropsInteface;
        setPostData(data);
      });
    }
    const refForComments = collection(db, "Posts", `${props.date}`, "comments");
    const Unsubscribe = onSnapshot(refForComments, (doc) => {
      if (doc.docs.length > 0) {
        const arrayForSave: CommentInterface[] = [];
        doc.docs.forEach((item) => {
          const comment = {
            ...(item.data() as CommentInterface),
            id: item.id,
          };
          arrayForSave.push(comment);
        });
        setAllComments(arrayForSave);
        setCommentCount(arrayForSave.length);
        if (firstRender.current) {
          firstRender.current = false;
          if (arrayForSave.length === 0) {
            return;
          }
          if (arrayForSave.length === 1) {
            setTopComment(arrayForSave[0]);
          } else {
            // We need to find the highest amount of likes in comments array
            arrayForSave.sort((a: CommentInterface, b: CommentInterface) => {
              return (
                b.usersThatLikedThisComment.length -
                a.usersThatLikedThisComment.length
              );
            });
            //Then we need to estimate if there are more comments that have the same amount of likes
            const numberOfHighestLikeComments = arrayForSave.filter((item) => {
              return (
                item.usersThatLikedThisComment.length ===
                arrayForSave[0].usersThatLikedThisComment.length
              );
            }).length;
            //If there is only one comment with high amount of likes we set it as a topComment
            if (numberOfHighestLikeComments === 1) {
              setTopComment(arrayForSave[0]);
            } else {
              //If not we randomise the top comment from highest amount of like comments
              const rand = getRandomInt(0, numberOfHighestLikeComments);
              setTopComment(arrayForSave[rand]);
            }
          }
        }
      }
    });
    setWasFadedIn(true);
    return () => {
      Unsubscribe();
      PostSubscription();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (postRef.current) {
      postRef.current.onpaste = function (event) {
        if (!addingCommentSelected) return;
        if (event.clipboardData) {
          var items = event.clipboardData.items;
          for (var index in items) {
            var item = items[index];
            if (item.kind === "file") {
              var blob = item.getAsFile();
              var reader = new FileReader();
              reader.onload = function (event) {
                if (event.target) {
                  // console.log(event.target.result?.toString()); // data url!
                }
              };
              if (blob) {
                if (blob.type.split("/")[0] !== "image")
                  return alert(
                    "We are sorry your current file format is not supported"
                  );
                if (currentlyLoggedInUser.userRole === "Normal") {
                  if (blob.size > 15000000) {
                    return alert(
                      "Your File is bigger than 15MB Try to paste smaller one"
                    );
                  }
                }
                const data = URL.createObjectURL(blob);
                changeCommentVal((prev) => ({
                  ...prev,
                  imgBlob: blob,
                  img: data,
                }));
              }
            }
          }
        }
      };
    }
    if (commentTextInputRef.current && submitCommentButtonRef.current) {
      commentTextInputRef.current.input?.addEventListener(
        "keydown",
        (event) => {
          if (event.key === "Enter") {
            submitCommentButtonRef.current?.click();
          }
        }
      );
    }
  }, [addingCommentSelected]);

  const pinPost = async (postDate: string, userLogin: string) => {
    const userRef = doc(db, "Users", userLogin);
    try {
      await updateDoc(userRef, {
        pinnedPost: postDate,
      });
      showSuccessMesssage("Pin");
    } catch (error) {
      toast.error("An error occured while trying to pin a Post");
    }
  };
  const currentlyLoggedInUser = useContext(currentlyLoggedInUserContext);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    changeCommentVal((prev) => ({ ...prev, text: val }));
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files![0];
    if (file.type.split("/")[0] !== "image")
      return alert("We are sorry your current file format is not supported");
    if (file.size > 15000000) {
      return alert("Your File is bigger than 15MB Try to upload smaller one");
    } else {
      changeCommentVal((prev) => ({
        ...prev,
        img: URL.createObjectURL(file),
        imgBlob: file,
      }));
    }
  };
  return !postData ? (
    <SkeletonPost />
  ) : (
    <div className={`ListWrapper ${wasFadedIn ? "fadeIn" : ""}`} ref={postRef}>
      <div
        className={`Post ${postData.hallOfFame ? "GoldenBorder" : ""} ${
          themeCTX.theme === "dark" && "PostDark"
        }`}
      >
        <div className="PostHeader">
          <Accordion className="LinkToPost">
            <Accordion.Item eventKey="0">
              <CustomToggle eventKey="0">
                <img src={MoreIcon.src} alt="Show More Options" />
              </CustomToggle>
              <Accordion.Body className="ActionsBody">
                <LazyLoadedImage
                  src={LinkIcon.src}
                  alt={"Link Post"}
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.protocol}//${window.location.host}/explore/posts/${postData.URL}`
                    );
                    showSuccessMesssage("Link");
                  }}
                />
                <LazyLoadedImage
                  src={PinIcon.src}
                  alt={"Pin Post"}
                  onClick={() =>
                    pinPost(props.date, currentlyLoggedInUser.Login as string)
                  }
                />
                <LazyLoadedImage
                  alt="Add to Hall Of Fame"
                  src={postData.hallOfFame ? StarIcon.src : EmptyStarIcon.src}
                  onClick={() => {
                    //If Post is In Hall Of Fame only trusted users can unpin it
                    if (
                      postData.hallOfFame &&
                      (currentlyLoggedInUser.userRole === "Admin" ||
                        currentlyLoggedInUser.userRole === "Trusted")
                    ) {
                      handleHallOfFameChange(postData, props.date);
                    } else if (postData.hallOfFame) {
                      toast.error(
                        "Only trusted users can remove posts from Hall Of Fame."
                      );
                    } else {
                      handleHallOfFameChange(postData, props.date);
                    }
                  }}
                />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          {/* {currentlyLoggedInUser.Login === "EVILSODOL" &&
            postData?.userThatPostedThis.Login === "EVILSODOL" && (
              <img
                src={RemovePostIcon}
                alt="Click to remove your Post"
                className="DeletePost"
                onClick={() => {
                  removePost(currentlyLoggedInUser, date);
                }}
              />
            )} */}
          <div className="NameAndDescription">
            <img
              src={postData?.userThatPostedThis.Avatar}
              className="userAvatar"
              alt="Orginal Poster Avatar"
            />
            <span>
              <Link href={`/users/${postData?.userThatPostedThis.Login}`}>
                {postData?.userThatPostedThis.Login}
              </Link>
            </span>
          </div>
        </div>
        <div className="PostBody">
          <div className="PostText">
            {postData && postData.hashtags.length > 0
              ? postData?.text
                  .split(" ")
                  .map<React.ReactNode>((item) => {
                    if (
                      postData.hashtags.some(
                        (arritem) => arritem === item.toLowerCase()
                      )
                    ) {
                      let route = item.substring(1);
                      route = route.toLowerCase();
                      return (
                        <Link href={`/explore/tag/${route}`} key={item}>
                          {item.toLowerCase()}
                        </Link>
                      );
                    } else {
                      return item;
                    }
                  })
                  .reduce((prev, curr) => [prev, " ", curr])
              : postData?.text}
          </div>
          <div className="PostPhoto">
            {postData?.postType === "photo" ? (
              <div className="userImageContainer">
                {postData?.fileType === "image" ? (
                  postData.spoiler && !wasShowSpoilerClicked ? (
                    <ShowSpoilerButton
                      setWasShowSpoilerClicked={setWasShowSpoilerClicked}
                    />
                  ) : (
                    <Image src={postData?.img as string} alt={"Post Photo"} />
                  )
                ) : postData.spoiler && !wasShowSpoilerClicked ? (
                  <ShowSpoilerButton
                    setWasShowSpoilerClicked={setWasShowSpoilerClicked}
                  />
                ) : (
                  <video controls src={postData?.img} />
                )}
              </div>
            ) : (
              <LiteYouTubeEmbed
                id={getLinkId(postData.YTLink as string).id}
                params={getLinkId(postData.YTLink as string).timestamp || ""}
                title="YouTube player"
                adNetwork={false}
                playlist={false}
                webp={true}
              ></LiteYouTubeEmbed>
            )}
          </div>
          <div className="postTimerAndReactionTypesContainer">
            <span className="WhenPostWasAdded">{moment(myDate).fromNow()}</span>
            <div className="ReactionTypes" onClick={() => setshowModal(true)}>
              {Object.keys(reactionsCounter).map((x) => (
                <img
                  key={x}
                  src={getProperImage(true, x as likeTypes).src}
                  alt="Like Type"
                />
              ))}
            </div>
          </div>
          {/* <Modal
            title={"Reactions Modal"}
            visible={showModal}
            onCancel={() => setshowModal(false)}
          ></Modal> */}
          <span className="LikesAndComments">
            <LikePost
              currentlyLoggedInUser={currentlyLoggedInUser}
              match={match}
              poepleThatLiked={
                postData?.poepleThatLiked ? postData.poepleThatLiked : []
              }
              date={props.date}
              postId={postData.URL}
              userThatPostedLogin={postData.userThatPostedThis.Login as string}
            />
            <NextImage
              className="Comment on Someone's post"
              src={CommentIcon.src}
              onClick={() => {
                setIfAddingCommentIsSelected(!addingCommentSelected);
              }}
              alt="Heart"
              height={32}
              width={32}
            />
            {match && "Comments"} {commentCount}
          </span>
        </div>
        <div
          className="PostFooter"
          style={commentCount > 0 || addingCommentSelected ? bottomStyle : {}}
        >
          {!addingCommentSelected ? null : (
            <div className="addComment" key={postData.URL}>
              <Input
                type="text"
                value={commentVal.text}
                onChange={handleChange}
                placeholder="Your comment"
                ref={commentTextInputRef}
              />
              {commentIsBeingAdded ? (
                <Spin />
              ) : commentVal.img === "" ? (
                <>
                  <label htmlFor={`comment-image-uploader-${postData.URL}`}>
                    <NextImage
                      src={AddImageToPostIcon}
                      alt="Add Image to Post"
                      width={32}
                      height={32}
                      className="AddImageToCommentIcon"
                    />
                  </label>
                  <input
                    type="file"
                    id={`comment-image-uploader-${postData.URL}`}
                    name="Img"
                    accept="image/png, image/gif, image/jpeg "
                    style={{ display: "none" }}
                    onChange={handleFileInput}
                  />
                </>
              ) : (
                <FontAwesomeIcon
                  icon={faWindowClose}
                  className="FAIcon"
                  onClick={() =>
                    changeCommentVal((prev) => ({
                      ...prev,
                      img: "",
                      imgBlob: null,
                    }))
                  }
                />
              )}
              <button
                ref={submitCommentButtonRef}
                onClick={() => {
                  setCommentIsBeingAdded(true);
                  addCommentToDataBase(
                    props.date,
                    commentVal.text,
                    moment(new Date()).utc().toDate(),
                    currentlyLoggedInUser,
                    postData.userThatPostedThis.Login as string,
                    postData.URL,
                    commentVal.imgBlob,
                    setCommentIsBeingAdded
                  );
                  changeCommentVal({ text: "", img: "", imgBlob: null });
                }}
                disabled={
                  !commentVal.imgBlob
                    ? commentVal.text.length < 1
                    : !commentVal.imgBlob
                }
              >
                Add
              </button>
              {commentVal.img !== "" && (
                <figure className="ImageContainer">
                  <img src={commentVal.img} alt="Your image added to comment" />
                </figure>
              )}
            </div>
          )}
          <div className="TopComment">
            {topComment === null
              ? // <p>{randomCommentText}</p>
                null
              : !addingCommentSelected && (
                  <>
                    <CommentComponent
                      userThatAddedComment={topComment.userThatAddedComment}
                      content={topComment.content}
                      date={topComment.date}
                      usersThatLikedThisComment={
                        topComment.usersThatLikedThisComment
                      }
                      parentPostRef={props.date}
                      id={topComment.id}
                      img={topComment.img}
                    />
                  </>
                )}
          </div>
          {!addingCommentSelected ? null : (
            <>
              <div className="CommentList">
                {allComments
                  .sort((a: CommentInterface, b: CommentInterface) => {
                    return b.date - a.date;
                  })
                  .map((item) => {
                    return (
                      <CommentComponent
                        key={`${item.date}${currentlyLoggedInUser.UID}${item.content}`}
                        content={item.content}
                        date={item.date}
                        userThatAddedComment={item.userThatAddedComment}
                        usersThatLikedThisComment={
                          item.usersThatLikedThisComment
                        }
                        id={item.id}
                        parentPostRef={props.date}
                        img={item.img}
                      />
                    );
                  })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
//? Utility Functions and interfaces
const bottomStyle: React.CSSProperties = {
  borderTop: "black 1px solid",
};
export interface UserForFirebase {
  Login: string;
  Avatar: string;
}
export interface PostPropsInteface {
  postType: string;
  userThatPostedThis: UserForFirebase;
  text: string;
  fileType?: string;
  img?: string;
  YTLink?: string;
  spoiler?: boolean;
  likeCount: number;
  hashtags: string[];
  poepleThatLiked: peopleThatLikedInterface[];
  date: string;
  URL: string;
  hallOfFame: boolean;
}
export const downloadImageIfPostHasOne = async (key: string) => {
  const pathRef = ref(storageRef, "PostImages");
  const fileRef = ref(pathRef, `${key}`);
  let returnImgURL: string = "";
  await getDownloadURL(fileRef).then((downloadedImage) => {
    returnImgURL = downloadedImage;
  });
  return returnImgURL;
};
export const addCommentToDataBase = async (
  key: string,
  text: string,
  date: Date,
  userThatAddedComment: UserData,
  userThatPostedLogin: string,
  postId: string,
  img: Blob | File | null,
  setCommentIsBeingAdded: React.Dispatch<React.SetStateAction<boolean>>
) => {
  let imageUrl: string = "";
  try {
    if (img) {
      const pathRef = ref(storageRef, "CommentImages");
      const fileRef = ref(pathRef, `${v4()}`);
      await uploadBytes(fileRef, img);
      await getDownloadURL(fileRef).then((x) => (imageUrl = x));
    }
    const postRef = collection(db, "Posts", `${key}`, "comments");
    const userRef = doc(db, "Users", `${userThatAddedComment.Login}`);
    const userRefNotification = doc(
      db,
      "Notifications",
      `${userThatPostedLogin}`
    );
    const newCommentObj: CommentInterface = {
      userThatAddedComment: {
        Login: userThatAddedComment.Login as string,
        Avatar: userThatAddedComment.Avatar as string,
      },
      content: text,
      date: date,
      usersThatLikedThisComment: [],
      img: imageUrl,
    };
    const userData = await getDoc(userRef);
    const userDataObject = userData.data() as UserData;
    if (userThatPostedLogin !== userThatAddedComment.Login) {
      const NotificationObj: NotificationInterface = {
        postId: postId,
        type: "comment",
        whoDid: userThatAddedComment.Login as string,
        date: moment(new Date()).unix(),
      };
      await updateDoc(userRefNotification, {
        Notifications: arrayUnion(NotificationObj),
      });
    }
    await addDoc(postRef, newCommentObj).then(async (doc) => {
      setCommentIsBeingAdded(false);
      await updateDoc(userData.ref, {
        commentCount: increment(1),
      });
    });
  } catch (error: any) {
    console.log(error);
  }
};
const showSuccessMesssage = (
  type: "Link" | "Pin" | "HOF",
  HOFtype?: "Added" | "Removed"
) => {
  type === "Link" && message.success("Link was Copied to your clipboard 👍", 2);
  type === "Pin" && message.success("Post was selected as Pinned 👍", 2);
  type === "HOF" &&
    message.success(
      `Post was ${
        HOFtype === "Added"
          ? "added to Hall Of Fame"
          : "removed from Hall Of Fame"
      } 👍`,
      2
    );
};
export const handleHallOfFameChange = async (
  post: Omit<PostPropsInteface, "date">,
  postDate: string
) => {
  const postDocRef = doc(db, "Posts", postDate);
  try {
    await updateDoc(postDocRef, {
      hallOfFame: !post.hallOfFame,
    });
    showSuccessMesssage("HOF", post.hallOfFame ? "Removed" : "Added");
  } catch (error) {
    alert(error);
  }
};
