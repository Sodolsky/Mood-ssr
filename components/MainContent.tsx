import * as React from "react";
import { CreatePost } from "./CreatePost";
import { Post, PostPropsInteface } from "./Post";
import { useEffect } from "react";
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  startAfter,
} from "@firebase/firestore";
import { db } from "../firebase/firebase";
import { currentlyLoggedInUserContext, UserData } from "../utils/interfaces";
import { LoadingRing } from "./LoadingRing";
import { BackTop } from "antd";
import { isEqual } from "lodash";
import { usePageVisibility } from "./hooks/usePageVisibility";
import { getElementCountBetween2ElementsInArray } from "./likeFunctions";
import nProgress from "nprogress";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";

type incomingPostsType = {
  ready: boolean;
  count: number;
};
export const MainContent: React.FC = () => {
  const currentlyLoggedInUser = React.useContext(currentlyLoggedInUserContext);
  const [title, setTitle] = useState<string>("MOOD");
  const firstBatch = React.useRef<boolean>(true);
  const divListRef = React.useRef<HTMLDivElement | null>(null);
  const [lastDoc, setLastDoc] = useState<null | DocumentData>(null);
  const [isLaoding, setIsLaoding] = useState<boolean>(true);
  const [rawPosts, setRawPosts] = useState<PostPropsInteface[]>([]);
  const [Posts, setPosts] = useState<JSX.Element[]>();
  const [newPostsAreReady, setIfNewPostsAreReady] =
    React.useState<incomingPostsType>({
      count: 0,
      ready: false,
    });
  const cachedPosts = React.useRef<DocumentData[]>([]);
  const potentialNewPostsCount = React.useRef<number>(0);
  const visible = usePageVisibility();
  const lastPostSeen = React.useRef<PostPropsInteface | null>(null);
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
      if (lastPostSeen.current) {
        if (!isEqual(rawPosts[0], lastPostSeen.current)) {
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
  // const firstBatch = React.useRef<boolean>(true);
  useEffect(() => {
    const ref = collection(db, "Posts");
    const q = query(ref, orderBy("timestamp", "desc"), limit(4));
    const Unsubscibe = onSnapshot(q, (doc) => {
      let shouldLoad: boolean = true;
      doc.docChanges().forEach((change) => {
        if (change.type === "modified") {
          return;
        } else if (change.type === "added") {
          if (window.pageYOffset > 1500) {
            shouldLoad = false;
            potentialNewPostsCount.current++;
            const arr = cachedPosts.current;
            arr.push(change.doc);
            cachedPosts.current = arr;
          }
          if (shouldLoad) {
            const cachedPostsIndexes = doc.docs.filter((x) => {
              if (cachedPosts.current.length !== 0) {
                for (const i of cachedPosts.current) {
                  const iFormatted = i.data() as PostPropsInteface;
                  const xFormatted = x.data() as PostPropsInteface;
                  if (iFormatted.URL === xFormatted.URL) {
                    return false;
                  }
                }
                return true;
              }
              return true;
            });
            const val = cachedPostsIndexes.map((item) => {
              return item.data() as PostPropsInteface;
            });
            setLastDoc(doc.docs[doc.docs.length - 1]);
            setRawPosts(val);
            firstBatch.current = false;
          } else {
            setIfNewPostsAreReady({
              ready: true,
              count: potentialNewPostsCount.current,
            });
          }
        }
      });
    });
    return () => {
      Unsubscibe();
    };
  }, []);
  const showNewPosts = async () => {
    nProgress.start();
    const cachedPostDataArray = cachedPosts.current.map((item) => {
      return item.data() as PostPropsInteface;
    });
    const arr = [...cachedPostDataArray, ...rawPosts];
    cachedPosts.current = [];
    potentialNewPostsCount.current = 0;
    setIfNewPostsAreReady({
      ready: false,
      count: potentialNewPostsCount.current,
    });
    const Ldoc = await getDoc(doc(db, "Posts", `${arr[arr.length - 1].date}`));
    setLastDoc(Ldoc);
    setRawPosts(arr);
    nProgress.done();
  };
  useEffect(() => {
    setPosts(
      rawPosts.map((item) => {
        return <Post key={item.URL} date={item.date} />;
      })
    );
    setIsLaoding(false);
  }, [rawPosts]);
  // const currentUser = React.useContext(currentlyLoggedInUserContext);
  const loadFunc = async (): Promise<void> => {
    const ref = collection(db, "Posts");
    const q = query(
      ref,
      orderBy("timestamp", "desc"),
      limit(4),
      startAfter(lastDoc)
    );
    onSnapshot(q, (doc) => {
      doc.docChanges().forEach((change) => {
        if (change.type === "modified") {
          return;
        } else if (change.type === "added") {
          const val = doc.docs.map((item) => {
            return item.data() as PostPropsInteface;
          });
          setLastDoc(doc.docs[doc.docs.length - 1]);
          setRawPosts([...rawPosts, ...val]);
        }
      });
    });
  };
  return isLaoding ? (
    <div className="MainContentGrid">
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}
      >
        <LoadingRing colorVariant="white" />
      </div>
    </div>
  ) : (
    <>
      <NextSeo
        title={title}
        description="Share your current mood with your friends and family"
      />
      <BackTop duration={300} />
      {newPostsAreReady.ready && (
        <div className={`NewPostsAreReadyMobile`}>
          {newPostsAreReady.count} New Posts
        </div>
      )}
      <CreatePost />
      <InfiniteScroll
        scrollThreshold={0.7}
        style={{ overflow: "hidden" }}
        loader={
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100vw",
            }}
          >
            <LoadingRing colorVariant={"white"} />
          </div>
        }
        hasMore={lastDoc !== undefined}
        next={loadFunc}
        inverse={false}
        dataLength={rawPosts.length}
        scrollableTarget={this}
        endMessage={
          <div style={{ display: "flex", justifyContent: "center" }}>
            Youve seen all the posts :D
          </div>
        }
      >
        <div className="divList" ref={divListRef} id="divList">
          {newPostsAreReady.ready && (
            <button className="LoadNewPostsButton" onClick={showNewPosts}>
              Load {newPostsAreReady.count} new Posts
            </button>
          )}
          {Posts}
        </div>
      </InfiniteScroll>
      );
    </>
  );
};
