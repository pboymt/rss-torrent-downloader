import { writeFileSync } from "fs";
import { join } from "path";

writeFileSync(join(__dirname, '../smtpconfig.json'), JSON.stringify({
    "host": "smtp.qq.com",
    "port": 465,
    "secure": true,
    "auth": {
        "user": "123456789@qq.com",
        "pass": "password"
    },
    "to": "abcdefg@qq.com",
    "log": true
}, null, 2));