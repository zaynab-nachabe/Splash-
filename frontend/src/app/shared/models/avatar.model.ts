export interface Avatar {
    id: string;
    path: string;
    price: number;
}

export const AVATAR_PRICES: Avatar[] = [
    { id: 'yellow_fish', path: '../../../../assets/images/game/player/yellow_fish.png', price: 0 },
    { id: 'shark', path: '../../../../assets/images/game/player/shark.png', price: 500 },
    { id: 'octopus', path: '../../../../assets/images/game/player/octopus.png', price: 450 },
    { id: 'red_fish', path: '../../../../assets/images/game/player/red_fish.png', price: 400 },
    { id: 'dory', path: '../../../../assets/images/game/player/dory.png', price: 350 },
    { id: 'nemo', path: '../../../../assets/images/game/player/nemo.png', price: 300 },
    { id: 'starfish', path: '../../../../assets/images/game/player/starfish.png', price: 250 },
    { id: 'jellyfish', path: '../../../../assets/images/game/player/jellyfish.png', price: 200 }
];
