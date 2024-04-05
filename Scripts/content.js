/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
    var __webpack_exports__ = {};

    // DOM manipulation functions
    const gptIconSrc = chrome.runtime.getURL("icons/ready.svg");
    const gptIconErrorSrc = chrome.runtime.getURL("icons/error.svg");
    const tweetTypes = [
        { emoji: '✽', type: 'Copy from tweet' }

    ];

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
            // await navigator.clipboard.writeText('');
        } catch (error) {
            console.error('Failed to insert text using the clipboard:', error);
        }
    };

    const onToolBarAdded = (toolBarEl) => {
        const inputEl = findClosestInput(toolBarEl);
        let prompt = '';
        let tweetText = '';
        if (inputEl) {

            if (toolBarEl.querySelector("#gptButton")) {
                console.log("TweetInsight button already exists in this toolbar element. Skipping addition.");
                return;
            }

            console.log("Adding new TweetInsight button to toolbar element.");

            const doc = new DOMParser().parseFromString(`
                <div class="gptIconWrapper" id="gptButton">
                    <img class="gptIcon" src="${gptIconSrc}" />
                </div>
                `, "text/html");
            const iconWrap = doc.querySelector("div[id=\"gptButton\"]");
            const buttonContainer = toolBarEl.children[0];
            // attach to container
            buttonContainer.appendChild(iconWrap);

            iconWrap.onclick = async () => {
                const bodyRect = document.body.getBoundingClientRect();
                const elemRect = iconWrap.getBoundingClientRect();
                let dismissHandler;
                console.log("icon clicked");
                const replyToTweet = document.querySelector("article[data-testid=\"tweet\"][tabindex=\"-1\"]");
                console.log(`replyToTweet is ${replyToTweet}`);

                if (!!replyToTweet) {
                    const textEl = replyToTweet.querySelector("div[data-testid=\"tweetText\"]");
                    
                    if (textEl && !textEl.textContent) {
                        console.log("error... !textEl || !textEl.textContent");
                        showErrorButton(toolBarEl);
                        window.alert("alert");
                        return;
                    }
                    
                    console.log(`textEl.textContent is ${textEl.textContent}`);
                    tweetText = textEl.textContent;
                }
                else {
                    console.log(`tweet content 2 is: ${tweetText}`);
                }

                const text = tweetText;
                if (text) {
                    setInputText(inputEl, text);
                }
                else { // show error
                    showErrorButton(toolBarEl);
                    window.alert("Tweet text is empty!");
                }

                dismissHandler = () => {
                    if (dismissHandler) {
                        document.body.removeEventListener('click', dismissHandler);
                    }
                };
                window.setTimeout(() => {
                    document.body.addEventListener('click', dismissHandler);
                }, 1);
            };
        }
    };
    const onToolBarRemoved = (toolBarEl) => { };

    // Observe DOM changes
    const toolbarObserver = createObserver("div[data-testid=\"toolBar\"]", onToolBarAdded, onToolBarRemoved);
    const reactRoot = document.querySelector("#react-root");
    toolbarObserver.observe(reactRoot, { subtree: true, childList: true });

})()
    ;