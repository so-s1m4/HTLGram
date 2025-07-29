import { HydratedDocument, Types } from 'mongoose';
import { UserI } from './users.model';


export type ImageInfoR = {
  path: string;
  size: number;
};

export type UserPublicR = {
  id: string; 
  username: string;
  name: string;
  description?: string;
  img: ImageInfoR[];
  friendsCount: number;
  createdAt: Date; 
  updatedAt: Date;
};

export type UserMeR = UserPublicR & {
  storage: number;
};

export type FriendPublicR = {
  id: string;
  username: string;
  name: string;
  img: ImageInfoR[];
};

type WithId = { _id: Types.ObjectId | string };

export function toUserPublic(
  user: HydratedDocument<UserI> | (UserI & WithId)
): UserPublicR {
  return {
    id: String(user._id),
    username: user.username,
    name: user.name,
    description: user.description,
    img: user.img,
    friendsCount: user.friendsCount ?? 0,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}


export function toUserMe(
  user: HydratedDocument<UserI> | (UserI & WithId)
): UserMeR {
  const base = toUserPublic(user);
  return { ...base, storage: user.storage };
}


export function toFriendPublic(
  u: Pick<UserI, '_id' | 'img' | 'username' | 'name'>
): FriendPublicR {
  return {
    id: String(u._id),
    username: u.username,
    name: u.name,
    img: (u.img ?? []).map(i => ({ path: i.path, size: i.size })),
  };
}

export const mapUsersToPublic = (
  users: Array<HydratedDocument<UserI> | (UserI & WithId)>
): UserPublicR[] => users.map(toUserPublic);

export const mapFriendsToPublic = (
  friends: Array<Pick<UserI, '_id' | 'img' | 'username' | 'name'>>
): FriendPublicR[] => friends.map(toFriendPublic);
