import { BarRole, GetBarMemberDTO } from '@repo/dtos';

const placeholderMember: GetBarMemberDTO = {
  barId: 'placeholder-bar',
  userId: 'placeholder-user',
  role: 'member',
  user: {
    id: 'placeholder-user',
    kindeId: 'placeholder-kinde',
    username: 'xxxxxxxxxx',
    email: 'xxxxxxxx@xxxxxx.xxx',
    profileImageId: null,
    profileImage: null,
  },
};

const roles: BarRole[] = ['owner', 'admin', 'member', 'member', 'member'];

export const members = {
  list: roles.map((role, i): GetBarMemberDTO => {
    const userId = `${placeholderMember.userId}-${i}`;
    return { ...placeholderMember, role, userId, user: { ...placeholderMember.user, id: userId } };
  }),
};
