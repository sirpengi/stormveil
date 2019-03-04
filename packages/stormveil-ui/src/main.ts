import React from "react";
import ReactDOM from "react-dom";
import App from "./app";

function main() {
    const element = document.querySelector("#root");
    if (!element) {
        throw new Error("Unable to find '#root' DOM element, cannot render React application.");
    }

    ReactDOM.render(
        React.createElement(App),
        element,
    );
}

document.addEventListener("DOMContentLoaded", main);
