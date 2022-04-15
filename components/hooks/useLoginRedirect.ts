import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { auth } from "../../firebase/firebase";
import { currentlyLoggedInUserContext } from "../../utils/interfaces";

export const useLoginRedirect = () => {
  const [authStatus, setAuthStatus] = useState<boolean>(false);
  const currentlyLoggedInUser = useContext(currentlyLoggedInUserContext);
  const router = useRouter();
  useEffect(() => {
    if (!auth.currentUser && currentlyLoggedInUser.Login === "") {
      router.push("/");
    } else if (auth.currentUser && currentlyLoggedInUser.Login !== "") {
      setAuthStatus(true);
    }
  }, [auth.currentUser, currentlyLoggedInUser]);
  return { authStatus };
};
