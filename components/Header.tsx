import * as React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { auth, db } from "../firebase/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCheckSquare,
  faComment,
  faDoorOpen,
  faHeart,
  faStar,
  faTrash,
  faVolumeMute,
} from "@fortawesome/free-solid-svg-icons";
import {
  currentlyLoggedInUserContext,
  isaudioMutedContext,
  NotificationDataFromFirebase,
  setCurrentlyLoggedInUserContext,
  themeContext,
  UserData,
} from "../utils/interfaces";
import Tippy from "@tippyjs/react";
import { Avatar, Button } from "antd";
import HalfMoonIcon from "../public/half-moon.svg";
import {
  arrayRemove,
  collection,
  deleteField,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useMediaQuery } from "@react-hook/media-query";
import moment from "moment";
import { NotificationInterface } from "../utils/interfaces";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
// const handleComplexBackendChanges = async () => {
//   const q = query(collection(db, "Users"));
//   const docs = await getDocs(q);
//   docs.forEach(async (doc) => {
//     const data = doc.data() as UserData;
//     if (data.Avatar?.includes("avatars.dicebear.com")) {
//       const newAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${
//         data.Login?.trim() as string
//       }`;
//       const newDoc: UserData = { ...data, Avatar: newAvatar };
//       await setDoc(doc.ref, newDoc);
//     }
//   });
// };
export const Header: React.FC = () => {
  const match = useMediaQuery("only screen and (min-width:440px");
  const router = useRouter();
  const muteAudioContext = React.useContext(isaudioMutedContext);
  const currentlyLoggedInUser = React.useContext(currentlyLoggedInUserContext);
  const [notifications, setNotifications] = React.useState<
    NotificationInterface[]
  >([]);
  const themeCTX = React.useContext(themeContext);
  React.useEffect(() => {
    const subscribeToNotifications = (UID: string) => {
      const notificationRef = collection(db, "Notifications");
      const qNotifications = query(
        notificationRef,
        where("UID", "==", `${UID}`)
      );
      onSnapshot(qNotifications, (doc) => {
        doc.docs.forEach((item) => {
          const obj = item.data() as NotificationDataFromFirebase;
          setNotifications(obj.Notifications);
        });
      });
    };
    if (currentlyLoggedInUser.UID) {
      subscribeToNotifications(currentlyLoggedInUser.UID);
    }
  }, [currentlyLoggedInUser]);
  const clearNotifications = async () => {
    const ref = doc(db, "Notifications", `${currentlyLoggedInUser.Login}`);
    setNotifications([]);
    await updateDoc(ref, {
      Notifications: [],
    });
    //RemovingFromFirebase
  };
  const handleSingleNotificationRemoval = async (
    notification: NotificationInterface
  ) => {
    setNotifications(notifications.filter((x) => x !== notification));
    const ref = doc(db, "Notifications", `${currentlyLoggedInUser.Login}`);
    await updateDoc(ref, {
      Notifications: arrayRemove(notification),
    });
  };
  const setCurrentlyLoggedInUser = React.useContext(
    setCurrentlyLoggedInUserContext
  );
  return (
    <header>
      <Container fluid className="HeaderContainer">
        <Row className="Logo">
          <Col>
            <div className="AlignLogo">
              <div className="FlexCol">
                <div>
                  <span>MOOD</span>
                  <Image
                    src={HalfMoonIcon}
                    width={40}
                    height={40}
                    alt="Logo of a moon"
                    onClick={() =>
                      themeCTX.setTheme &&
                      themeCTX.setTheme(
                        themeCTX.theme === "bright" ? "dark" : "bright"
                      )
                    }
                  />
                </div>

                <span className="Info">
                  Everything posted here is a joke, dont take it seriously!
                </span>
              </div>

              {auth.currentUser && (
                <>
                  <div className="HOFContainer">
                    <Link href="/explore/HallOfFame">
                      <span>
                        <FontAwesomeIcon icon={faStar} />
                      </span>
                    </Link>
                  </div>
                  {/* <button onClick={handleComplexBackendChanges}>Handle</button> */}
                  <div className="FAContainer">
                    <FontAwesomeIcon
                      icon={faDoorOpen}
                      onClick={() => {
                        if (setCurrentlyLoggedInUser) {
                          setCurrentlyLoggedInUser({
                            Login: "",
                            Email: "",
                          });
                        }
                        try {
                          auth.signOut();
                        } catch (error) {
                          console.log(error);
                          alert(
                            "An error has occured. We couldn't sign you out :("
                          );
                        }
                      }}
                    />
                  </div>
                  <div className="FAMuteContainer">
                    <FontAwesomeIcon
                      icon={faVolumeMute}
                      style={{
                        color: muteAudioContext.isAudioMuted ? "red" : "green",
                      }}
                      onClick={() =>
                        muteAudioContext.setIsAudioMuted &&
                        muteAudioContext.setIsAudioMuted(
                          !muteAudioContext.isAudioMuted
                        )
                      }
                    />
                  </div>
                  <Tippy
                    interactive={true}
                    delay={200}
                    placement={"right"}
                    maxWidth={`${match ? "400px" : "300px"}`}
                    content={
                      <div className="tippyNotifications">
                        <div className="ButtonContainer">
                          {notifications.length > 0 ? (
                            <Button onClick={clearNotifications}>
                              Clear All
                            </Button>
                          ) : (
                            <div className="FlexContainer">
                              <FontAwesomeIcon icon={faCheckSquare} />
                              <span>You are up to date with Notifications</span>
                            </div>
                          )}
                        </div>
                        {notifications
                          .sort((a, b) => b.date - a.date)
                          .map((x, i) => {
                            if (x.type === "comment") {
                              return (
                                <div
                                  className="NotificationContainer"
                                  key={`${x.postId}${i}${x.whoDid}${x.type}`}
                                >
                                  <span
                                    onClick={() =>
                                      router.push(`/explore/posts/${x.postId}`)
                                    }
                                  >
                                    <FontAwesomeIcon icon={faComment} />
                                    <b>{x.whoDid}</b>
                                  </span>
                                  <span>{moment(x.date * 1000).fromNow()}</span>
                                  <FontAwesomeIcon
                                    icon={faTrash}
                                    className="trash"
                                    onClick={() =>
                                      handleSingleNotificationRemoval(x)
                                    }
                                  />
                                </div>
                              );
                            } else {
                              return (
                                <div
                                  className="NotificationContainer"
                                  key={`${x.type}${x.whoDid}${i}${x.postId}`}
                                >
                                  <span
                                    onClick={() =>
                                      router.push(`/explore/posts/${x.postId}`)
                                    }
                                  >
                                    <FontAwesomeIcon icon={faHeart} />
                                    <b>{x.whoDid}</b>
                                  </span>
                                  <span>{moment(x.date * 1000).fromNow()}</span>
                                  <FontAwesomeIcon
                                    icon={faTrash}
                                    className="trash"
                                    onClick={() =>
                                      handleSingleNotificationRemoval(x)
                                    }
                                  />
                                </div>
                              );
                            }
                          })}
                      </div>
                    }
                    allowHTML={true}
                    animation={"scale"}
                    appendTo={"parent"}
                  >
                    <div className="FAContainerBell">
                      <FontAwesomeIcon
                        icon={faBell}
                        className={`${
                          notifications.length > 0 ? "BellAnimation" : ""
                        }`}
                      />
                    </div>
                  </Tippy>
                </>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </header>
  );
};
