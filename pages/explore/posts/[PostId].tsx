import { NextPage } from "next";
import React from "react";
import { useLoginRedirect } from "../../../components/hooks/useLoginRedirect";
import { SinglePost } from "../../../components/SinglePost";
import { UIWrapper } from "../../../components/UIWrapper";

const SinglePostPage: NextPage = () => {
  const { authStatus } = useLoginRedirect();

  return authStatus ? (
    <UIWrapper>
      <SinglePost />
    </UIWrapper>
  ) : null;
};
export default SinglePostPage;
