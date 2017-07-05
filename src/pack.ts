import { zip } from "./zip";
import { sendMail } from "./mail";

(async () => {
    const [filename, number] = await zip();
    await sendMail(filename);
})();