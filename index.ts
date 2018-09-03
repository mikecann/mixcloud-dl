import "isomorphic-fetch";
import { CloudcastsPage, Datum } from "./types/cloudcasts";
import { Bar } from "cli-progress";
const dl = require("download-file-with-progressbar");

type Options = {
    maxPages: number
}

const defaultOptions: Options = {
    maxPages: 0
}

const fetchCloudcasts = async (user: string, options = defaultOptions) => {
    const url = `https://api.mixcloud.com/${user}/cloudcasts/`;
    let nextPage: string | undefined = url;
    const pages: CloudcastsPage[] = [];

    while (nextPage) {

        const page: CloudcastsPage = await fetchCloudcastPage(nextPage);
        pages.push(page);

        if (options.maxPages != 0 && pages.length >= options.maxPages)
            break;

        nextPage = page.paging && page.paging.next ? page.paging.next : undefined;
    }

    return pages;
}


const fetchCloudcastPage = async (url: string) => {
    console.log("fetching cloudcasts page: " + url);
    const response = await fetch(url);
    const obj: CloudcastsPage = await response.json();
    return obj;
}

async function init() {

    const user = process.argv[2];

    if (!user)
        return console.error("Please supply a mixcloud user to download");

    console.log(`Downloading cloudcasts from ${user}..`);

    const pages = await fetchCloudcasts(user, {
        maxPages: 1
    });

    const datums = pages.reduce((prev: Datum[], curr) => [...prev, ...curr.data], []);

    const casts = datums.map(d => ({
        url: d.url.replace("https://www.mixcloud.com",
            "http://download.mixcloud-downloader.com/d/mixcloud"),
        name: d.name
    }));

    const bar = new Bar({});
    bar.start(100, 0);

    for (var cast of casts) {

        console.log(`Downloading '${cast.name}'...`)

        await dl(casts[0], {
            filename: `${cast.name}.m4a`,
            dir: __dirname,
            onDone: (info: any) => {
                console.log('done', info);
            },
            onError: (err: any) => {
                console.log('Error downloading', err);
            },
            onProgress: (curr: number, total: number) => {
                const percent = (curr / total * 100)
                bar.update(percent);
            }
        });

    }





    //const page = await fetchFeedPage(feed.paging.next);
    //console.log(page);
}

init();