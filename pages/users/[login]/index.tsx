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

  // LOG 1: Sprawdzamy, o jaki login dokładnie pyta Next.js (wielkość liter!)
  console.log(`[DEBUG] Próba wygenerowania profilu dla: "${profileName}"`);

  try {
    const userFirebaseDoc = await getDoc(doc(db, "Users", profileName));
    const userData = userFirebaseDoc.data() as UserData;

    // LOG 2: Sprawdzamy, co dokładnie zwrócił Firebase (czy obiekt, czy undefined)
    console.log(`[DEBUG] Odpowiedź z bazy dla ${profileName}:`, userData);

    if (!userData) {
      // LOG 3: Dowiemy się, czy to wina braku danych w bazie
      console.log(`[DEBUG] Nie znaleziono userData, rzucam błędem (404)!`);
      throw new Error("Profile was not found");
    }

    return {
      props: {
        userDataFromNextJS: userData,
      },
      revalidate: 1,
    };
  } catch (error) {
    // LOG 4 (NAJWAŻNIEJSZY): Wypisze pełny, faktyczny błąd, jeśli np. Firebase odrzuci połączenie
    console.error(
      `[DEBUG FATAL ERROR] Błąd w getStaticProps dla "${profileName}":`,
      error,
    );

    return {
      notFound: true,
    };
  }
};
export default UserProfilePage;
