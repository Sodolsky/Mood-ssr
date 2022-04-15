import * as React from "react";
import { Container, Navbar } from "react-bootstrap";
import Home from "../public/home.svg";
import Explore from "../public/explore.png";
import UserProfileIcon from "../public/userprofile.png";
import Link from "next/link";
import { currentlyLoggedInUserContext } from "../utils/interfaces";
import { LazyLoadedImage } from "./LazyLoadedImage";
import { useRouter } from "next/router";
export const Navigation: React.FC = () => {
  const location = useRouter();
  const currentlyLoggedInUser = React.useContext(currentlyLoggedInUserContext);
  const splited = location.pathname.split("/");
  return (
    <>
      <nav className="PersonalNav">
        <Navbar>
          <Container fluid className="justify-content-around">
            <button>
              <Link href="/home">
                <section>
                  <LazyLoadedImage
                    src={Home.src}
                    alt="Main Page"
                    style={{
                      paddingBottom: "0.1rem",
                      borderBottom:
                        splited[1] === "home" ? "3px solid purple" : 0,
                    }}
                  />
                </section>
              </Link>
            </button>
            <button>
              <Link href="/explore">
                <section>
                  <LazyLoadedImage
                    src={Explore.src}
                    alt="Explore"
                    style={{
                      paddingBottom: "0.25rem",
                      borderBottom:
                        splited[1] === "explore" ? "3px solid purple" : "",
                    }}
                  />
                </section>
              </Link>
            </button>
            <button>
              <Link href={`/users/${currentlyLoggedInUser.Login}`}>
                <section>
                  <LazyLoadedImage
                    src={UserProfileIcon.src}
                    alt="Your Profile"
                    style={{
                      paddingBottom: "0.25rem",
                      borderBottom:
                        splited[1] === "users" ? "3px solid purple" : "",
                    }}
                  />
                </section>
              </Link>
            </button>
          </Container>
        </Navbar>
      </nav>
    </>
  );
};
