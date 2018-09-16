import shell from "shelljs";

const installYoutubeDl = () => {
  const resp = shell.exec(`pip install --upgrade youtube-dl`);
  if (resp.stderr) throw new Error("Youtube dl could not be installed");
};

const ensurePipInstalled = () => {
  console.log("Looking for pip..");
  const resp = shell.exec(`pip --version`);
  if (resp.stderr)
    throw new Error(
      "Pip could not be found on the command line, please ensure Python and Pip are installed and available on the command line!"
    );
  console.log("Pip is installed.");
};

export const ensureYoutubeDlIsIntalled = () => {
  console.log("Looking for youtube-dl..");
  const resp = shell.exec(`youtube-dl --version`);
  if (resp.stderr) {
    console.log("youtube-dl missing.");
    ensurePipInstalled();
    installYoutubeDl();
  }
  console.log("youtube-dl is installed.");
};

export const download = (url: string, output: string) => {
  const resp = shell.exec(`youtube-dl "${url}" -o "${output}"`);
  if (resp.stderr) throw new Error("Error during download.");
};
