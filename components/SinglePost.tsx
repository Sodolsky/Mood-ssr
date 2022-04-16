import React from "react";
import { Post, PostPropsInteface } from "./Post";
export const SinglePost: React.FC<PostPropsInteface> = (props) => {
  return (
    <div className="divList">
      <Post key={props.URL} {...props} />
    </div>
  );
};
