import { parseString as parseStringAsync } from "xml2js";
import { promisify } from "util";
import { join } from "path";
import { HashConvert } from "./convert";

interface Item {
    title: string[]
    link: string[]
    pubDate: string[]
    enclosure: [{
        $: {
            url: string,
            type: string
        }
    }]
}

interface ItemParsed {
    title: string
    pubDate: Date
    hash: string
    torrent: string
    save: string
}

const parseString = promisify(parseStringAsync);

export async function parseXML(xml: string) {
    const json = await parseString(xml);
    const list: Item[] = json.rss.channel[0].item;
    let res: ItemParsed[] = [];
    return list.map(parseItem);
}

function parseItem(item: Item): ItemParsed {
    let Magnet = item.enclosure[0].$.url;
    let DHash = Magnet.match(/[2-7A-Z]{32}/)[0];
    let Hash = HashConvert(DHash);
    return {
        title: item.title[0].replace(/\//g, '-'),
        pubDate: new Date(item.pubDate[0]),
        hash: Hash,
        torrent: getTorrent(item.pubDate[0], Hash),
        save: getSavePath(item.pubDate[0], Hash)
    }
}

function getTorrent(dateStr: string, hash: string) {
    const d = new Date(dateStr);
    let path = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0'), hash].join('/');
    return `https://dl.dmhy.org/${path}.torrent`;
}

function getSavePath(dateStr: string, hash: string) {
    const d = new Date(dateStr);
    let rootDir = join(__dirname, '../dmhy');
    let path = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0'), hash].join('/');
    return join(rootDir, `${path}.torrent`);
}