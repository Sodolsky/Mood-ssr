import { NextPage } from "next";
import React from "react";
import { useLoginRedirect } from "../../components/hooks/useLoginRedirect";
import { MainContent } from "../../components/MainContent";

const Home: NextPage = () => {
  const { authStatus } = useLoginRedirect();
  return authStatus ? <MainContent /> : null;
};
export default Home;
