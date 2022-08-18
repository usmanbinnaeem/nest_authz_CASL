/* eslint-disable prettier/prettier */
import { ForbiddenError } from '@casl/ability';
import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { currentUser } from '../user/current-user';
import { CHECK_Ability, RequiredRole } from './abilities.decorator';
import { AbilityFactory } from './ability.factory';

@Injectable()
export class AbilitiesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private caslAbilityFactory: AbilityFactory,
    ) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const rules =
            this.reflector.get<RequiredRole[]>(CHECK_Ability, context.getHandler()) ||
            [];
        const user = currentUser;
        const ability = this.caslAbilityFactory.defineAbility(user);

        try {
            rules.forEach((rule) =>
                ForbiddenError.from(ability).throwUnlessCan(rule.action, rule.subject),
            );

            return true;
        } catch (error) {
            if (error instanceof ForbiddenError) {
                throw new ForbiddenException(error.message);
            }
        }
    }
}
