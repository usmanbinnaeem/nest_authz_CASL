/* eslint-disable prettier/prettier */
import {
    Ability,
    AbilityBuilder,
    AbilityClass,
    ExtractSubjectType,
    InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { Action } from './actions.enum';

export type Subjects = InferSubjects<typeof User> | 'all';
export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class AbilityFactory {
    defineAbility(user: User) {
        const { can, cannot, build } = new AbilityBuilder(
            Ability as AbilityClass<AppAbility>,
        );

        if (user.isAdmin) {
            can(Action.manage, 'all');
            cannot(Action.manage, User, { orgId: { $ne: user.orgId } }).because(
                'You can only manage user in your own organization',
            );
        } else {
            can(Action.read, 'all');
            cannot(Action.create, User).because('only admins allowed to create');
            cannot(Action.delete, User).because(
                'You Admin allowed to perform delete User',
            );
        }

        return build({
            detectSubjectType: (item) =>
                item.constructor as ExtractSubjectType<Subjects>,
        });
    }
}
