import { readdirSync, existsSync, mkdirSync, readFileSync, createReadStream } from 'fs';
import { join } from "path";
import * as jszip from 'jszip';
import { createTransport } from 'nodemailer';
import { log } from "./log";

interface smtpConfig {
    host: string
    port: number
    secure: boolean
    auth: {
        user: string
        pass: string
    }
    to: string
}

export async function sendMail(filepath: string, config: smtpConfig = null) {
    const Yesterday = new Date(Date.now() - 1000 * 60 * 60 * 24);
    const smtpConfig: smtpConfig = require(join(__dirname, '../smtpconfig.json'));
    log(smtpConfig);
    config = config || smtpConfig;
    const smtpTransport = createTransport(config);
    try {
        const sentMessageInfo = await smtpTransport.sendMail({
            from: '"user" <' + config.auth.user + '>',
            to: config.to,
            subject: `动漫花园${Yesterday.getFullYear()}年${String(Yesterday.getMonth() + 1).padStart(2, '0')}月${String(Yesterday.getDate()).padStart(2, '0')}日种子合集`,
            // subject: '动漫花园' + new Date().getFullYear() + '年' + (new Date().getMonth() * 1 + 1) + '月' + (new Date().getDate() * 1 - 1) + '日种子合集',
            text: '这是一封测试邮件',
            attachments: [{
                content: createReadStream(filepath),
                filename: 'output.zip'
            }]
        });
        log(sentMessageInfo);
    } catch (error) {
        log(error);
    }
}
