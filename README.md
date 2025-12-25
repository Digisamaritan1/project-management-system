# 1. Nodejs Configuration

### 1.1 Nodejs Configuration

Kindly navigate to your project's folder.

1. You must verify that **Npm (v10.2.4)** and **Node (v20.11.1)** are installed for the relevant version. If you're not sure about the version, try to run the given command in the command prompt: <mark style="color:red;">**npm run check-version**</mark>&#x20;
2.  If both the **Node** and **Npm versions** match, then the screen will display the output as shown below:\


    <figure><img src="https://changing-tan-fo0twr3suc-0i4duujol5.edgeone.dev/image199.png" alt=""><figcaption></figcaption></figure>

Else, the screen will display the output as shown below:

<figure><img src="https://spicy-cyan-m3fajvyv6s-2nvmt5gv5f.edgeone.dev/image153.png" alt=""><figcaption></figcaption></figure>

Kindly check if Node is pre-installed in your system. If not, then you need to install it before running Step 1.&#x20;

### Reference to Node Installation:&#x20;

1. [_**Node.js Official Website**_](https://nodejs.org/download/release/v20.11.1/)&#x20;
2. Using NVM [_**https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating**_](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)

### 1.2 Vue CLI install

After the completion of node configuration you need to install the Vue cli using the following Command. Also you can refer to the [official site](https://cli.vuejs.org/guide/installation.html).

```bash
npm install -g @vue/cli
# OR
yarn global add @vue/cli
```

After installation, you will have access to the `vue` binary in your command line. You can verify that it is properly installed by simply running `vue`, which should present you with a help message listing all available commands.

You can check you have the right version with this command:

```
vue --version
```


# 2. Server Startup

### 2.1 Start Server and Installation

Go back to your command prompt after completing Step 1. Now, use the command:

<mark style="color:red;">**npm run basic-install**</mark>

NOTE: if this step thows issue related to the BUILD failure, then you can follow this steps in your terminal

```
// Considering working directory as projects root directory
> cd installation
> npm run build

// On successful build completion, change directory to root
> cd ..

// Run the server using any of the below commands
> npm run start 
// OR
> node server.js
```

This command will generate <mark style="color:red;">env</mark> files and a build for installation.

When the command is done, it will display the output on your command prompt as shown on the screen below.&#x20;

<figure><img src="https://spicy-cyan-m3fajvyv6s-2nvmt5gv5f.edgeone.dev/image153.png" alt=""><figcaption></figcaption></figure>

Thereafter, navigate to <mark style="color:blue;">**http://localhost:4000**</mark>  in your browser.



# 3. Installation Guide

Please make sure to follow through the installation guide properly without skipping any step.

[_**Please follow this document**_](https://help.alianhub.com/app-installation-and-start-guide/4.-installation-guide/4.2-mongodb-verification)
