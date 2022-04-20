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
  currentlyLoggedInUserContext,
  setCurrentlyLoggedInUserContext,
  UserData,
  userLogInContext,
} from "../utils/interfaces";
import { Header } from "../components/Header";
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
import { LoadingRing } from "../components/LoadingRing";
import Head from "next/head";
function MyApp({ Component, pageProps }: AppProps) {
  const [isUserLoggedIn, setIfUserIsLoggedIn] = useState<boolean | undefined>(
    false
  );
  const [currentlyLoggedInUser, setCurrentlyLoggedInUser] = useState<UserData>({
    Login: "",
    Email: "",
  });
  const [isAuthBeingProccesed, setIsAuthBeingProccesed] =
    useState<boolean>(true);
  const usersLoginArray = useRef<string[]>([]);
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
        setIsAuthBeingProccesed(false);
      } else {
        setIfUserIsLoggedIn(false);
        setIsAuthBeingProccesed(false);
      }
    });
    return () => unsub();
    // eslint-disable-next-line
  }, []);
  return (
    <>
      <Head>
        <title>MOOD</title>
      </Head>
      <setCurrentlyLoggedInUserContext.Provider
        value={setCurrentlyLoggedInUser}
      >
        <currentlyLoggedInUserContext.Provider value={currentlyLoggedInUser}>
          <userLogInContext.Provider
            value={{ isUserLoggedIn, setIfUserIsLoggedIn }}
          >
            <allUsersArrayContext.Provider value={usersLoginArray.current}>
              {isAuthBeingProccesed ? (
                <div className="screenCenter">
                  <LoadingRing colorVariant="black" />
                </div>
              ) : (
                <>
                  <Header />
                  <Component {...pageProps} />
                </>
              )}
            </allUsersArrayContext.Provider>
          </userLogInContext.Provider>
        </currentlyLoggedInUserContext.Provider>
      </setCurrentlyLoggedInUserContext.Provider>
    </>
  );
}

export default MyApp;
