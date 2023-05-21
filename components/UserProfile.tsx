import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  updateDoc,
  writeBatch,
} from "@firebase/firestore";
import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  currentlyLoggedInUserContext,
  setCurrentlyLoggedInUserContext,
  UserData,
} from "../utils/interfaces";
import { db, storageRef } from "../firebase/firebase";
import { LoadingRing } from "./LoadingRing";
import { Post, PostPropsInteface } from "./Post";
import ChangeIcon from "../public/change.svg";
import Yes from "../public/yes.png";
import No from "../public/no.png";
import ChangeBackgroundIcon from "../public/backgroundicon.png";
import Dropzone, { useDropzone } from "react-dropzone";
import { getDownloadURL, ref, uploadBytes } from "@firebase/storage";
import { Dropdown, Menu, message, Switch } from "antd";
import Link from "next/link";

import TextareAutosize from "react-textarea-autosize";
import { query, where, orderBy } from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import nProgress from "nprogress";
import { userPrefferedPostType } from "../utils/interfaces";
import { useRouter } from "next/router";

export const queryPostByDate = async (key: string) => {
  const ref = doc(db, "Posts", `${key}`);
  const highlightedPost = await getDoc(ref);
  return highlightedPost.data() as PostPropsInteface;
};
export const queryPostByLikeCount = async (userLogin: string) => {
  const PostCollection = collection(db, "Posts");
  const q = query(
    PostCollection,
    where("userThatPostedThis.Login", "==", `${userLogin}`),
    orderBy("likeCount", "desc"),
    limit(1)
  );
  const MostLikedPostData: PostPropsInteface[] = [];
  const MostLikedPost = await getDocs(q);
  MostLikedPost.forEach((item) => {
    MostLikedPostData.push(item.data() as PostPropsInteface);
  });
  return MostLikedPostData[0];
};
const showUserMessage = (
  type: "error" | "success",
  content: string,
  duration?: number
) => {
  switch (type) {
    case "error":
      message.error(content, duration);
      break;
    case "success":
      message.success(content, duration);
      break;
  }
};
const applyChanges = async (
  user: string,
  color: string,
  userPrefferedPost: userPrefferedPostType | null,
  Description: string,
  Avatar: File | null
) => {
  const userRef = doc(db, "Users", user);
  const fileRef = ref(storageRef, `${user}`);

  if (Avatar) {
    nProgress.start();
    await uploadBytes(fileRef, Avatar);
    const uploadedFile = await getDownloadURL(fileRef);
    nProgress.inc();
    const newBatch = writeBatch(db);
    newBatch.update(userRef, {
      BackgroundColor: color,
      userPrefferedPost: userPrefferedPost,
      Description: Description,
      Avatar: uploadedFile,
    });
    newBatch.update(doc(db, "Utility", "UserAvatars"), {
      [user]: uploadedFile,
    });
    await newBatch.commit();
    nProgress.done();
  } else {
    nProgress.start();
    await updateDoc(userRef, {
      BackgroundColor: color,
      userPrefferedPost: userPrefferedPost,
      Description: Description,
    });
    nProgress.done();
  }
};
const uploadUserImageToStorageBucket = async (
  key: string,
  img: Blob | File
) => {
  const pathRef = ref(storageRef, "UserProfileImages");
  const fileRef = ref(pathRef, `${key}`);
  await uploadBytes(fileRef, img);
};
export interface UserProfileProps {
  userDataFromNextJS: UserData;
}
const UserProfile: React.FC<UserProfileProps> = ({ userDataFromNextJS }) => {
  const router = useRouter();
  const [isContentLoaded, setIsContentLoaded] = useState<boolean>(false);
  const [displayBGImage, setDisplayBGImage] = useState<boolean>(true);
  const [shouldBackgroundCover, setshouldBackgroundCover] =
    useState<boolean>(false);
  const [profileIsBeingChanged, setProfileIsBeingChanged] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const currentlyLoggedInUser = useContext(currentlyLoggedInUserContext);
  const setCurrentlyLoggedInUser = useContext(setCurrentlyLoggedInUserContext);
  const [highlightedPost, sethighlightedPost] =
    useState<PostPropsInteface | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userPrefferedPost, setUserPrefferedPost] =
    useState<userPrefferedPostType | null>(null);
  const profilePathLogin = router.query.login as string;
  const [profileColorValue, setprofileColorValue] = useState<string>(
    userData?.BackgroundColor || ""
  );
  const [userDescription, setUserDescription] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [potentialNewAvatar, setPotentialNewAvatar] = useState<File | null>(
    null
  );
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setprofileColorValue(value);
  };
  const handleSwitchChange = (state: boolean) => {
    state ? setDisplayBGImage(true) : setDisplayBGImage(false);
  };
  useEffect(() => {
    if (userData) {
      setprofileColorValue(userData.BackgroundColor as string);
      setIsContentLoaded(true);
    }
  }, [userData]);
  const onDrop = useCallback(
    async (acceptedFiles: any) => {
      if (acceptedFiles[0].size > 8000000) {
        return alert("Your File is bigger than 8MB Try to upload smaller one");
      }
      const fileRef = ref(
        storageRef,
        `UserProfileImages/${currentlyLoggedInUser.Login}`
      );
      setIsLoading(true);
      nProgress.start();
      const userRef = doc(db, "Users", `${currentlyLoggedInUser.Login}`);
      await uploadUserImageToStorageBucket(
        currentlyLoggedInUser.Login as string,
        acceptedFiles[0]
      );
      nProgress.inc();
      const myRef = await getDownloadURL(fileRef);
      nProgress.inc();
      await updateDoc(userRef, {
        BackgroundImage: myRef,
      });
      nProgress.inc();
      setCurrentlyLoggedInUser!((prevState: UserData) => {
        return { ...prevState, BackgroundImage: myRef };
      });
      nProgress.done();
      const objectWrapper: UserData = {
        ...userData!,
        BackgroundImage: myRef,
      };
      const img = new Image();
      img.src = myRef;
      img.onload = () => {
        const proportion = window.innerWidth / img.width;
        proportion > 2.5
          ? setshouldBackgroundCover(false)
          : setshouldBackgroundCover(true);
      };
      setUserData(objectWrapper);
      setDisplayBGImage(true);
      setIsLoading(false);
    },
    [currentlyLoggedInUser, setCurrentlyLoggedInUser, userData]
  );
  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/jpeg,image/png",
    onDrop,
  });
  useEffect(() => {
    //Function to get UserProfile data invoked on mount
    setUserData(userDataFromNextJS);
    setUserPrefferedPost(
      userDataFromNextJS.userPrefferedPost as userPrefferedPostType
    );
    setUserDescription(userDataFromNextJS.Description as string);
    setUserAvatar(userDataFromNextJS.Avatar as string);
    nProgress.done();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query]);
  useEffect(() => {
    if (userData?.BackgroundImage !== "") {
      const img = new Image();
      img.src = userData?.BackgroundImage as string;
      img.onload = () => {
        const proportion = window.innerWidth / img.width;
        proportion > 2.5
          ? setshouldBackgroundCover(false)
          : setshouldBackgroundCover(true);
      };
    }
  }, [userData]);
  const setPostForUser = async () => {
    const postCollectionRef = collection(db, "Posts");
    if ((userData?.postCount as number) > 0 && userData) {
      switch (userPrefferedPost) {
        case "Latest Post":
          const latestPost = query(
            postCollectionRef,
            where("userThatPostedThis.Login", "==", `${userData?.Login}`),
            orderBy("timestamp", "desc"),
            limit(1)
          );
          await getDocs(latestPost).then((x) => {
            sethighlightedPost(x.docs[0].data() as PostPropsInteface);
          });
          break;
        case "Most Liked":
          if (userData.Login) {
            queryPostByLikeCount(userData.Login as string).then((data) => {
              sethighlightedPost(data);
            });
          }
          break;
        case "Oldest Post":
          const oldestPost = query(
            postCollectionRef,
            where("userThatPostedThis.Login", "==", `${userData?.Login}`),
            orderBy("timestamp", "asc"),
            limit(1)
          );
          await getDocs(oldestPost).then((x) => {
            sethighlightedPost(x.docs[0].data() as PostPropsInteface);
          });
          break;
        case "Pinned":
          const pinnedPost = userData.pinnedPost;
          if (pinnedPost && pinnedPost !== "") {
            queryPostByDate(pinnedPost).then((data) => {
              sethighlightedPost(data);
            });
          }
          break;
        default:
          console.error(
            "An error has occured UserProfile Component swich statement"
          );
      }
    }
  };
  useEffect(() => {
    if (profileIsBeingChanged) {
      setPostForUser();
    } else if (userPrefferedPost !== null) {
      setPostForUser();
    }
  }, [userPrefferedPost]);
  const bestPostMenu = (
    <Menu>
      <Menu.Item key="0" onClick={() => setUserPrefferedPost("Latest Post")}>
        <span>Latest Post</span>
      </Menu.Item>
      <Menu.Item key="1" onClick={() => setUserPrefferedPost("Most Liked")}>
        <span>Most Liked</span>
      </Menu.Item>
      <Menu.Item key="2" onClick={() => setUserPrefferedPost("Oldest Post")}>
        <span>Oldest Post</span>
      </Menu.Item>
      <Menu.Item key="3" onClick={() => setUserPrefferedPost("Pinned")}>
        <span>Pinned</span>
      </Menu.Item>
    </Menu>
  );
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { value } = e.target;
    setUserDescription(value);
  };
  return isContentLoaded ? (
    <>
      <div
        className={`BackGroundLayer ${
          shouldBackgroundCover ? "CoverEntireBackground" : ""
        }`}
        style={{
          backgroundColor: profileIsBeingChanged
            ? profileColorValue
            : userData?.BackgroundColor,
          background: displayBGImage
            ? `url(${userData?.BackgroundImage})`
            : profileIsBeingChanged
            ? profileColorValue
            : userData?.BackgroundColor,
        }}
      >
        <div className="UserInfoContainer">
          {!profileIsBeingChanged
            ? currentlyLoggedInUser.Login === userData?.Login && (
                <div className="changeProfile">
                  <img
                    src={ChangeIcon.src}
                    alt={"Change Your Profile settings"}
                    onClick={() => {
                      setProfileIsBeingChanged(!profileIsBeingChanged);
                    }}
                  />
                </div>
              )
            : null}
          {profileIsBeingChanged && (
            <div className="AcceptOrDiscardChanges">
              {!isLoading ? (
                <div {...getRootProps()}>
                  <img src={ChangeBackgroundIcon.src} alt="Change Background" />
                  <input {...getInputProps()} />
                </div>
              ) : (
                <div style={{ right: "80px" }}>
                  <LoadingRing colorVariant="black" />
                </div>
              )}
              <img
                src={Yes.src}
                alt="ApplyChanges"
                onClick={async () => {
                  if (!userDescription) {
                    return showUserMessage(
                      "error",
                      "User Description cannot be empty"
                    );
                  }
                  await applyChanges(
                    currentlyLoggedInUser.Login as string,
                    profileColorValue,
                    userPrefferedPost,
                    userDescription,
                    potentialNewAvatar
                  );
                  const objectWrapper: UserData = {
                    ...userData!,
                    BackgroundColor: profileColorValue,
                    userPrefferedPost: userPrefferedPost,
                    Description: userDescription,
                    Avatar: userAvatar,
                  };
                  setUserData(objectWrapper);
                  setProfileIsBeingChanged(false);
                  showUserMessage(
                    "success",
                    "You're Profile was changed successfully ❤",
                    2
                  );
                }}
              />
              <img
                src={No.src}
                alt="DiscardChanges"
                onClick={() => {
                  setProfileIsBeingChanged(false);
                  setUserDescription(userData?.Description as string);
                  setUserAvatar(userData?.Avatar as string);
                  setPotentialNewAvatar(null);
                }}
              />
            </div>
          )}
          {profileIsBeingChanged ? (
            <div className={"ChangeColorContainer"}>
              <input
                type="color"
                value={profileColorValue}
                onChange={handleChange}
                onClick={() => {
                  setDisplayBGImage(false);
                }}
              />
            </div>
          ) : (
            <div className={"ChangeColorContainer"}>
              <Switch
                unCheckedChildren={"Color"}
                checkedChildren={"Image"}
                onChange={handleSwitchChange}
                defaultChecked
                checked={displayBGImage}
              />
            </div>
          )}

          <Dropzone
            disabled={!profileIsBeingChanged}
            onDrop={(acceptedFiles, rejectedFiles) => {
              if (rejectedFiles.length > 0) {
                return showUserMessage(
                  "error",
                  "Something is wrong with your file check it's type"
                );
              }
              if (acceptedFiles[0].size > 10000000) {
                return showUserMessage(
                  "error",
                  "Your File is bigger than 10MB Try to upload smaller one"
                );
              }
              if (acceptedFiles.length > 0) {
                setUserAvatar(URL.createObjectURL(acceptedFiles[0]));
                setPotentialNewAvatar(acceptedFiles[0]);
              }
            }}
            multiple={false}
            accept={"image/png,image/jpeg,image/jpg"}
          >
            {({ getRootProps, getInputProps }) => (
              <div
                className={`UserImage  ${
                  profileIsBeingChanged && "ChangeImage"
                }`}
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                <img src={`${userAvatar}`} alt={"Visited profile Avatar"} />

                {profileIsBeingChanged && (
                  <div className="FAContainer">
                    <FontAwesomeIcon icon={faImage} />
                  </div>
                )}
              </div>
            )}
          </Dropzone>

          <div className="UserNameAndDescription">
            <span>{userData?.Login}</span>
            {profileIsBeingChanged ? (
              <TextareAutosize
                maxRows={3}
                autoFocus={false}
                style={{ display: "inline" }}
                maxLength={100}
                onChange={(e) => {
                  handleDescriptionChange(e);
                }}
                value={userDescription}
                name="Text"
                placeholder="Your Profile Description"
              />
            ) : (
              <div>{userData?.Description}</div>
            )}
          </div>
          <div className="LatestPost">
            {profileIsBeingChanged ? (
              // @ts-ignore
              <Dropdown
                overlay={bestPostMenu}
                trigger={["hover"]}
                placement="topCenter"
              >
                <span className="biggerText" style={{ color: "blue" }}>
                  {userPrefferedPost}
                </span>
              </Dropdown>
            ) : (
              <span className="biggerText">{userPrefferedPost}</span>
            )}
            {highlightedPost ? (
              <>
                <Link href={`/users/${userData?.Login}/Posts`}>
                  <button className="VievAllPosts">View all user Posts</button>
                </Link>
                <div className="postContainerOnUserProfile">
                  <Post
                    date={highlightedPost?.date}
                    key={highlightedPost.date}
                  />
                </div>
              </>
            ) : (
              <span className="biggerText">User didnt add a Post yet 😭</span>
            )}
          </div>
          <div className="Stats">
            <span>
              <h3>UserPosts</h3>
              <span>{userData?.postCount}</span>
            </span>
          </div>
        </div>
      </div>
    </>
  ) : (
    <div className="LoaderBox">
      <LoadingRing colorVariant={"white"} />
    </div>
  );
};
export default UserProfile;
