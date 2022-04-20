import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { auth } from "../../firebase/firebase";
import {
  authProcessStatusContext,
  currentlyLoggedInUserContext,
} from "../../utils/interfaces";

export const useLoginRedirect = () => {
  const [authStatus, setAuthStatus] = useState<boolean>(false);
  const authIsBeingProccesed = useContext(authProcessStatusContext);
  const currentlyLoggedInUser = useContext(currentlyLoggedInUserContext);
  const router = useRouter();
  useEffect(() => {
    if (
      !auth.currentUser &&
      currentlyLoggedInUser.Login === "" &&
      !authIsBeingProccesed
    ) {
      router.push("/");
    } else if (
      auth.currentUser &&
      currentlyLoggedInUser.Login !== "" &&
      !authIsBeingProccesed
    ) {
      setAuthStatus(true);
    }
  }, [auth.currentUser, currentlyLoggedInUser, authIsBeingProccesed]);
  return { authStatus };
};
