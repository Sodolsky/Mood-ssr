import * as React from "react";
import { useState } from "react";
import { auth, db } from "../firebase/firebase";
import {
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
} from "@firebase/firestore";
import { collection } from "firebase/firestore";
import { PostPropsInteface } from "./Post";
import {
  userPrefferedPostType,
  setCurrentlyLoggedInUserContext,
  userRoles,
} from "../utils/interfaces";
import { createUserWithEmailAndPassword, UserCredential } from "@firebase/auth";
import { FirebaseError } from "@firebase/util";
import nProgress from "nprogress";
import Logo from "../public/icon-512.png";
interface SignUpProps {
  setIfUserIsSigningUp: React.Dispatch<React.SetStateAction<boolean>>;
  setIfUserIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  showError: (variant: string, message: string, isshown: boolean) => void;
}
const addNewAccountIntoDataBase = async (
  Login: string | undefined,
  Email: string | undefined,
  Avatar: File | string,
  Description: string | undefined,
  BackgroundColor: string,
  BackgroundImage: string,
  userPrefferedPost: userPrefferedPostType,
  UID: string,
  postCount: number,
  commentCount: number,
  pinnedPost: string,
  userRole: userRoles
) => {
  try {
    nProgress.start();
    await setDoc(doc(db, "Notifications", `${Login}`), {
      Notifications: [],
      UID: UID,
    });
    await setDoc(doc(db, "Users", `${Login}`), {
      Login: Login,
      Email: Email,
      Avatar: Avatar,
      Description: Description,
      BackgroundColor: BackgroundColor,
      BackgroundImage: BackgroundImage,
      userPrefferedPost: userPrefferedPost,
      UID: UID,
      postCount: postCount,
      commentCount: commentCount,
      pinnedPost: pinnedPost,
      userRole: userRole,
    });
    nProgress.done();
  } catch (error) {
    console.log(error);
  }
};
export const validateEmail = (email: string | undefined) => {
  const reg =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return reg.test(String(email).toLowerCase());
};
export const SignUp: React.FC<SignUpProps> = (props) => {
  const { setIfUserIsLoggedIn } = props;
  const setCurrentlyLoggedInUser = React.useContext(
    setCurrentlyLoggedInUserContext
  );
  const validateUserInDataBase = async (
    key: string | undefined,
    userEmail: string | undefined
  ) => {
    const referenceInDataBase = doc(db, "Users", `${key}`);
    nProgress.start();
    const documentSnapshot = await getDoc(referenceInDataBase);
    const emailRef = collection(db, "Users");
    const queryforEmail = query(emailRef, where("Email", "!=", ""));
    nProgress.inc();
    const querySnapshot = await getDocs(queryforEmail);
    const emailsArray: string[] = [];
    querySnapshot.forEach((item) => emailsArray.push(item.data().Email));
    for (const i of emailsArray) {
      if (i === userEmail) {
        nProgress.done();
        return props.showError("danger", "Your Email Was Already Taken", true);
      }
    }
    if (documentSnapshot.exists()) {
      props.showError("danger", "Your Login Was Already Taken", true);
      nProgress.done();
      return false;
    } else {
      nProgress.done();
      return true;
    }
  };
  const [registerData, setRegisterData] = useState<{
    Email: string;
    Login: string;
    Password: string;
  }>({
    Email: "",
    Login: "",
    Password: "",
  });
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = event.target.value;
    const name = event.target.name;
    setRegisterData((prevState) => ({
      ...prevState,
      [name]: newValue,
    }));
  };
  const handleSubmit = (event: React.MouseEvent) => {
    event.preventDefault();
    if (
      registerData.Password === "" ||
      registerData.Login === "" ||
      registerData.Email === ""
    ) {
      return props.showError("danger", "Please Fill Out Everything", true);
    }
    if (!validateEmail(registerData.Email)) {
      return props.showError(
        "danger",
        "Provide us with a valid Email Address",
        true
      );
    }
    if (registerData.Password.length < 6) {
      return props.showError(
        "danger",
        "Your Password Should contain at least 6 characters",
        true
      );
    }

    if (registerData.Login.length > 16) {
      return props.showError(
        "danger",
        "Your Login cannnot be longer than 16 characters",
        true
      );
    }
    validateUserInDataBase(registerData.Login, registerData.Email).then(
      (message) => {
        if (!message) {
          return;
        } else {
          props.showError(
            "success",
            "Sucess! Your account has been created!",
            true
          );
          createUserWithEmailAndPassword(
            auth,
            registerData.Email as string,
            registerData.Password as string
          )
            .then((userCredentials: UserCredential) => {
              const user = userCredentials.user;
              //!Change the function too
              addNewAccountIntoDataBase(
                registerData.Login,
                registerData.Email,
                `https://api.dicebear.com/7.x/bottts/svg?seed=${registerData.Login.trim()}`,
                `Hello my name is ${registerData.Login} i'm using MOOD App 😎`,
                "2f2f2f",
                "",
                "Latest Post",
                user.uid,
                0,
                0,
                "",
                "Normal"
              );
              setIfUserIsLoggedIn(true);
              setCurrentlyLoggedInUser!({
                Login: registerData.Login,
                Email: registerData.Email,
                Avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${registerData.Login.trim()}`,
                Description: `Hello my name is ${registerData.Login} i'm using MOOD App 😎`,
                BackgroundColor: "2f2f2f",
                BackgroundImage: "",
                userPrefferedPost: "Latest Post",
                UID: user.uid,
                postCount: 0,
                pinnedPost: "",
                userRole: "Normal",
              });
            })
            .catch((error: FirebaseError) => {
              props.showError(
                "danger",
                `(${error.code}),${error.message}`,
                true
              );
            });
        }
      }
    );
  };
  return (
    <>
      <div className="background_box_cover">
        <img src="https://picsum.photos/1920/1080" alt="apiPicture" />
        <img src={Logo.src} alt="logo" className="logo" />
        <div className="loginBGcover"></div>
      </div>
      <main>
        <div className="LogInText">
          <h1>Create Your Account</h1>
          <p>{"It's free!"}</p>
        </div>
        <div className="LogInForm">
          <form>
            <input
              type="text"
              name="Login"
              id="Login"
              placeholder="username"
              autoComplete="on"
              onChange={handleChange}
              value={registerData?.Login}
            />
            <input
              type="email"
              name="Email"
              id="Email"
              placeholder="email"
              autoComplete="on"
              onChange={handleChange}
              value={registerData?.Email}
            />
            <input
              type="Password"
              name="Password"
              id="Password"
              placeholder="password"
              autoComplete="on"
              onChange={handleChange}
              value={registerData.Password}
            />
            <div className="buttonFlexWrap">
              <button onClick={() => props.setIfUserIsSigningUp(false)}>
                Go to Login
              </button>
              <button className="submitButton" onClick={handleSubmit}>
                Create account
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};
