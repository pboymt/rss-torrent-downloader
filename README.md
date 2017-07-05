# DMHY RSS Torrent Downloader

## How to use?

```bash
$ git clone https://github.com/pboymt/rss-torrent-downloader.git
$ npm install
$ npm run compile
$ npm run catch  # Get DMHY RSS and Download Torrents
$ npm run config # Generate a smtpconfig.json file
$ npm run mail   # Packaging Torrents File of yesterday to .zip file and send by SMTP.
```

## Add to crontab in linux

```
$ crontab -e
```

```
*/30 * * * * /usr/local/bin/node /path/to/dir/bin/index
15 0 * * * /usr/local/bin/node /path/to/dir/bin/pack
```