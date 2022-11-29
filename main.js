const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const popup = document.querySelector('.copy-container');
const adjust = document.querySelectorAll('.adjust');
const lock = document.querySelectorAll('.lock');
const closeAdjustment = document.querySelectorAll('.close-adjustment');
const sliderContainer = document.querySelectorAll('.sliders');

let initialColors;
let savedPaletts = [];

generateBtn.addEventListener('click', randomColors);

sliders.forEach(slider => {
    slider.addEventListener('input', hslControls);
});

colorDivs.forEach((slider, index) => {
    slider.addEventListener('change', () => {
        updateTextUI(index);
    });
});

currentHexes.forEach(hex => {
    hex.addEventListener('click', () => {
        copyToClipboard(hex);
    });
});

popup.addEventListener('transitionend', () => {
    const popupBox = popup.children[0];
    popup.classList.remove('active');
    popupBox.classList.remove('active');
});

adjust.forEach((button, index) => {
    button.addEventListener('click', () => {
        openAdjustmentPanel(index);
    });
});

closeAdjustment.forEach((button, index) => {
    button.addEventListener('click', () => {
        closeAdjustmentPanel(index);
    });
});

lock.forEach((button, index) => {
    button.addEventListener("click", e => {
      lockLayer(e, index);
    });
  });





function generateHex() {
    return chroma.random();
}

function randomColors() {
    initialColors = [];
    colorDivs.forEach((div, index) => {
        const hexText = div.children[0];
        const randomColor = generateHex();

        if(div.classList.contains('locked')) {
            initialColors.push(hexText.innerText);
            return;
        } else {
            initialColors.push(randomColor.hex());
        }
        div.style.backgroundColor = randomColor;
        hexText.innerHTML = randomColor;
        
        checkTextContrast(randomColor, hexText);

        const color = chroma(randomColor);
        const sliders = div.querySelectorAll('.sliders input');
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorizeSliders(color, hue, brightness, saturation);
    });

    resetInputs();

    adjust.forEach((button, index) => {
        checkTextContrast(initialColors[index], button);
        checkTextContrast(initialColors[index], lock[index]);
    })

}

function checkTextContrast(color, text) {
    const luminance = chroma(color).luminance();
    if(luminance > 0.5){
        text.style.color = "black";
    } else {
        text.style.color = "white";
    }
}

function colorizeSliders(color, hue, brightness, saturation) {
    const noSat = color.set('hsl.s', 0);
    const fullSat = color.set('hsl.s', 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);
    // console.log(scaleSat)

    const midBright = color.set('hsl.l', 0.5);
    const scaleBright = chroma.scale(['black', midBright, "white"]);
    
    saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;
    
    brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(0.5)}, ${scaleBright(1)})`;
    
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204, 75, 75), rgb(204, 204, 75), rgb(75, 204, 75), rgb(75, 204, 204), rgb(75, 75, 204), rgb(204, 75, 204), rgb(204, 75, 75))`;
}

function hslControls(e) {
    const index = 
    e.target.getAttribute('data-hue') ||
    e.target.getAttribute('data-bright') ||
    e.target.getAttribute('data-sat');
    
    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
    const hue = sliders[0]; 
    const brightness = sliders[1];
    const saturation = sliders[2];
    
    const bgColor = initialColors[index];
    // console.log(hue.value);
    let color = chroma(bgColor)
    .set('hsl.h', hue.value)
    .set('hsl.l', brightness.value)
    .set('hsl.s', saturation.value);
    
    colorDivs[index].style.backgroundColor = color;

    colorizeSliders(color, hue, brightness, saturation);
}

function updateTextUI(index) {
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');
    // console.log(icons); 
    textHex.innerText = color.hex();
    checkTextContrast(color, textHex);
    // icons.forEach(icon => {
    //     checkTextContrast(color, icon)
    // })
    for (icon of icons) {
        checkTextContrast(color, icon)
    }
}

function resetInputs() {
    const sliders = document.querySelectorAll('.sliders input');
    sliders.forEach(slider => {
        if(slider.name === 'hue') {
            const hueColor = initialColors[slider.getAttribute('data-hue')];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue);
        }
        if(slider.name === 'saturation') {
            const satColor = initialColors[slider.getAttribute('data-sat')];
            const satValue = chroma(satColor).hsl()[1];
            // console.log((satValue * 100) / 100);
            slider.value = Math.floor(satValue * 100) / 100;
        }
        if(slider.name === 'brightness') {
            const brightColor = initialColors[slider.getAttribute('data-bright')];
            const brightValue = chroma(brightColor).hsl()[2];
            // console.log((Math.floor(brightValue * 100) / 100));
            slider.value = Math.floor(brightValue * 100) / 100;
        }
    });
}

function copyToClipboard(hex) {
    const el = document.createElement('textarea');
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    const popupBox = popup.children[0];
    popup.classList.add('active'); 
    popupBox.classList.add('active'); 
}

function openAdjustmentPanel(index) {
    sliderContainer[index].classList.toggle('active');
}

function closeAdjustmentPanel(index) {
    sliderContainer[index].classList.remove('active');
}

function lockLayer(e, index) {
    const lockSVG = e.target.children[0];
    const activeBg = colorDivs[index];
    activeBg.classList.toggle("locked");
  
    if (lockSVG.classList.contains("fa-lock-open")) {
      e.target.innerHTML = '<i class="fas fa-lock"></i>';
    } else {
      e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
    }
}

const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');

saveBtn.addEventListener('click', openPalette);

function openPalette(e) {
    console.log(e)
    const popup = saveContainer.children[0];
    saveContainer.classList.add('active');
    popup.classList.add('active');
}
  





randomColors();