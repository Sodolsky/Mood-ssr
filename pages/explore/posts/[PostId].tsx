import { Empty } from "antd";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { isEmpty } from "lodash";
import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import React from "react";
import { useLoginRedirect } from "../../../components/hooks/useLoginRedirect";
import { PostPropsInteface } from "../../../components/Post";
import { SinglePost } from "../../../components/SinglePost";
import { UIWrapper } from "../../../components/UIWrapper";
import { app } from "../../../firebase/firebase";

const SinglePostPage: NextPage<PostPropsInteface> = (props) => {
  const { authStatus } = useLoginRedirect();
  return authStatus ? (
    <>
      <UIWrapper>
        {isEmpty(props) ? (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Empty
              style={{ fontSize: 20 }}
              description="This Post doesn't exist :("
            />
          </div>
        ) : (
          <>
            <Head>
              <meta
                name="og:description"
                content={props.text}
                key="titleDescription"
              />
              <meta
                name="og:title"
                content={`Post added by${props.userThatPostedThis.Login}`}
                key="titleDescription"
              />
              <meta
                name="og:image"
                content={`New Post added by${props.img}`}
                key="titleDescription"
              />
            </Head>
            <SinglePost {...(props as PostPropsInteface)} />
          </>
        )}
      </UIWrapper>
    </>
  ) : null;
};
export const getServerSideProps: GetServerSideProps<
  PostPropsInteface
> = async ({ params }) => {
  const postId = params?.PostId;
  const db = getFirestore(app);
  const q = query(collection(db, "Posts"), where("URL", "==", postId));
  try {
    const post = await getDocs(q);
    const postData = post.docs[0].data() as PostPropsInteface;
    return {
      props: { ...postData },
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
        postType: "image",
        text: "",
        userThatPostedThis: { Avatar: "", Login: "" },
        YTLink: "",
        fileType: "",
        img: "",
      },
    };
  }
};
export default SinglePostPage;
