# Website Core

## Core Technology

#### In Production

- [Svelte](https://svelte.dev/)
- [SvelteKit](https://kit.svelte.dev/)
- [StoryBlok](https://www.storyblok.com/)
- [Luxon](https://moment.github.io/luxon/)

See `package.json` for the full list of dependencies

#### In Development

- [Typescript](https://www.typescriptlang.org/)
- [SASS](https://sass-lang.com/)
- [Stylelint](https://stylelint.io/)
- [ESLint](https://eslint.org/)

See `package.json` for the full list of dependencies

## Recomended VSCode Plugins

- ESLint
- Stylelint
- Svelte for VS Code

## Usefull Commands

- `npm run dev` - Start Development Server
- `npm run build` - Compile static files for distribution
- `npm run getTypes` - Get all types from Storblok CLI
- `npm run setTypes` - Add fetched types to application
- `npm run types` - Fecthes and converts types
- `npm run getAll` - gets a JSON file of all content from Storyblok

See `package.json` for more commands

## UI Development Setup (Mac)

1. Setup code repository
   1. Make sure apple developer tools are installed
   1. Initialize git repo in your project folder using `git init`
   1. Make sure you have a SSH setup on you github account
   1. Pull git repo into the project folder
1. Install NodeJS
   1. Install [NVM](https://github.com/nvm-sh/nvm#installing-and-updating) to manage node versions `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash`
   1. Install Node using nvm `nvm install --lts` then set it to the default `nvm alias default --lts`
1. Setup code editor
   1. Install [VS Code](https://code.visualstudio.com/) (Not required but reccomended)
1. Run project in development mode
   1. Browse to project folder root and and run `npm install` to install all local dependencies
   1. Start local development server by running `npm run dev`

## Type Setup
[Storyblok CLI](https://www.storyblok.com/docs/Guides/command-line-interface) is used for fecthing Storyblok JSON structure and [storyblok-generate-ts](https://www.npmjs.com/package/storyblok-generate-ts) is used for creating typescript types fromt he JSON.  You can use the following commands to fecth and set types.  Storyblok CLI must be globally installed.

1. run `storyblok login`
1. Enter storyblok login information
1. run `npm run types`

This will need to be done whenever you change the data schema within storyblok in order to keep things in sync.  Will work to automate this more later.


## (Update Needed) Mobile UI Development Setup (Mac, iPhone)

1. Share internet and set computer name on mac by going to **System Preferences -> Sharing** then checking **Internet Sharing**
1. Edit computer name on that sharing screen to something short you can easily type on iphone
1. Plug ipohone into mac using USB cable
1. Make sure iphone and macbook are on same wifi network
1. Make sure development server is running and availble via browser on your mac (see steps above)
1. Open safari on iPhone and browser to `https://{{computerName}}.local:8080` (you may have to accept security cert)
1. if desired you can open Safari on your mac and click the **Develop** menu from the header, from there you should see the name of your iphone listed and can open up a web inspector for your iphone browser.

## Making changes 

Create a local branch off of dev for local changes, test locally, when it is good make a PR to `dev`. Then you can test the live dev deployment in Storyblok or at https://pastors-workshop-dev.vercel.app
once done testing, you can PR to `prod` and merge. Once merged, the change will update the live site. 
