import { User } from "../models/user.model";

export const MOCK_USER: User[] = [
    {
        userId:"1",
        name: "Eli KOPTER",
        age: "9",
        icon: "red_fish.png",
        userConfig: {
          showsAnswer: true,
          addition: true,
          substraction: true,
          multiplication: true,
          division: true,
          rewriting: true,
          encryption: true,
        }
    }, {
        userId:"2",
        name: "patrick KOPTER",
        age: "9",
        icon: "yellow_fish.png",
        userConfig: {
          showsAnswer: true,
          addition: true,
          substraction: true,
          multiplication: false,
          division: false,
          rewriting: true,
          encryption: false,
        }
    }, {
        userId:"3",
        name: "lohann KOPTER",
        age: "9",
        icon: "blue_fish.png",
        userConfig: {
          showsAnswer: false,
          addition: true,
          substraction: true,
          multiplication: true,
          division: true,
          rewriting: true,
          encryption: true,
        }
    }, {
        userId:"4",
        name: "juste KOPTER",
        age: "9",
        icon: "turtle.png",
        userConfig: {
          showsAnswer: true,
          addition: false,
          substraction: false,
          multiplication: false,
          division: false,
          rewriting: true,
          encryption: false,
        }
    }
]
