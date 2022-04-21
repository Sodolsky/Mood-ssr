import { useRouter } from "next/router";
import React, { useContext, useEffect } from "react";
import { LoadingRing } from "../components/LoadingRing";
import { LogIn } from "../components/LogIn";
import { auth } from "../firebase/firebase";
import {
  authProcessStatusContext,
  currentlyLoggedInUserContext,
} from "../utils/interfaces";

const EntryPoint = () => {
  const currentlyLoggedInUser = useContext(currentlyLoggedInUserContext);
  const authIsBeingProccesed = useContext(authProcessStatusContext);
  const router = useRouter();

  useEffect(() => {
    currentlyLoggedInUser.Login !== "" &&
      auth.currentUser &&
      router.push("/home");
  }, [currentlyLoggedInUser, auth]);
  return currentlyLoggedInUser.Login === "" &&
    !auth.currentUser &&
    !authIsBeingProccesed ? (
    <LogIn />
  ) : (
    authIsBeingProccesed && (
      <div className="screenCenter">
        <LoadingRing colorVariant={"black"} />
      </div>
    )
  );
};
export default EntryPoint;
