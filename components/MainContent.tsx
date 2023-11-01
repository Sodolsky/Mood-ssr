import { CreatePost } from "./CreatePost";
import { Post, PostPropsInteface } from "./Post";
import { useContext, useEffect, useRef } from "react";
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
import { firstLoadContext, isaudioMutedContext } from "../utils/interfaces";
import { LoadingRing } from "./LoadingRing";
import { BackTop, Select } from "antd";
import nProgress from "nprogress";
import { NextSeo } from "next-seo";
import { useTitleNotifications } from "./hooks/useTitleNotification";
type sortingOptions = "latest" | "oldest";
export type incomingPostsType = {
  ready: boolean;
  count: number;
};
export const MainContent: React.FC = () => {
  const { isItTheFirstLoad, setIsItTheFirstLoad } =
    useContext(firstLoadContext);
  const firstBatch = useRef<boolean>(true);
  const [sortingPostsOption, setSortingPostsOption] =
    useState<sortingOptions>("latest");
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const divListRef = useRef<HTMLDivElement | null>(null);
  const [lastDoc, setLastDoc] = useState<null | DocumentData>(null);
  const [isLaoding, setIsLaoding] = useState<boolean>(true);
  const [rawPosts, setRawPosts] = useState<PostPropsInteface[]>([]);
  const [Posts, setPosts] = useState<JSX.Element[]>();
  const [newPostsAreReady, setIfNewPostsAreReady] = useState<incomingPostsType>(
    {
      count: 0,
      ready: false,
    }
  );
  const potentialNewPostsCount = useRef<number>(0);
  const cachedPosts = useRef<DocumentData[]>([]);
  const lastPostSeen = useRef<PostPropsInteface | null>(null);
  const { title } = useTitleNotifications(
    newPostsAreReady,
    lastPostSeen,
    rawPosts,
    audioElement.current
  );
  useEffect(() => {
    const ref = collection(db, "Posts");
    const q =
      sortingPostsOption === "latest"
        ? query(ref, orderBy("timestamp", "desc"), limit(4))
        : query(ref, orderBy("timestamp", "asc"), limit(4));
    const Unsubscibe = onSnapshot(q, (doc) => {
      if (doc.metadata.fromCache && !isItTheFirstLoad) return;
      setIsItTheFirstLoad(false);
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
  }, [sortingPostsOption]);
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
  const loadFunc = async (loadLatest: boolean): Promise<void> => {
    const ref = collection(db, "Posts");
    const q = loadLatest
      ? query(ref, orderBy("timestamp", "desc"), limit(4), startAfter(lastDoc))
      : query(ref, orderBy("timestamp", "asc"), limit(4), startAfter(lastDoc));
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
  const changePostSorting = (value: string) => {
    setSortingPostsOption(value as sortingOptions);
  };

  return isLaoding ? (
    <div className="MainContentGrid">
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}
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
      <audio src="notificationSound.wav" ref={audioElement}></audio>
      {newPostsAreReady.ready && (
        <div className={`NewPostsAreReadyMobile`}>
          {newPostsAreReady.count} New Posts
        </div>
      )}
      <CreatePost />
      <div className="sortPosts">
        <span className="warning">Experimental</span>
        <Select
          value={sortingPostsOption}
          onChange={changePostSorting}
          options={[
            { label: "Latest", value: "latest" },
            { label: "Oldest", value: "oldest" },
          ]}
        />
      </div>
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
        next={() => loadFunc(sortingPostsOption === "latest")}
        inverse={false}
        dataLength={rawPosts.length}
        scrollableTarget={this}
        endMessage={
          <div style={{ display: "flex", justifyContent: "center" }}>
            All posts have been already displayed! If you see this message that
            means that you are the real one
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
