import React from "react";
import ReactDOM from "react-dom";
import Root from "./ui/root";

function main() {
    const element = document.querySelector("#root");
    ReactDOM.render(React.createElement(Root), element);
}

document.addEventListener("DOMContentLoaded", main);
