import { useQuery } from '@tanstack/react-query';
import colors from 'tailwindcss/colors';
import { type LucideIcon, Crown, UsersRound } from 'lucide-react';
import _ from 'lodash';

import { BarDTO, MyBarListDTO } from '@repo/dtos';
import { api } from '~/api';

export const sidebarQuery = {
  queryKey: ['sidebar', 'bars', 'list'],
  queryFn: api.bar.list,
};

export function useSidebarData() {
  return useQuery({
    ...sidebarQuery,
    select: sidebarSelect,
  });
}

export function sidebarSelect(bars: MyBarListDTO[]) {
  console.log('>>> SELECT!!');
  const groups = bars.reduce((acc, curr) => {
    if (curr.barType === 'personal') return { ...acc, personal: curr };
    if (['owner', 'admin'].includes(curr.role)) {
      return { ...acc, owned: { ...acc.owned, bars: [...acc.owned.bars, curr] } };
    }
    return { ...acc, memberOf: { ...acc.memberOf, bars: [...acc.memberOf.bars, curr] } };
  }, _.cloneDeep(emptyGroups));
  return groups;
}

export type BarCategoryConfig = {
  name: string;
  style: {
    color: string;
    backgroundColor: string;
  };
  btnStyle: {
    color: string;
    backgroundColor: string;
  };
  Icon: LucideIcon;
};

export type BarGroup = BarCategoryConfig & { bars: BarDTO[] };

export type BarGroups = {
  personal: BarDTO;
  owned: BarGroup;
  memberOf: BarGroup;
};

const emptyGroups: BarGroups = {
  personal: {} as BarDTO,
  owned: {
    name: 'Owned',
    style: {
      color: colors.violet[400],
      backgroundColor: colors.violet[800],
    },
    btnStyle: {
      color: colors.violet[300],
      backgroundColor: colors.violet[600],
    },
    Icon: Crown,
    bars: [],
  },
  memberOf: {
    name: 'Member',
    style: {
      color: colors.blue[400],
      backgroundColor: colors.blue[800],
    },
    btnStyle: {
      color: colors.blue[300],
      backgroundColor: colors.blue[600],
    },
    Icon: UsersRound,
    bars: [],
  },
};
