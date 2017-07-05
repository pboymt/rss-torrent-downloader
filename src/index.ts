import { parse } from "url";
import { HashConvert } from "./convert";
import { downloadText, downloadFile } from "./download";
import { parseXML } from "./parsexml";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const currentDate = new Date();
const dirs = {
    home: join(__dirname, '../dmhy'),
    main: join(__dirname, '../dmhy'),
    year: join(__dirname, '../dmhy', currentDate.getFullYear().toString()),
    month: join(__dirname, '../dmhy', currentDate.getFullYear().toString(), (currentDate.getMonth() + 1).toString().padStart(2, '0')),
    date: join(__dirname, '../dmhy', currentDate.getFullYear().toString(), (currentDate.getMonth() + 1).toString().padStart(2, '0'), (currentDate.getDate()).toString().padStart(2, '0')),
    predate: join(__dirname, '../dmhy', currentDate.getFullYear().toString(), (currentDate.getMonth() + 1).toString().padStart(2, '0'), (currentDate.getDate() - 1).toString().padStart(2, '0')),
}
if (!existsSync(dirs.home)) {
    mkdirSync(dirs.home);
}
if (!existsSync(dirs.main)) {
    mkdirSync(dirs.main);
}
if (!existsSync(dirs.year)) {
    mkdirSync(dirs.year);
}
if (!existsSync(dirs.month)) {
    mkdirSync(dirs.month);
}
// if (!existsSync(dirs.predate)) {
//     mkdirSync(dirs.predate);
// }
if (!existsSync(dirs.date)) {
    mkdirSync(dirs.date);
}

(async () => {
    try {
        const xml = await downloadText(parse('https://share.dmhy.org/topics/rss/rss.xml'));
        // const xml = readFileSync(join(__dirname, '../test.xml'), 'utf-8');
        let list = await parseXML(xml);
        writeFileSync('test.json', JSON.stringify(list));
        let tick = 0;
        for (let item of list) {
            try {
                if (await downloadFile(item.torrent, item.save)) {
                    // console.log(`Torrent File Saved: ${item.title}`);
                    tick += 1;
                }
            } catch (error) {
                throw error;
            }
            await (async () => {
                return new Promise(res => {
                    setTimeout(() => {
                        res();
                    }, 1000);
                });
            });
        }
        console.log(`Add ${tick} New Torents`);
    } catch (error) {
        console.log(error);
    }
})();