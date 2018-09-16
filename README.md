# mixcloud-dl

A handy CLI that downloads all the mixes for a given artist.

Should work everywhere python works. Makes heavy use of the excellent [youtube-dl](https://github.com/rg3/youtube-dl) library.

It will skip downloads that have already been downloaded.

Currently runs single threaded so not to trigger API flooding on mixcloud.

## Install

Ensure you have Python installed and `pip` is available on the command line.

Clone this repo then:

`yarn install`

## Usage

`yarn start <artist> <outputdir>`

e.g.

`yarn start Luc_Forlorn ./out`

## Develop

`yarn install`
`yarn dev`
`yarn start -h`
