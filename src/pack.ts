import { zip } from "./zip";
import { sendMail } from "./mail";
import { log } from "./log";

(async () => {
    const [filename, number] = await zip();
    log(`Add ${number} Torrent Files to Zip`);
    log(`Zip saved at ${filename}`);
    await sendMail(filename);
})();