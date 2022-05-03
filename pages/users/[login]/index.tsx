import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
} from "firebase/firestore";
import {
  GetServerSideProps,
  GetStaticPaths,
  GetStaticProps,
  NextPage,
} from "next";
import { NextSeo } from "next-seo";
import { useLoginRedirect } from "../../../components/hooks/useLoginRedirect";
import { UIWrapper } from "../../../components/UIWrapper";
import UserProfile, { UserProfileProps } from "../../../components/UserProfile";
import { app } from "../../../firebase/firebase";
import { UserData } from "../../../utils/interfaces";

const UserProfilePage: NextPage<UserProfileProps> = ({
  userDataFromNextJS: userDataFromNextJS,
}) => {
  const { authStatus } = useLoginRedirect();
  return (
    <>
      <NextSeo
        title={`${userDataFromNextJS.Login}`}
        description={`${userDataFromNextJS.Description}`}
        canonical={`https://mood-ssr.vercel.app/`}
        openGraph={{
          title: `${userDataFromNextJS.Login}`,
          description: `${userDataFromNextJS.Description}`,
          images: [
            {
              url: `${userDataFromNextJS.Avatar}`,
              width: 400,
              height: 400,
              alt: `${userDataFromNextJS.Login} profile picture`,
              type: "image/jpeg",
            },
          ],
          site_name: "MOOD",
        }}
      />
      {authStatus ? (
        <>
          <UIWrapper>
            <UserProfile userDataFromNextJS={userDataFromNextJS} />
          </UIWrapper>
        </>
      ) : null}
    </>
  );
};
export const getStaticPaths: GetStaticPaths = async () => {
  const db = getFirestore(app);
  interface UserLoginsInterface {
    UserLogins: string[];
  }
  const allUsers = (await (
    await getDoc(doc(db, "Utility", "UserLogins"))
  ).data()) as UserLoginsInterface;
  const newPaths = allUsers.UserLogins.map((x) => {
    return { params: { login: x } };
  });
  return {
    paths: newPaths,
    fallback: "blocking",
  };
};
export const getStaticProps: GetStaticProps<UserProfileProps> = async ({
  params,
}) => {
  const profileName = params?.login as string;
  const db = getFirestore(app);
  try {
    const userFirebaseDoc = await getDoc(doc(db, "Users", profileName));
    const userData = userFirebaseDoc.data() as UserData;
    if (!userData) throw new Error("Profile was not found");
    return {
      props: {
        userDataFromNextJS: userData,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
export default UserProfilePage;
