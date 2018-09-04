import "isomorphic-fetch";
import { CloudcastsPage, Datum } from "./types/cloudcasts";
import { Bar } from "cli-progress";
import * as fs from "fs";
import program from "commander";
import shell from "shelljs";
const dl = require("download-file-with-progressbar");

type Options = {
  maxPages: number;
};

const defaultOptions: Options = {
  maxPages: 0
};

const fetchCloudcasts = async (
  artistName: string,
  options = defaultOptions
) => {
  const url = `https://api.mixcloud.com/${artistName}/cloudcasts/?limit=100`;
  let nextPage: string | undefined = url;
  const pages: CloudcastsPage[] = [];

  console.log(`Fetching Cloudcast data for artist ${artistName}..`);

  while (nextPage) {
    const page: CloudcastsPage = await fetchCloudcastPage(nextPage);
    pages.push(page);

    if (options.maxPages != 0 && pages.length >= options.maxPages) break;

    nextPage = page.paging && page.paging.next ? page.paging.next : undefined;
  }

  return pages;
};

const fetchCloudcastPage = async (url: string) => {
  console.log("Fetching Cloudcast data page at: " + url);
  const response = await fetch(url);
  const obj: CloudcastsPage = await response.json();
  return obj;
};

const download = (url: string, filename: string, bar: Bar) =>
  new Promise((resolve, reject) => {
    dl(url, {
      filename,
      dir: __dirname,
      onDone: (info: any) => {
        resolve();
      },
      onError: (err: any) => {
        reject(err);
      },
      onProgress: (curr: number, total: number) => {
        bar.setTotal(total);
        bar.update(curr);
      }
    });
  });

async function downloadArtistCloudcasts(
  artistName: string,
  outputDir: string,
  options: Options = defaultOptions
) {
  console.log("Starting..", {
    artistName,
    outputDir,
    options
  });

  const pages = await fetchCloudcasts(artistName, options);

  const datums = pages.reduce(
    (prev: Datum[], curr) => [...prev, ...curr.data],
    []
  );

  const casts = datums.map(d => ({
    url: d.url.replace(
      "https://www.mixcloud.com",
      "http://download.mixcloud-downloader.com/d/mixcloud"
    ),
    name: d.name
  }));

  shell.mkdir("-p", outputDir);

  const bar = new Bar({});

  let count = 0;
  for (var cast of casts) {
    count++;
    const filename = `${outputDir}/${cast.name}.m4a`;
    console.log(`Downloading ${count} of ${casts.length} '${cast.name}'...`);
    if (fs.existsSync(`${__dirname}/${filename}`)) {
      console.log("Download already exists.. Skipping...");
      continue;
    }

    bar.start(100, 0);
    await download(cast.url, filename, bar);
    bar.stop();
  }

  console.log("All done, happy listening!");
}

program
  .version("0.0.1")
  .arguments("<artist> <output_directory>")
  .option(
    "-p, --maxPages <maxPages>",
    "the max number of pages of data to fetch for an artist",
    parseFloat,
    defaultOptions.maxPages
  )
  .action((artist, output_directory, options) => {
    downloadArtistCloudcasts(artist, output_directory, {
      maxPages: options.maxPages
    });
  })
  .parse(process.argv);
