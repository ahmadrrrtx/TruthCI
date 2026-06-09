import { nanoid } from "nanoid";

export function createId(prefix: string) {
  return `${prefix}_${nanoid(16)}`;
}
