import { BarRole, type GetBarMemberDTO } from '@repo/dtos';

export const roleLabels: Record<BarRole, { one: string; many: string }> = {
  owner: { one: 'Owner', many: 'Owner' },
  admin: { one: 'Admin', many: 'Admins' },
  bartender: { one: 'Bartender', many: 'Bartenders' },
  member: { one: 'Member', many: 'Members' },
  guest: { one: 'Guest', many: 'Guests' },
};

// Groups in `BarRole` order (owner first), skipping roles nobody has. Order inside a group is kept as given.
export function groupByRole(members: GetBarMemberDTO[]) {
  return BarRole.options
    .map((role) => [role, members.filter((m) => m.role === role)] as const)
    .filter(([, items]) => items.length > 0);
}
