import "isomorphic-fetch";
import { CloudcastsPage } from "./types/cloudcasts";
import * as R from "ramda";

type Options = {
    maxPages: number
}

const defaultOptions: Options = {
    maxPages: 0
}

const fetchCloudcasts = async (user: string, options = defaultOptions) => {
    const url = `https://api.mixcloud.com/${user}/cloudcasts/`;

    const notAtMaxPages = (pageCount: number) =>
        options.maxPages == 0 || pageCount < options.maxPages;

    const shouldGetNextPage = (nextPage: string | undefined, pages: CloudcastsPage[]) =>
        nextPage && notAtMaxPages(pages.length)

    const cloudcasts = await fetchAllPages(url, [], shouldGetNextPage);

    return cloudcasts;
}

const fetchAllPages = async (url: string, pages: CloudcastsPage[],
    shouldGetNextPage: (nextPage: string | undefined, pages: CloudcastsPage[]) => boolean):

    Promise<CloudcastsPage[]> => {

    const page = await fetchCloudcastPage(url);
    pages = [...pages, page];
    if (page.paging)
        return fetchAllPages(page.paging.next, pages);

    return pages;
}

const fetchCloudcastPage = async (url: string) => {
    console.log("fetching cloudcasts page: " + url);
    const response = await fetch(url);
    const obj: CloudcastsPage = await response.json();
    return obj;
}

async function init() {
    console.log('hello world!');
    const cloudcasts = await fetchCloudcasts("Luc_Forlorn");
    // const dates = feed.data.map(d => ({
    //     created: d.created_time,
    //     name: d.name
    // }));
    // console.log(dates);
    //const page = await fetchFeedPage(feed.paging.next);
    //console.log(page);
}

init();