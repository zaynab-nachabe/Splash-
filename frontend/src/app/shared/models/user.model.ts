import { UserConfig } from "./user-config.model";

export type User = {
    userId: string;
    name: string;
    age: string;
    icon: string;
    conditions: string[];
    userConfig: UserConfig;
}


export function createUser(user: Partial<User>): User {
  return {
    userId: user.userId || '',
    name: user.name || '',
    age: user.age || '',
    icon: user.icon || 'pp-9.png',
    conditions: user.conditions || [],
    userConfig: user.userConfig || {} as UserConfig
  };
}
