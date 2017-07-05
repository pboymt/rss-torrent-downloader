import { join } from "path";
const config = require(join(__dirname, '../smtpconfig.json'));
export function log(message: any) {
    if (config.log) {
        console.log(message);
    }
}