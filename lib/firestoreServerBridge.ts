import { execFileSync } from "child_process"
import path from "path"

const READER_SCRIPT = path.join(process.cwd(), "scripts/read-firestore-collection.cjs")

export function readFirestoreCollection<T extends { id: string }>(collectionName: string): T[] {
  try {
    const output = execFileSync(process.execPath, [READER_SCRIPT, collectionName], {
      encoding: "utf8",
      env: process.env,
      maxBuffer: 10 * 1024 * 1024,
    })
    return JSON.parse(output || "[]") as T[]
  } catch (error) {
    console.error(`Node Firestore read failed for ${collectionName}:`, error)
    return []
  }
}
