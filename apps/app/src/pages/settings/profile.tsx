import { H1 } from '~/components/common';
import { Input } from '~/components/shadcn/input';

export function ProfileSettings() {
  return (
    <div>
      <H1>Profile</H1>
      <Input placeholder="Username" />
    </div>
  );
}
