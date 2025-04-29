import { User } from "../models/user.model";

export const MOCK_USER: User[] = [
  {
    userId: "1",
    name: "Eli KOPTER",
    age: "9",
    icon: "red_fish.png",
    conditions: ["Dyslexia", "ADHD"],
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
    userId: "2",
    name: "Judas BRICOT",
    age: "9",
    icon: "yellow_fish.png",
    conditions: ["Dyscalculia"],
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
    userId: "3",
    name: "Lucie FERT",
    age: "9",
    icon: "blue_fish.png",
    conditions: [],
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
    userId: "4",
    name: "Justin BRACAGE",
    age: "9",
    icon: "turtle.png",
    conditions: ["Visual Processing Disorder"],
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
