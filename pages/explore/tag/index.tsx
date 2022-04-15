import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const TagPage: NextPage = () => {
  const router = useRouter();
  useEffect(() => {
    router.push("/explore");
  }, []);
  return null;
};
export default TagPage;
