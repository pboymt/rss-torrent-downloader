import * as http from "http";

export async function request(params: string[]) {
    return new Promise((resolve, reject) => {
        const reqOptions: http.RequestOptions = {
            host: '127.0.0.1',
            port: 8188,
            path: '/' + params.join('/')
        }
        // console.log('/' + params.join('/'));
        const req = http.request(reqOptions, res => {
            console.log(res.statusCode);
            let bufs: Buffer[] = [];
            res.on('data', (chunk: Buffer) => {
                bufs.push(chunk);
            });
            res.on('end', () => {
                const resBuffer = Buffer.concat(bufs);
                const resJSON = JSON.parse(resBuffer.toString('utf-8'));
                if (resJSON.err) {
                    reject(resJSON.err);
                } else {
                    resolve(resJSON.result);
                }
            });
        });
        req.end();
    });
}

export async function getGroupList() {
    return await request(['list', 'group']);
}

export async function sendGroupMessage(groupQQ: string, msg: string) {
    return await request(['send', 'group', groupQQ, msg]);
}

(async () => {
    console.log(await sendGroupMessage('306476372', encodeURIComponent(process.argv[2])));
})();