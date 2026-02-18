import { randomBytes } from "crypto";

let _id: Buffer | undefined;

export const genId = (): Buffer => {
  return _id ?? (_id = (() => {
    const id = randomBytes(20);
    Buffer.from('-RT0001-').copy(id, 0);
    return id;
  })());
}