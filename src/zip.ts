import { readdirSync, readFileSync, createWriteStream, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import * as jszip from "jszip";

export async function zip(): Promise<[string, number]> {
    const ZIP = new jszip();
    const d = new Date(Date.now() - 1000 * 60 * 60 * 24);
    const dpath = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('/');
    const dfile = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
    const path = join(__dirname, '../dmhy', dpath);
    const zpath = join(__dirname, '../dmhy/zip');
    const fpath = join(__dirname, '../dmhy/zip', `dmhy-${dfile}.zip`);
    if (!existsSync(zpath)) {
        mkdirSync(zpath);
    }
    let dir = readdirSync(path);
    dir.forEach(val => {
        ZIP.file(val, readFileSync(join(path, val)));
    });
    // const ws = createWriteStream(zpath);
    try {
        const res: string = await ZIP.generateAsync({
            type: 'base64',
            streamFiles: true
        });
        writeFileSync(fpath, res, 'base64');
        return [fpath, dir.length];
    } catch (error) {
        console.log(error);
        return [null, null];
    }
}