import React, { useState, useEffect } from "react";
import { collection, getDocs, where } from "@firebase/firestore";
import { query } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { LoadingRing } from "./LoadingRing";
import { Post, PostPropsInteface } from "./Post";
import { Empty } from "antd";
import nProgress from "nprogress";
export const SinglePost: React.FC<PostPropsInteface> = (props) => {
  return (
    <div className="divList">
      <Post key={props.URL} {...props} />
    </div>
  );
};
