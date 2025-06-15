import { UserConfig } from "./user-config.model";

export type User = {
    userId: string;
    name: string;
    age: string;
    icon: string;
    conditions: string[];
    userConfig: UserConfig;
    musicEnabled?: boolean;
    effectsEnabled?: boolean;
    showScore?: boolean;
    selectedPlayerImage?: string | null;
    crabSpeed?: 'slow' | 'fast';  // Add this type
    money?: number; // Make money optional
    unlockedAvatars?: string[];
    limitedLives?: boolean; // Add new property
}


export function createUser(user: Partial<User>): User {
  return {
    userId: user.userId || '',
    name: user.name || '',
    age: user.age || '',
    icon: user.icon || 'pp-9.png',
    conditions: user.conditions || [],
    userConfig: user.userConfig || {} as UserConfig,
    musicEnabled: user.musicEnabled ?? true,
    effectsEnabled: user.effectsEnabled ?? true,
    showScore: user.showScore ?? true,
    money: 0,
    unlockedAvatars: user.unlockedAvatars || ['yellow_fish'],
    limitedLives: user.limitedLives ?? true, // Default to true
    crabSpeed: user.crabSpeed || 'slow',  // Default to slow speed
  };
}
