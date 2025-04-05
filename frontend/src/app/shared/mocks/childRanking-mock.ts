export const childstatMock = (() => {
    const userNames = ["Eli Kopter", "Lohann Kopter", "Patrick Kopter", "Juste Kopter"];
    const mock: { [key: string]: number } = {};
    const ranks = Array.from({ length: userNames.length }, (_, i) => i + 1);

    for (let i = ranks.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ranks[i], ranks[j]] = [ranks[j], ranks[i]];
    }

    userNames.forEach((name, index) => {
        mock[name] = ranks[index];
    });

    return mock;
})();


