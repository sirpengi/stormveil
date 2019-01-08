type Vector = [number, number];
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
