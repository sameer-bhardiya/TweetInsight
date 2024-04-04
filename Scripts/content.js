/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
    var __webpack_exports__ = {};


    // DOM manipulation functions
    const gptIconSrc = chrome.runtime.getURL("icons/ready.svg");
    const gptIconErrorSrc = chrome.runtime.getURL("icons/error.svg");
    const tweetTypes = [
        { emoji: '✽', type: 'Copy from tweet' }
        
    ];

    const addGPTButton = async (toolbarEl, onClick) => {
        addGPTButtonWithType(toolbarEl, onClick);
    };

    const addGPTButtonWithType = (toolbarEl, onClick) => {
        if (toolbarEl.querySelector("#gptButton")) {
            console.log("GPT button already exists in this toolbar element. Skipping addition.");
            return;
        }

        console.log("Adding new GPT button to toolbar element.");

        const doc = new DOMParser().parseFromString(`
        <div class="gptIconWrapper" id="gptButton">
            <img class="gptIcon" src="${gptIconSrc}" />
        </div>
    `, "text/html");
        const iconWrap = doc.querySelector("div[id=\"gptButton\"]");
        const buttonContainer = toolbarEl.children[0];
        // attach to container
        buttonContainer.appendChild(iconWrap);
        iconWrap.onclick = async () => {
            const bodyRect = document.body.getBoundingClientRect();
            const elemRect = iconWrap.getBoundingClientRect();
            const top = elemRect.top - bodyRect.top;
            const left = elemRect.left - bodyRect.left + 40;
            let optionsList;
            let dismissHandler;
            optionsList = createOptionsList(async (type) => {
                if (dismissHandler) {
                    document.body.removeEventListener('click', dismissHandler);
                }
                if (optionsList) {
                    optionsList.remove();
                }
                iconWrap.classList.add("loading");
                await onClick(type);
                iconWrap.classList.remove("loading");
            });
            optionsList.style.left = `${left}px`;
            optionsList.style.top = `${top}px`;
            document.body.appendChild(optionsList);
            dismissHandler = () => {
                if (dismissHandler) {
                    document.body.removeEventListener('click', dismissHandler);
                }
                if (optionsList) {
                    optionsList.remove();
                }
            };
            window.setTimeout(() => {
                document.body.addEventListener('click', dismissHandler);
            }, 1);
        };
    };

    const createOptionsList = (onClick) => {
        const container = document.createElement("div");
        container.classList.add("gptSelectorContainer");
        for (const tt of tweetTypes) {
            const item = document.createElement("div");
            item.classList.add("gptSelector");
            item.innerHTML = `${tt.emoji}&nbsp;&nbsp;${tt.type}`;
            item.onclick = (e) => {
                e.stopPropagation();
                onClick(tt.type);
            };
            container.appendChild(item);
        }
        return container;
    };

    const showErrorButton = async (toolbarEl) => {
        const gptIcon = toolbarEl.querySelector(".gptIcon");
        if (gptIcon) {
            gptIcon.setAttribute("src", gptIconErrorSrc);
            gptIcon.classList.add("error");
        }
        await wait(5000);
        
        gptIcon?.setAttribute("src", gptIconSrc);
        gptIcon?.classList.remove("error");
    };

    const createObserver = (selector, onInputAdded, onInputRemoved) => {
        return new MutationObserver((mutations_list) => {
            mutations_list.forEach((mutation) => {
                const addedNodes = mutation.addedNodes; // wrong typings
                addedNodes.forEach((added_node) => {
                    if (added_node.querySelector) {
                        const inputEl = added_node.querySelector(selector);
                        if (!!inputEl) {
                            onInputAdded(inputEl);
                        }
                        ;
                    }
                });
                const removedNodes = mutation.removedNodes;
                removedNodes.forEach((removed_node) => {
                    if (removed_node.querySelector) {
                        const inputEl = removed_node.querySelector(selector);
                        if (!!inputEl) {
                            onInputRemoved(inputEl);
                        }
                        ;
                    }
                });
            });
        });
    };

    const findClosestInput = () => {
        console.log("Searching for editable input element in the entire document...");

        // getTwitterUsername();

        // Broaden the search to any div with contenteditable attribute
        const selector = "div[contenteditable='true'][data-testid^='tweetTextarea_']";

        // Search the entire document
        let inputEls = document.querySelectorAll(selector);
        if (inputEls && inputEls.length > 0) {
            console.log("Found input elements using document-wide search:", inputEls);
            // Return the first element found, or a specific one based on additional criteria
            return inputEls[0]; // Adjust this to select the correct element if necessary
        } else {
            console.log("No input elements found in the entire document.");
            return null;
        }
    };

    const setInputText = async (element, text) => {
        // Focus the target element to ensure it can receive input
        element.focus();

        // Clear existing text in the element
        if (element.nodeName === 'INPUT' || element.nodeName === 'TEXTAREA') {
            element.select(); // Selects existing text in input or textarea elements
        } else if (element.contentEditable === 'true') {
            const range = document.createRange();
            range.selectNodeContents(element);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }

        try {
            // Use the Clipboard API to write text
            await navigator.clipboard.writeText(text);

            // Dispatch a "paste" event to the element
            const pasteEvent = new ClipboardEvent('paste', {
                bubbles: true,
                cancelable: true,
                clipboardData: new DataTransfer()
            });
            pasteEvent.clipboardData.setData('text/plain', text);
            element.dispatchEvent(pasteEvent);

            // Clear the clipboard after pasting
            await navigator.clipboard.writeText('');
        } catch (error) {
            console.error('Failed to insert text using the clipboard:', error);
        }
    };

    const whatsHappeningPrompt = (mood) => { "What's happening? " + mood; };

    const onToolBarAdded = (toolBarEl) => {
        const inputEl = findClosestInput(toolBarEl);
        let prompt = '';
        let tweetText = '';
        if (inputEl) {
            addGPTButton(toolBarEl, async (type) => {
                toolBarEl.click();

                console.log("toolBarEl clicked");
                const replyToTweet = document.querySelector("article[data-testid=\"tweet\"][tabindex=\"-1\"]");
                console.log(`replyToTweet is ${replyToTweet}`);
                console.log("ouuter replyToTweet: " + replyToTweet);
                if (!!replyToTweet) {
                    const textEl = replyToTweet.querySelector("div[data-testid=\"tweetText\"]");
                    console.log(`textEl is ${textEl}`);
                    console.log(`textEl.textContent is ${textEl.textContent}`);
                    if (!textEl || !textEl.textContent) {
                        console.log("error... !textEl || !textEl.textContent");
                        showErrorButton(toolBarEl);
                        return;
                    }
                    tweetText = textEl.textContent;
                    console.log("inner sameer1" + tweetText);

                    //prompt = replyPrompt(text, type);

                    if (tweetText === undefined) {
                        tweetText = whatsHappeningPrompt(type);
                        //console.log(`tweet content is: ${tweetText}`);
                    }
                    console.log(`tweet content is: ${tweetText}`);
                }
                else {
                    console.log("inner sameer2");
                    tweetText = whatsHappeningPrompt(type);
                    console.log(`tweet content 2 is: ${tweetText}`);
                }

                // const requestId = inputEl.getAttribute("aria-activedescendant");
                // const text = await generateText(requestId, tweetText, type);
                const text = tweetText;

                console.log(`reply generate by gpt is: ${text}`);
                if (text) {
                    setInputText(inputEl, text);
                }
                else { // show error
                    showErrorButton(toolBarEl);
                    window.alert("Tweet text is empty!");
                }
            });
        }
    };
    const onToolBarRemoved = (toolBarEl) => { };


    // Observe DOM changes
    const toolbarObserver = createObserver("div[data-testid=\"toolBar\"]", onToolBarAdded, onToolBarRemoved);
    const reactRoot = document.querySelector("#react-root");
    toolbarObserver.observe(reactRoot, { subtree: true, childList: true });

})()
;