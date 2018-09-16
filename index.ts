import "isomorphic-fetch";
import { CloudcastsPage, Datum } from "./types/cloudcasts";
import * as fs from "fs";
import program from "commander";
import shell from "shelljs";
import { ensureYoutubeDlIsIntalled, download } from "./download";

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

  await ensureYoutubeDlIsIntalled();

  const pages = await fetchCloudcasts(artistName, options);

  const datums = pages.reduce(
    (prev: Datum[], curr) => [...prev, ...curr.data],
    []
  );

  const casts = datums.map(d => ({
    url: d.url,
    name: d.name
  }));

  shell.mkdir("-p", outputDir);

  let count = 0;
  for (var cast of casts) {
    count++;
    const filename = `${outputDir}/%(title)s-%(id)s.%(ext)s`;
    console.log(`Downloading ${count} of ${casts.length} '${cast.name}'...`);
    if (fs.existsSync(`${filename}`)) {
      console.log("Download already exists.. Skipping...");
      continue;
    }

    await download(cast.url, filename);
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
