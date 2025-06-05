//imports
import { dynamic_text } from "./inc/utils.js";

const loginfield=document.getElementById("loginfield");

loginfield.addEventListener('input', () => dynamic_text(loginfield));
dynamic_text(loginfield);