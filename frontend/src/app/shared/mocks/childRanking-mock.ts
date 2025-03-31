import { UserService } from "../services/user.service";
//the weird (() => {}) is an IIFE which is a function that defines a function and invokes it immediately
//I used it in this context because without it i would need to define a seperate function and call it explicitly
//the IIFE is a cleaner solution.
//it is not necessary if you don't like it you can get rid of it.
export const childstatMock = (() => {
    //i thought maybe we could do a dictionnary where the key is the userID and the value is the rank
    //so the mock would need to fetch the user ID first then i put whatever number as value
    const userService = new UserService();
    const users = userService['users'];
    const mock: {[key: string]: number} = {};
    const ranks = Array.from({ length: users.length }, (_, i) => i + 1);
    //shuffle
    for (let i = ranks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ranks[i], ranks[j]] = [ranks[j], ranks[i]];
    }
    users.forEach((user, index) => {
        mock[user.userId] = ranks[index];
    })

    return mock;
})();


