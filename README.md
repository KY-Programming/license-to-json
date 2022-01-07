# license-to-json (l2j)

| [Documentation](https://mantic-ui.ky-programming.de/semantic/license/use-license-to-json) | [Optional Angular Component](https://mantic-ui.ky-programming.de/semantic/license/angular-component) | [Github Repository](https://github.com/KY-Programming/license-to-json) |

license-to-json is a nodejs script to extract license information from all used packages into a single json file. Missing license information like the license text are automatically collected from the npm package, git repository or spdx (a list of common licenses).

To use it, install [license-to-json](https://www.npmjs.com/package/license-to-json) package
```
npm i license-to-json --save-dev
```

Run this command where your ```package.json``` lays:
```
license-to-json
```

When you use Angular, you can put it into a script, to run before build. Put in your```package.json```
```
{
  ...
  "scripts": {
  ...
  "prebuild": "license-to-json -auth-token=...",
}
```
This creates a ```3d-party-licenses.json``` file beside your ```package.json```

To move it to another output location, use the ```-output=...``` option.
```
l2j -output="src/assets/3d-party-licenses.json
```

You can use ```l2j``` or ```ltj``` instead of ```license-to-json```

## The result looks like this
```
{
  "@angular/common": [
    {
      "type": "MIT",
      "text": "The MIT License\n\nCopyright (c) 2010-2022 Google LLC. https://angular.io/license\n\nPermission is hereby granted, free of charge, to any person obtaining a copy\nof this software and associated documentation files (the \"Software\"), to deal\nin the Software without restriction, including without limitation the rights\nto use, copy, modify, merge, publish, distribute, sublicense, and/or sell\ncopies of the Software, and to permit persons to whom the Software is\nfurnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in\nall copies or substantial portions of the Software.\n\nTHE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\nIMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\nFITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\nAUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\nLIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\nOUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\nTHE SOFTWARE.\n",
      "textSource": "GIT repository"
    }
  ],
  ...
  "tslib": [
    {
      "type": "0BSD",
      "text": "Copyright (c) Microsoft Corporation.\r\n\r\nPermission to use, copy, modify, and/or distribute this software for any\r\npurpose with or without fee is hereby granted.\r\n\r\nTHE SOFTWARE IS PROVIDED \"AS IS\" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH\r\nREGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY\r\nAND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,\r\nINDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM\r\nLOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR\r\nOTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR\r\nPERFORMANCE OF THIS SOFTWARE.",
      "textSource": "NPM package"
    }
  ]
}
```

## Additional parameters
| Parameter | Text | |
| -- | -- | -- |
| -path=... | Path to folder where the package.json and node_modules can be found. Path with blanks has to be enclosed with " like -path="test path/sub" | Optional |
| -node-modules=... | Path to the node_modules folder | Optional |
| -package-lock=... | Path to the package-lock.json | Optional |
| -unlicense=... | License name for packages without licenses. Default: unlicense | Optional |
| -auth-token=... | The token to authenticate against github. This is required if you try to fetch a long list of packages. Then it can happens that github blocks unauthenticated request after a defined limit. The token requires no rights (you can leave all checkboxes blank). | Optional |
| -output=... | Path to the output file. Has to end with .json | Optional |
| -no-auto-detect | Disables the search in npm package folder. If this option is set the script will not search for license file in your local node_modules folder | Optional |
| -no-repository | Disables the search in git repository. If this option is set the script will not search for license file in the packages git repository | Optional |
| -no-spdx | Disables the search in spdx database. If this option is set the script will not search for license file in the spdx database | Optional |
| -no-cache | Disables the load of previous saved information. If this option is set the script will not load the previous saved 3d-party-licenses.json and will overwrite it completely | Optional |
| -no-cleanup | Disables the cleanup of licenses. If this option is set the script will not merge duplicated licenses and will not remove unnecessary licenses | Optional |
| -no-ignored-files | Disables the ignored files from the dev team. If this option is set the script will look up our repository for invalid/unnecessary license files. We try to maintain a list of files that are wrong, duplicated or useless | Optional | 
