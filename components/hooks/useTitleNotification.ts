import { isEqual } from "lodash";
import { MutableRefObject, useContext, useEffect, useState } from "react";
import { currentlyLoggedInUserContext } from "../../utils/interfaces";
import { getElementCountBetween2ElementsInArray } from "../likeFunctions";
import { incomingPostsType } from "../MainContent";
import { PostPropsInteface } from "../Post";
import { usePageVisibility } from "./usePageVisibility";
export interface useTitleNotificationsHookProps {}
export const useTitleNotifications = (
  newPostsAreReady: incomingPostsType,
  lastPostSeen: MutableRefObject<PostPropsInteface | null>,
  rawPosts: PostPropsInteface[]
) => {
  const currentlyLoggedInUser = useContext(currentlyLoggedInUserContext);
  const visible = usePageVisibility();
  const [title, setTitle] = useState<string>("MOOD");
  useEffect(() => {
    if (visible) {
      if (newPostsAreReady.count === 0) {
        setTitle(`MOOD`);
      } else {
        const count = newPostsAreReady.count;
        setTitle(`MOOD (${count}) New Posts`);
      }
      lastPostSeen.current = rawPosts[0];
    } else {
      if (lastPostSeen) {
        if (!isEqual(rawPosts[0], lastPostSeen)) {
          const diff = getElementCountBetween2ElementsInArray(
            rawPosts,
            lastPostSeen.current
          );
          //Handle Normal logic when there are no new Posts in Cache.
          if (newPostsAreReady.count === 0) {
            if (diff === "n") {
              setTitle(`MOOD (4+) New Posts`);
            } else {
              //We need to check if post that is being added is user post if not we handle normal logic else we dont change the title
              diff === 0
                ? setTitle(`MOOD`)
                : diff === 1
                ? rawPosts[0].userThatPostedThis.Login ===
                  currentlyLoggedInUser.Login
                  ? setTitle(`MOOD`)
                  : setTitle(`MOOD (${diff}) New Posts`)
                : setTitle(`MOOD (${diff}) New Posts`);
            }
            //Handle logic when there are Posts in cache and normal Posts Unseen
          } else if (diff !== "n") {
            const Total = newPostsAreReady.count + diff;
            setTitle(`MOOD (${Total}) New Posts`);
            // new Notification("2 new Posts are Rdy");
          } else {
            setTitle(`Mood (4+) New Posts`);
          }
        } else {
          if (newPostsAreReady.count !== 0) {
            setTitle(`MOOD (${newPostsAreReady.count}) New Posts`);
          }
        }
      }
    }
  }, [rawPosts, visible, newPostsAreReady, currentlyLoggedInUser.UID]);
  return { title };
};
