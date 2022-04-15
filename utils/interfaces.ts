import { createContext } from "react";

export const userLogInContext = createContext<LogInInterface>({
  isUserLoggedIn: false,
  setIfUserIsLoggedIn: null,
});
export const currentlyLoggedInUserContext = createContext<UserData>({
  Login: "",
  Email: "",
  UserPosts: [],
});
export type notificationTypes = "comment" | "like";
export interface NotificationInterface {
  type: notificationTypes;
  postId: string;
  whoDid: string;
  date: number;
}
export interface NotificationDataFromFirebase {
  Notifications: NotificationInterface[];
  UID: string;
}
export const allUsersArrayContext = createContext<string[]>([]);
export type setCurrentlyLoggedInUserType = React.Dispatch<
  React.SetStateAction<UserData>
> | null;
export const setCurrentlyLoggedInUserContext =
  createContext<setCurrentlyLoggedInUserType>(null);
export type userPrefferedPostType =
  | "Latest Post"
  | "Most Liked"
  | "Oldest Post"
  | "Pinned";
export interface UserData {
  Login: string | undefined;
  Email: string | undefined;
  Avatar?: string | undefined;
  BackgroundColor?: string | undefined;
  BackgroundImage?: string | undefined;
  UserPosts?: string[] | undefined;
  Description?: string | undefined;
  userPrefferedPost?: userPrefferedPostType | null;
  UID?: string;
  postCount?: number;
  commentsRef?: string[];
  commentCount?: number;
  pinnedPost?: string;
}
export interface LogInInterface {
  isUserLoggedIn: boolean | undefined;
  setIfUserIsLoggedIn: any;
}
