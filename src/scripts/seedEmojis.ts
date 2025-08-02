import path from 'path';
import fs from 'fs/promises';
import { EmojiModel } from '../modules/emojis/emojis.model';

type EmojiJson = { name: string; image: string };

async function readEmojis(): Promise<EmojiJson[]> {
  const file = path.resolve(process.cwd(), 'emoji.json'); 
  const data = await fs.readFile(file, 'utf8');
  return JSON.parse(data);
}

export async function seedEmojis(): Promise<void> {
  const emojis = await readEmojis();

  for (let e of emojis) {
    try {
        await EmojiModel.create({
            name: e.name,
            url: e.image
        })
    } catch (err) {
        console.warn(`Emoji ${e.name} already exists, skipping.`);
    }
  }

}
