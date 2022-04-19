import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import React from "react";
import { useLoginRedirect } from "../../../components/hooks/useLoginRedirect";
import { NotFoundComponent } from "../../../components/NotFound";
import { PostPropsInteface } from "../../../components/Post";
import { SinglePost } from "../../../components/SinglePost";
import { UIWrapper } from "../../../components/UIWrapper";
import { app } from "../../../firebase/firebase";

const SinglePostPage: NextPage<SerializedFirebasePostData> = (props) => {
  const { authStatus } = useLoginRedirect();
  return (
    <>
      <Head>
        <meta
          property="og:title"
          content={`Post added by${props.userThatPostedThis.Login}`}
        />
        <meta property="og:description" content={props.text} key={props.text} />
        <meta property="og:image" content={props.img} key={props.img} />
        <meta
          property="og:url"
          content={`https://mood-ssr.vercel.app/explore/posts/${props.URL}`}
        />
        <meta property="og:type" content="website" />
      </Head>
      {authStatus ? (
        <UIWrapper>
          {props.date === "" ? (
            <NotFoundComponent />
          ) : (
            <SinglePost {...(props as PostPropsInteface)} />
          )}
        </UIWrapper>
      ) : null}
    </>
  );
};
export interface FirebasePostData extends PostPropsInteface {
  timestamp: {
    seconds: number;
    miliseconds: number;
  };
}
export interface SerializedFirebasePostData
  extends Omit<FirebasePostData, "timestamp"> {
  timestamp: number;
}
export const getServerSideProps: GetServerSideProps<
  SerializedFirebasePostData
> = async ({ params }) => {
  const postId = params?.PostId;
  const db = getFirestore(app);
  const postQuery = query(collection(db, "Posts"), where("URL", "==", postId));
  const commentQuery = collection(db, "Posts", `${postId}`, "comments");
  try {
    const post = await getDocs(postQuery);
    const postData = post.docs[0].data() as FirebasePostData;
    return {
      props: { ...postData, timestamp: postData.timestamp.seconds },
    };
  } catch (error) {
    return {
      props: {
        URL: "",
        hallOfFame: false,
        date: "",
        hashtags: [],
        likeCount: 0,
        poepleThatLiked: [],
        postType: "",
        text: "",
        userThatPostedThis: { Avatar: "", Login: "" },
        YTLink: "",
        fileType: "",
        img: "",
        timestamp: 0,
      },
    };
  }
};
export default SinglePostPage;
