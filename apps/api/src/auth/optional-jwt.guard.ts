import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** JWT if present; otherwise allows request with user=null. */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(err: Error | null, user: TUser): TUser | null {
    if (err) {
      return null;
    }
    return user || null;
  }
}
