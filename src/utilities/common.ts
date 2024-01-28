import { CustomDecorator, SetMetadata } from '@nestjs/common';

/**
 * Decorator function that sets metadata indicating that authentication is optional.
 * This can be used to annotate routes that do not require authentication.
 * @returns { CustomDecorator<string>} The decorator function.
 */
export const OptionalAuth = (): CustomDecorator<string> =>
  SetMetadata('optionalAuth', true);
