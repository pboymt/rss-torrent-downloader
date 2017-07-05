import { get, RequestOptions } from "https";
import { URL } from "url";
import { createWriteStream, existsSync } from "fs";

export async function downloadText(url: string | URL | RequestOptions) {
    return new Promise<string>((resolve, reject) => {
        const req = get(url, res => {
            // console.log(res.statusCode);
            let resBuffer: Buffer[] = [];
            res.on('data', function (chunk: Buffer) {
                // console.log('BODY: ' + chunk);
                resBuffer.push(chunk);
            });
            res.on('end', () => {
                resolve(Buffer.concat(resBuffer).toString('utf-8'));
            });
            res.on('error', err => {
                reject(err);
            });
        });
        req.on('error', err => {
            reject(err);
        });
        req.end();
    });
}

export async function downloadFile(url: string | URL | RequestOptions, savePath: string) {
    return new Promise<string>((resolve, reject) => {
        if (existsSync(savePath)) {
            return null;
        }
        const req = get(url, function (res) {
            let writeStream = createWriteStream(savePath);
            // writeStream.on('finish', function () {
            //     console.log('文件 "' + filename + '" 下载完成');
            // });
            res.pipe(writeStream);
            res.on('end', function () {
                writeStream.end();
                resolve(savePath);
            });
            res.on('error', err => {
                reject();
            });
        });
        req.on('error', err => {
            reject(err);
        });
        req.end();
    });
}