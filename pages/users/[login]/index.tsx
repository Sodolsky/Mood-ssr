import { doc, getDoc, getFirestore } from "firebase/firestore";
import { GetServerSideProps, NextPage } from "next";
import { NextSeo } from "next-seo";
import { useLoginRedirect } from "../../../components/hooks/useLoginRedirect";
import { UIWrapper } from "../../../components/UIWrapper";
import UserProfile, { UserProfileProps } from "../../../components/UserProfile";
import { app } from "../../../firebase/firebase";
import { UserData } from "../../../utils/interfaces";

const UserProfilePage: NextPage<UserProfileProps> = ({ userData }) => {
  const { authStatus } = useLoginRedirect();
  return (
    <>
      <NextSeo
        title={`${userData.Login}`}
        description={`${userData.Description}`}
        canonical={`https://mood-ssr.vercel.app/`}
        openGraph={{
          title: `${userData.Login}`,
          description: `${userData.Description}`,
          images: [
            {
              url: `${userData.Avatar}`,
              width: 400,
              height: 400,
              alt: `${userData.Login} profile picture`,
              type: "image/jpeg",
            },
          ],
          site_name: "MOOD",
        }}
      />
      {authStatus ? (
        <>
          <UIWrapper>
            <UserProfile userData={userData} />
          </UIWrapper>
        </>
      ) : null}
    </>
  );
};
export const getServerSideProps: GetServerSideProps<UserProfileProps> = async ({
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
        userData: userData,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
};
export default UserProfilePage;
