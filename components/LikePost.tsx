import Tippy from "@tippyjs/react";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { isEqual } from "lodash";
import moment from "moment";
import React, { useEffect } from "react";
import { useState } from "react";
import { peopleThatLikedInterface, UserData } from "../utils/interfaces";
import { db } from "../firebase/firebase";
import { NotificationInterface } from "../utils/interfaces";
import heart from "../public/heart.svg";
import heartLiked from "../public/heartLiked.svg";
import {
  playLikeAnimation,
  removeLikeClass,
  removeUserFromLikedArray,
} from "./likeFunctions";
import { UserForFirebase } from "./Post";
import Link from "next/link";

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
  const {
    match,
    currentlyLoggedInUser,
    poepleThatLiked,
    date,
    postId,
    userThatPostedLogin,
  } = props;
  const heartRef = React.useRef<any>(null);
  const isLiked = poepleThatLiked.some((x) => {
    return isEqual(x.Login, currentlyLoggedInUser.Login);
  });
  const [likes, setLikes] = useState<number>(0);
  const handleLikeChange = (
    event: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    event.preventDefault();
    const obj: peopleThatLikedInterface = {
      Login: currentlyLoggedInUser.Login as string,
      Avatar: currentlyLoggedInUser.Avatar as string,
      type: "heart",
    };
    if (
      poepleThatLiked.some((x) => {
        return isEqual(x.Login, currentlyLoggedInUser.Login);
      })
    ) {
      removeUserFromLikedArray(poepleThatLiked, obj);
      removeLikeClass(heartRef);
    } else {
      poepleThatLiked.push(obj);
      playLikeAnimation(heartRef);
      playLikeAnimation(heartRef);
    }
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
      <img
        className="HeartToLike"
        ref={heartRef}
        src={
          poepleThatLiked.some((x) => {
            return isEqual(x.Login, currentlyLoggedInUser.Login);
          })
            ? heartLiked.src
            : heart.src
        }
        onClick={(event) => {
          handleLikeChange(event);
        }}
        alt="Place where you love someone post"
      />
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
          <div>Hearts</div>
        </Tippy>
      )}{" "}
      {likes}
    </>
  );
};
