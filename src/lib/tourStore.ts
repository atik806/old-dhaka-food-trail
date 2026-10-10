import { randomBytes } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export interface SavedTour {
  id: string;
  name: string;
  spotIds: string[];
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "tours.json");

async function readAll(): Promise<Record<string, SavedTour>> {
  try {
    return JSON.parse(await readFile(FILE, "utf8"));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return {};
    throw err;
  }
}

// Serialise writes so concurrent saves don't clobber each other.
let queue: Promise<unknown> = Promise.resolve();

export function saveTour(name: string, spotIds: string[]): Promise<SavedTour> {
  const task = queue.then(async () => {
    const tours = await readAll();
    let id: string;
    do id = randomBytes(6).toString("base64url");
    while (tours[id]);
    const tour: SavedTour = { id, name, spotIds, createdAt: new Date().toISOString() };
    tours[id] = tour;
    await mkdir(DATA_DIR, { recursive: true });
    const tmp = `${FILE}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(tours, null, 2));
    await rename(tmp, FILE);
    return tour;
  });
  queue = task.catch(() => undefined);
  return task;
}

export async function getTour(id: string): Promise<SavedTour | null> {
  const tours = await readAll();
  return Object.hasOwn(tours, id) ? tours[id] : null;
}
