import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * A guard that checks if a user is authenticated before allowing access to a route.
 */
@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  /**
   * Determines if the user is authorized to access the route.
   * @param context - The execution context of the route.
   * @returns A promise that resolves to a boolean indicating if the user is authorized.
   * @throws UnauthorizedException if the user is not authenticated.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const isOptional = this.reflector.get<boolean>(
      'optionalAuth',
      context.getHandler(),
    );

    const token = this.extractTokenFromHeader(request);

    if (!token && !isOptional) {
      throw new UnauthorizedException();
    } else if (!token && isOptional) {
      return true;
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
      });

      if (!payload) {
        throw new UnauthorizedException();
      }

      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }

  /**
   * Extracts the JWT token from the request header.
   * @param request - The HTTP request object.
   * @returns The JWT token if found, otherwise undefined.
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
