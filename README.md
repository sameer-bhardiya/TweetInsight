# TweetInsight Chrome Extension for Twitter 
> A template for making a Google Chrome Extension for Twitter.
>
  Video Link,How to configure the this chrome extension :- https://drive.google.com/file/d/1n3XG0GHLfMMJKvjH3vce1BkT-Uwj7Gfc/view

<img src="https://github.com/sameer-bot1/TweetInsight/assets/72939016/015be1ec-0caf-4575-b82a-200e27fd42b2" alt="Screenshot" width="70%" style="border: 2px solid red;">


<img src="https://github.com/sameer-bot1/TweetInsight/assets/72939016/ba2d41f8-1cd1-4d39-ac07-c4fbf82cb636" alt="Screenshot" width="70%">

<img src="https://github.com/sameer-bot1/TweetInsight/assets/72939016/05a7d7fe-bee0-431c-abf5-8d345461570b" alt="Screenshot" width="70%">

## Jump to Section

* [Getting Started](#getting-started)
* [Installation](#installation)
* [Usage](#usage)

## Getting Started

This package has been made to quickly get yourself up and running with making a new Google Chrome extension.  The basic structure of this package is as follows:

    - .git
    - icons/
        -- eror.svg
        -- icon16.png
        -- icon48.png
        -- icon128.png
    - Scripts/
        -- content.js
     - manifest.json
     - README.md
     - style.css


### Installation

- Please either clone this repository or download as a ZIP file.
- Extract the contents into your preferred working directory.
- Open your Google Chrome browser.
- Enter `chrome://extensions/` into the address bar.
- Ensure "Developer Mode" is ticked/enabled in the top right.
- Click on "Load unpacked extension...".
- Navigate to Twitter, where you will see TweetInsight icon on reply Text Area.

## Usage

This package is standalone.  Please visit the Google Developer documentation if you wish to know more about Extension creating:

http://developer.chrome.com/extensions/getstarted.html


### Files to edit

The main files you will need to edit are:

> manifest.json

- This contains all of your extension information.
- As an example, the storage, activeTab, scripting permission has been added.
- content_scripts is added which consist matches , css, js.


> style.css

- styling all the component.
- button width and height .

> content.js

- adding robo button.
- coping original tweet and pasting on reply text area.
- adding functionality of button.