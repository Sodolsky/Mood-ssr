import "../styles/globals.css";
import type { AppProps } from "next/app";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { isEqual } from "lodash";
import { useState, useRef, useEffect } from "react";
import { db, auth } from "../firebase/firebase";
import {
  allUsersArrayContext,
  authProcessStatusContext,
  currentlyLoggedInUserContext,
  firstLoadContext,
  setCurrentlyLoggedInUserContext,
  UserData,
  userLogInContext,
} from "../utils/interfaces";
import "../components/styles.scss";
import "../components/Styles/AddPostIcon.scss";
import "../components/Styles/BackArrow.scss";
import "../components/Styles/CustomToggle.scss";
import "../components/Styles/Explore.scss";
import "../components/Styles/Header.scss";
import "../components/Styles/LoadingRingStyles.scss";
import "../components/Styles/LogIn.scss";
import "../components/Styles/SignUp.scss";
import "../components/Styles/MainPageStyles.scss";
import "../components/Styles/NotFound.scss";
import "../components/Styles/RankingComponent.scss";
import "../components/Styles/UserProfile.scss";
import "../components/Styles/tippyStyles.scss";
import "nprogress/nprogress.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;
import Head from "next/head";
import nProgress from "nprogress";
import { Router } from "next/router";
import { useThemeSwitcher } from "../components/hooks/useThemeSwitcher";
function MyApp({ Component, pageProps }: AppProps) {
  Router.events.on("routeChangeStart", () => {
    nProgress.start();
  });

  Router.events.on("routeChangeComplete", () => {
    nProgress.done();
  });

  Router.events.on("routeChangeError", () => {
    nProgress.done();
  });
  const [isUserLoggedIn, setIfUserIsLoggedIn] = useState<boolean | undefined>(
    false
  );
  const [isItFirstLoad, setIsItFirstLoad] = useState<boolean>(true);
  const [currentlyLoggedInUser, setCurrentlyLoggedInUser] = useState<UserData>({
    Login: "",
    Email: "",
  });
  const usersLoginArray = useRef<string[]>([]);
  const [authIsBeingProccesed, setAuthIsBeingProccesed] =
    useState<boolean>(true);
  const getUsersLoginsUtility = async () => {
    const ref = doc(db, "Utility", "UserLogins");
    try {
      const myDoc = await getDoc(ref);
      const obj = myDoc.data() as string[];
      usersLoginArray.current = obj;
    } catch (error) {
      console.log(error, "e");
    }
  };
  const getDataAboutUser = async (UID: string) => {
    const uRef = collection(db, "Users");
    const q = query(uRef, where("UID", "==", `${UID}`));
    const userDoc = await getDocs(q);
    userDoc.forEach((item) => {
      const obj = item.data() as UserData;
      if (isEqual(obj, currentlyLoggedInUser)) {
        return;
      } else {
        setCurrentlyLoggedInUser({
          Login: obj.Login,
          Email: obj.Email,
          UserPosts: obj.UserPosts,
          Avatar: obj.Avatar,
          Description: obj.Description,
          BackgroundColor: obj.BackgroundColor,
          BackgroundImage: obj.BackgroundImage,
          userPrefferedPost: obj.userPrefferedPost,
          UID: obj.UID,
          postCount: obj.postCount,
          commentsRef: obj.commentsRef,
          commentCount: obj.commentCount,
          pinnedPost: obj.pinnedPost,
        });
        getUsersLoginsUtility();
      }
      setIfUserIsLoggedIn(true);
    });
  };
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        getDataAboutUser(user.uid);
        setAuthIsBeingProccesed(false);
      } else {
        setIfUserIsLoggedIn(false);
        setAuthIsBeingProccesed(false);
      }
    });
    return () => unsub();
    // eslint-disable-next-line
  }, []);
  return (
    <>
      <Head>{<title>MOOD</title>}</Head>
      <firstLoadContext.Provider
        value={{
          isItTheFirstLoad: isItFirstLoad,
          setIsItTheFirstLoad: setIsItFirstLoad,
        }}
      >
        <setCurrentlyLoggedInUserContext.Provider
          value={setCurrentlyLoggedInUser}
        >
          <currentlyLoggedInUserContext.Provider value={currentlyLoggedInUser}>
            <userLogInContext.Provider
              value={{ isUserLoggedIn, setIfUserIsLoggedIn }}
            >
              <allUsersArrayContext.Provider value={usersLoginArray.current}>
                <authProcessStatusContext.Provider value={authIsBeingProccesed}>
                  <Component {...pageProps} />
                </authProcessStatusContext.Provider>
              </allUsersArrayContext.Provider>
            </userLogInContext.Provider>
          </currentlyLoggedInUserContext.Provider>
        </setCurrentlyLoggedInUserContext.Provider>
      </firstLoadContext.Provider>
    </>
  );
}

export default MyApp;
