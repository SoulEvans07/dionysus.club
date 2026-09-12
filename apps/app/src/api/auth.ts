import { MeDTO } from '@repo/dtos';
import { UnauthorizedError } from '~/types/error';

export class AuthAPI {
  public async me() {
    const resp = await fetch('/api/auth/me');

    if (resp.status === 401) throw new UnauthorizedError();
    if (!resp.ok) throw new Error('Failed to fetch current user');

    const data = await resp.json();
    return MeDTO.parse(data);
  }
}
