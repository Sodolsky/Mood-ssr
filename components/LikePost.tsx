import Tippy from "@tippyjs/react";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { isEqual } from "lodash";
import moment from "moment";
import React, { useEffect } from "react";
import { useState } from "react";
import {
  likeTypes,
  peopleThatLikedInterface,
  UserData,
} from "../utils/interfaces";
import { db } from "../firebase/firebase";
import { NotificationInterface } from "../utils/interfaces";
import heart from "../public/heart.png";
import poop from "../public/poop.png";
import laughing from "../public/laughing.png";
import crying from "../public/crying.png";
import questionMark from "../public/question-mark.png";
import heartOutline from "../public/heartoutline.png";
import poopOutline from "../public/poopoutline.png";
import laughingOutline from "../public/laughingoutline.png";
import cryingOutline from "../public/cryingOutline.png";
import questionMarkOutline from "../public/question-markOutline.png";
import {
  playLikeAnimation,
  removeLikeClass,
  removeUserFromLikedArray,
} from "./likeFunctions";
import Link from "next/link";
import { UserForFirebase } from "./Post";
import { StaticImageData } from "next/image";
export const getProperImage = (
  isLiked: boolean,
  likePostType: likeTypes
): StaticImageData => {
  switch (likePostType) {
    case "heart":
      return isLiked ? heart : heartOutline;
    case "laughing":
      return isLiked ? laughing : laughingOutline;
    case "poop":
      return isLiked ? poop : poopOutline;
    case "crying":
      return isLiked ? crying : cryingOutline;
    case "questionMark":
      return isLiked ? questionMark : questionMarkOutline;
    default:
      return isLiked ? heart : heartOutline;
  }
};
interface LikePostInterface {
  match: boolean;
  currentlyLoggedInUser: UserData;
  poepleThatLiked: peopleThatLikedInterface[];
  date: string;
  postId: string;
  userThatPostedLogin: string;
}
export const savePoepleThatLikedPost = async (
  key: string,
  poepleThatLikedArray: peopleThatLikedInterface[],
  postId: string,
  login: string,
  userThatPostedLogin: string
) => {
  const postRef = doc(db, "Posts", `${key}`);
  const userRef = doc(db, "Notifications", `${userThatPostedLogin}`);
  if (login !== userThatPostedLogin) {
    const NotificationObj: NotificationInterface = {
      postId: postId,
      type: "like",
      whoDid: login,
      date: moment(new Date()).unix(),
    };
    await updateDoc(userRef, {
      Notifications: arrayUnion(NotificationObj),
    });
  }
  await updateDoc(postRef, {
    poepleThatLiked: poepleThatLikedArray,
  });
};
export const LikePost: React.FC<LikePostInterface> = (props) => {
  const { match, currentlyLoggedInUser, date, postId, userThatPostedLogin } =
    props;
  let { poepleThatLiked } = props;
  const likeRef = React.useRef<any>(null);
  const [likeType, setLikeType] = useState<likeTypes>(
    poepleThatLiked.find((x) => {
      return isEqual(x.Login, currentlyLoggedInUser.Login);
    })?.type ?? "heart"
  );
  const isLiked = poepleThatLiked.some((x) => {
    return isEqual(x.Login, currentlyLoggedInUser.Login);
  });
  const [likes, setLikes] = useState<number>(0);
  const handleLikeChange = (
    event: React.MouseEvent<HTMLImageElement, MouseEvent>,
    likeTypelocal: likeTypes
  ) => {
    event.preventDefault();

    const baseObj: UserForFirebase = {
      Login: currentlyLoggedInUser.Login as string,
      Avatar: currentlyLoggedInUser.Avatar as string,
    };
    if (!isLiked) {
      //?Here we handle liking post logic, doesn't matter what type of reaction
      const fullObj: peopleThatLikedInterface = {
        ...baseObj,
        type: likeTypelocal,
      };
      poepleThatLiked.push(fullObj);
      playLikeAnimation(likeRef);
    } else {
      if (likeType === likeTypelocal) {
        //?Here we handle removing user reaction when the same type is selected.
        const fullObj: peopleThatLikedInterface = {
          ...baseObj,
          type: likeTypelocal,
        };
        removeLikeClass(likeRef);
        removeUserFromLikedArray(poepleThatLiked, fullObj);
      }
      //?Here we handle chaging user reaction type.
      poepleThatLiked = poepleThatLiked.map((x) =>
        x.Login !== (currentlyLoggedInUser.Login as string)
          ? x
          : { ...x, type: likeTypelocal }
      );
    }
    setLikeType(likeTypelocal);
    saveLikedUsers();
  };
  const saveLikedUsers = (): void => {
    savePoepleThatLikedPost(
      date,
      poepleThatLiked,
      postId,
      currentlyLoggedInUser.Login as string,
      userThatPostedLogin
    );
    setLikes(poepleThatLiked.length);
  };
  useEffect(() => {
    setLikes(poepleThatLiked.length);
  }, [poepleThatLiked]);
  return (
    <>
      <Tippy
        interactive={true}
        delay={300}
        zIndex={10001}
        placement="top"
        allowHTML={true}
        animation={"scale"}
        content={
          <div className="likeTypesContainer">
            <img
              src={
                isLiked && likeType === "heart" ? heartOutline.src : heart.src
              }
              alt="Heart Icon"
              onClick={(e) => handleLikeChange(e, "heart")}
            />
            <img
              src={isLiked && likeType === "poop" ? poopOutline.src : poop.src}
              alt="Poop Emoji"
              onClick={(e) => handleLikeChange(e, "poop")}
            />
            <img
              src={
                isLiked && likeType === "laughing"
                  ? laughingOutline.src
                  : laughing.src
              }
              onClick={(e) => handleLikeChange(e, "laughing")}
              alt="Laughing Face"
            />
            <img
              src={
                isLiked && likeType === "crying"
                  ? cryingOutline.src
                  : crying.src
              }
              onClick={(e) => handleLikeChange(e, "crying")}
              alt="Crying Face"
            />
            <img
              src={
                isLiked && likeType === "questionMark"
                  ? questionMarkOutline.src
                  : questionMark.src
              }
              onClick={(e) => handleLikeChange(e, "questionMark")}
              alt="Question Mark"
            />
          </div>
        }
      >
        <div>
          <img
            className="HeartToLike"
            ref={likeRef}
            src={getProperImage(isLiked, likeType).src}
            onClick={(event) => {
              handleLikeChange(event, likeType);
            }}
            alt="Place where you love someone post"
          />
        </div>
      </Tippy>
      {match && (
        <Tippy
          interactive={true}
          delay={150}
          zIndex={10000}
          placement={"left"}
          content={
            <div className="tippyLikes">
              {poepleThatLiked.map((item) => {
                return (
                  <div className="LikedPostContainer" key={item.Login}>
                    <img src={item.Avatar as string} alt="User Avatar" />
                    <img
                      src={getProperImage(true, item.type).src}
                      alt="likeType"
                    />
                    <Link href={`/users/${item.Login}`}>
                      <span>{item.Login}</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          }
          allowHTML={true}
          animation={"scale"}
          appendTo={"parent"}
        >
          <div>Reactions</div>
        </Tippy>
      )}{" "}
      {likes}
    </>
  );
};
