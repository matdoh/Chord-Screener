export function dynamic_text(input) {
    // Temporarily create a span element to measure text width
    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.style.whiteSpace = 'pre';
    tempSpan.textContent = input.value || input.placeholder;

    // Copy font properties from input to span to ensure consistent measurement
    const inputStyles = window.getComputedStyle(input);
    tempSpan.style.font = inputStyles.font;

    document.body.appendChild(tempSpan);

    // Adjust the input width based on the span's width
    input.style.width = (tempSpan.offsetWidth + 10) + 'px';

    document.body.removeChild(tempSpan);
}