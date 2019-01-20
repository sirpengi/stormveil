export function partition<T>(coll: T[], size: number): T[][] {
    const result = [];
    for (let i = 0; i < coll.length; i += size) {
        result.push(coll.slice(i, i + size));
    }

    return result;
}
