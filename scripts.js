document.addEventListener("DOMContentLoaded", function () {
    // Fonts
    const bookmaniaRegular = new FontFace('BookmaniaRegular', 'url(../fonts/bookmania-regular.otf)');
    const mrsEaves = new FontFace('MrsEaves', 'url(../fonts/mrseaves.ttf)');
    const dense = new FontFace('Dense', 'url(../fonts/dense.otf)', { stretch: "50% 200%" },);

    Promise.all([bookmaniaRegular.load(), mrsEaves.load(), dense.load()])
        .then(fonts => {
            fonts.forEach(font => {
                document.fonts.add(font);
            });

        });

    const numbers = ['1', '2', '3', '4', '5', '6'];
    const types = ['armor', 'item', 'weapon'];
    const curseOptions = ['', '_cursed'];
    
    // Array to store the preloaded image objects
    let images = [];

    // Loop through all combinations and preload the images
    for (const number of numbers) {
        for (const type of types) {
            for (const curseOption of curseOptions) {
                const imageName = `${number}_${type}${curseOption}.png`;
                const imagePath = `images/${imageName}`;
        
                images.push(imagePath);
            }
        }
    }
    images.push('images/type_armor.png');
    images.push('images/type_potion.png');
    images.push('images/type_ring.png');
    images.push('images/type_rod.png');
    images.push('images/type_scroll.png');
    images.push('images/type_staff.png');
    images.push('images/type_wand.png');
    images.push('images/type_weapon.png');
    images.push('images/type_wondrous_item.png');

    let loadedImages = {};
    let promiseArray = images.map(function(imgurl){
        let prom = new Promise(function(resolve,reject){
            let img = new Image();
            img.onload = function(){
                loadedImages[imgurl] = img;
                resolve();
            };
            img.src = imgurl;
        });
        return prom;
    });
    
    Promise.all(promiseArray);
    console.log(promiseArray);  
    console.log(loadedImages);
    const raritySelect = document.getElementById("rarity-select");
    const itemSelect = document.getElementById("item-select");
    const cursed = document.getElementById("cursed-toggle");
    const canvas = document.getElementById("card-canvas");
    const ctx = canvas.getContext("2d");
    const typeSelect = document.getElementById("type-select");
    const cardTitleInput = document.getElementById("card-title-input");
    const imageShiftX = document.getElementById("image-shift-x");
    const imageShiftY = document.getElementById("image-shift-y");
    const imageScaleX = document.getElementById("image-scale-x");
    const imageScaleY = document.getElementById("image-scale-y");
    const imageRotate = document.getElementById("image-rotate");


    const cardDescriptionInput = document.getElementById("card-description-input");
    const cardImageInput = document.getElementById("image-input");
    const exportButton = document.getElementById("export-button");    
    const inputs = document.querySelectorAll("input");
    const selectors = document.querySelectorAll("select");
    
    for (let i = 0; i < inputs.length; i++) {
        inputs[i].addEventListener('input', update_canvas);
    }
    for (let i = 0; i < selectors.length; i++) {
        selectors[i].addEventListener('change', update_canvas);
    }
    cardDescriptionInput.addEventListener('input', update_canvas)
    itemSelect.addEventListener("input", update_customization_options);

    let download = false;
    exportButton.addEventListener("click", function () {
        update_canvas();
        download = true;
    });

    function update_canvas() {
        console.log('--- Canvas update ---');

        // Canvas Constants
        const exportWidth = 750                                   // Creates exportWidth and assigns it to 750 pixels
        const exportHeight = 1050                                 // Creates exportHeight and assigns it to 1050 pixels
        canvas.width = exportWidth;                         // Sets the canvas width to exportWidth
        canvas.height = exportHeight;                       // Sets the canvas height to exportHeight
        // Title Values
        const title = cardTitleInput.value; // Gets the text from the cardTitle Input
        const titleX = 518;                 // Sets the X value for the title
        const titleY = 146;                 // Sets the centered y value for the card title
        const titleWidth = 345;             // Sets the maximum width for each line
        const titleHeight = 40;             // Sets the desired line height
        // Description Values
        const description = cardDescriptionInput.value;  // Get the text from the cardDescription Input
        const descriptionX = 56;                    // 
        let descriptionY = 538;
        const descriptionWidth = 638;
        const descriptionHeight = 18;
        // Other text values
        const itemType = itemSelect.value;
        // Image Values


        // Clears the canvas
        ctx.clearRect(0, 0, exportWidth, exportHeight);
        
        // Draw the card background and card type
        ctx.drawImage(update_background(), 0, 0, exportWidth, exportHeight);
        ctx.drawImage(update_type(), 0, 0, exportWidth, exportHeight);
        const image = update_image();
        if (image) {
            image.onload = function () {
                
                let maxWidth = 0;
                let maxHeight = 0;
                let shiftX = imageShiftX.valueAsNumber;
                let shiftY = imageShiftY.valueAsNumber;
                let scaleX = imageScaleX.valueAsNumber;
                let scaleY = imageScaleY.valueAsNumber;
                let rotate = imageRotate.valueAsNumber;

                if (itemType === "armor") {
                    maxWidth = 248;
                    maxHeight = 347;
                    shiftX += 197;
                    shiftY += 222;
                } else if (itemType === "weapon") {
                    maxWidth = 277;
                    maxHeight = 368;
                    shiftX += 196;
                    shiftY += 230;
                } else if (itemType === "item") {
                    maxWidth = 272;
                    maxHeight = 364;
                    shiftX += 190;
                    shiftY += 234;
                }

                const originalWidth = image.width;
                const originalHeight = image.height;
                const scaleFactor = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
                const scaledWidth = originalWidth * scaleFactor * (scaleX / 100);
                const scaledHeight = originalHeight * scaleFactor * (scaleY / 100);
        
                const x = shiftX - scaledWidth / 2;
                const y = shiftY - scaledHeight / 2;
                
                // Saves the current canvas state, so the image can be rotated. The image is drawn, and then the canvas's previous state is restored.
                ctx.save();
                ctx.translate(x + scaledWidth / 2, y + scaledHeight / 2);                               // Translate the canvas origin to the center of the image
                ctx.rotate((rotate * Math.PI) / 180);                                                   // Rotate the canvas
                ctx.drawImage(image, -scaledWidth / 2, -scaledHeight / 2, scaledWidth, scaledHeight);    // Draw the rotated image
                ctx.restore();                                                                          // Restore the canvas state
            
                // BANDAID
                if (download == true) {
                    const dataURL = canvas.toDataURL("image/png");
                    const downloadLink = document.createElement("a");
                    downloadLink.href = dataURL;
                    downloadLink.download = (+raritySelect.value - 1).toString() + title + ".png";
                    downloadLink.click();
                    download = false;
                }
            };
        };
        
        draw_title(ctx, title, titleX, titleY, titleWidth, titleHeight);                                        // Draws the card title

        if (itemType === "armor") {         // Draws the armor properties
            draw_armor(ctx);
            descriptionY = 538;
        } else if (itemType === "weapon") { // Draws the weapon properties
            draw_weapon(ctx);
            descriptionY = 526;
        } else if (itemType === "item") {   // Draws the item properrties
            draw_item(ctx);
            descriptionY = 451;
            console.log('HEEY');
        }

        draw_description(ctx, description, descriptionX, descriptionY, descriptionWidth, descriptionHeight);    // Draws the card description

        console.log('---Update Complete---')
        
    }

    function update_background() {
        let selectedValue = 'images/' + raritySelect.value + '_' + itemSelect.value;
        if ( cursed.checked ) {
            selectedValue += "_cursed.png"
        } else {
            selectedValue += ".png"
        }
        return(loadedImages[selectedValue]);
    }

    function update_type() {
        let selectedValue = 'images/' + typeSelect.value;
        return(loadedImages[selectedValue]);
    }

    function update_image() {
        if (cardImageInput.files[0]) {
            const selectedFile = cardImageInput.files[0];
            
            let img = new Image();
            img.src = URL.createObjectURL(selectedFile);
            return img;
        } else {
            return false;
        };
    }

    // Draws the title text
    function draw_title(ctx, title, titleX, titleY, titleWidth, titleHeight) {
        ctx.font = "36px 'mrsEaves'";    // Sets the font to 36px Fantasy
        ctx.fillStyle = "#000";         // Sets the font color to black
        ctx.textAlign = "center";       // Center the text horizontally

        const words = title.split(' ');
        let lines = [];
        let currentLine = words[0];
        for (let i = 1; i < words.length; i++) {
            const testLine = currentLine + ' ' + words[i];
            const testWidth = ctx.measureText(testLine).width;
            if (testWidth > titleWidth) {
                lines.push(currentLine);
                currentLine = words[i];
            } else {
                currentLine = testLine;
            }
        }
        lines.push(currentLine);                                // Add the last line
        
        const totalHeight = lines.length * titleHeight; // Calculates the total height of all lines
        const startY = titleY - (totalHeight / 2);      // Calculates the starting y-coordinate for vertical centering
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const currentY = startY + i * titleHeight;
            ctx.fillText(line, titleX, currentY);
        }
    }

    // Draws the description text
    function draw_description(ctx, description, descriptionX, descriptionY, descriptionWidth, descriptionHeight) {
        ctx.font = "18px 'BookmaniaRegular', serif";  // Adjust font and size
        ctx.fillStyle = "#000";                 // Set text color
        ctx.textAlign = "left";                 // Left horizontal alignment
        ctx.letterSpacing = "0px";

        let lines = [];                             // Creates an array for each line of text that fits in the designated space
        const paragraphs = description.split('\n'); // Splits up different paragraphs at new lines

        for (let i = 0; i < paragraphs.length; i++) {   // Iterates through each paragraph in the paragraphs list
            const paragraph = paragraphs[i];                // Assigns the current paragraph to paragraph so it can be modified
            const words = paragraph.split(/(\s)/);             // Gets a list of words from each paragraph
            let currentLine = '';                           // Creates currentLine to represent the current line of text being outputted, and sets it to nothing.
            
            for (let j = 0; j < words.length; j++) {                                // Iterates through all words in the current paragraph
                const testLine = currentLine + words[j];     // Creates a testline for determing whether the current line + the next word would be too large to print.
                const testWidth = ctx.measureText(testLine).width;                      // Measures how large the testLine would be if printed onto the canvas
                if (testWidth > descriptionWidth) {                                     // If the size of the testLine is larger than the description should be:
                    lines.push(currentLine);                                                // Output currentLine to the list of lines
                    currentLine = words[j];                                                 // Start a new line by setting currentLine to the current word
                } else {                                                                // Else
                    currentLine = testLine;                                                 // The size of the line is fine, and so the current line is set to the test line.      
                }
            }
            lines.push(currentLine);    // After all words in a paragraph have been iterated through, adds the current line to lines. There is always a newline at the end of a paragraph.
        }

        for (let i = 0; i < lines.length; i++) {                                    // Iterates through each line generated
            const line = lines[i];                                                      // Sets line to the current line being iterated on
            const currentY = descriptionY + i * descriptionHeight;                      // Sets the line's Y value to the Y value of the description + the height of each line multiplied by the amount of previous lines
            ctx.fillText(line, descriptionX, currentY);      // Draws the line //  + leadingSpaces.length * 8
        }
    }

    // Draws the armor text
    function draw_armor(ctx) {
        ctx.font = "bold 46px 'dense'";              // Sets the font of the properties
        ctx.textAlign = "left";                     // Sets the text alignment of the properties
        ctx.textBaseline = "middle";                // Sets the text baseline of the properties
        ctx.fillStyle = "rgba(255, 255, 255, 1)";     // Sets the color of the text to a darker shade of the wooden background, and turns the opacity down
        ctx.letterSpacing = "-1px";

        const acText = "AC: ";
        const stealthText = "Stealth: ";
        const strengthText = "Strength: ";
        const attunementText = "Attunement: ";
        const valueText = "";

        ctx.fillText(acText, 361, 261);
        ctx.fillText(stealthText, 361, 338);
        ctx.fillText(strengthText, 361, 410);
        ctx.fillText(attunementText, 361, 480);
        ctx.fillText(valueText, 192, 480);

        const armorClassWidth = ctx.measureText(acText).width;
        const stealthWidth = ctx.measureText(stealthText).width;
        const strengthWidth = ctx.measureText(strengthText).width;
        const attunementWidth = ctx.measureText(attunementText).width;
        const goldWidth = ctx.measureText(valueText).width;
        

        ctx.font = "46px 'dense'";    // Sets the font to 36px Fantasy

        ctx.fillText(document.getElementById("armor-ac-input").value, 361 + armorClassWidth, 261)
        if (document.getElementById("armor-stealth-toggle").checked ) {
            ctx.fillText("Disadvantage", 361 + stealthWidth, 338)
        } else {
            ctx.fillText("Standard", 361 + stealthWidth, 338)
        }        
        ctx.fillText(document.getElementById("armor-strength-input").value, 361 + strengthWidth, 410)
        ctx.fillText(document.getElementById("armor-attunement-input").value, 361 + attunementWidth, 480)
        ctx.textAlign = "center";
        ctx.fillText(document.getElementById("armor-gold-input").value, 192 + goldWidth, 480)

    }

    // Draws the item text
    function draw_item(ctx) {
        ctx.font = "bold 46px 'dense'";              // Sets the font of the properties
        ctx.textAlign = "left";                     // Sets the text alignment of the properties
        ctx.textBaseline = "middle";                // Sets the text baseline of the properties
        ctx.fillStyle = "rgba(255, 255, 255, 1)";     // Sets the color of the text to a darker shade of the wooden background, and turns the opacity down
        ctx.letterSpacing = "-1px";

        const attunementText = "Attunement: ";
        const valueText = "";

        ctx.fillText(attunementText, 361, 272);
        ctx.fillText(valueText, 529, 372);

        const attunementWidth = ctx.measureText(attunementText).width;
        const goldWidth = ctx.measureText(valueText).width;
        
        ctx.font = "46px 'dense'";    // Sets the font to 46px dense

        ctx.fillText(document.getElementById("item-attunement-input").value, 361 + attunementWidth, 272)
        ctx.textAlign = "center";
        ctx.fillText(document.getElementById("item-gold-input").value, 529 + goldWidth, 372)

    }

    // Draws the weapon text
    function draw_weapon(ctx) {
        ctx.font = "bold 46px 'dense'";              // Sets the font of the properties
        ctx.textAlign = "left";                     // Sets the text alignment of the properties
        ctx.textBaseline = "middle";                // Sets the text baseline of the properties
        ctx.fillStyle = "rgba(255, 255, 255, 1)";     // Sets the color of the text to a darker shade of the wooden background, and turns the opacity down
        ctx.letterSpacing = "-1px";

        const damageText = "Damage: ";
        const propertiesText = "Properties: ";
        const attunementText = "Attunement: ";
        const valueText = "";
        const boxWidth = 333;
        const lineHeight = 43;

        ctx.fillText(damageText, 361, 252);
        ctx.fillText(propertiesText, 361, 352);
        ctx.fillText(attunementText, 361, 466);
        ctx.fillText(valueText, 192, 466);

        let damageWidth = ctx.measureText(damageText).width;
        const damage = document.getElementById("weapon-damage-input").value;
        let propertiesWidth = ctx.measureText(propertiesText).width;
        const properties = document.getElementById("weapon-properties-input").value;
        const attunementWidth = ctx.measureText(attunementText).width;
        const goldWidth = ctx.measureText(valueText).width;
        

        ctx.font = "46px 'dense'";    // Sets the font to 36px Fantasy

        let lines = [];                             // Creates an array for each line of text that fits in the designated space
        let words = damage.split(' ');             // Gets a list of words from each paragraph
        let currentLine = words[0];                           // Creates currentLine to represent the current line of text being outputted, and sets it to nothing.

        for (let j = 1; j < words.length; j++) {                                // Iterates through all words in the current paragraph
            const testLine = currentLine + ' ' + words[j];     // Creates a testline for determing whether the current line + the next word would be too large to print.
            const testWidth = ctx.measureText(testLine).width;                      // Measures how large the testLine would be if printed onto the canvas
            if (testWidth > boxWidth - damageWidth) {                                     // If the size of the testLine is larger than the description should be:
                lines.push(currentLine);                                                // Output currentLine to the list of lines
                currentLine = words[j];                                                 // Start a new line by setting currentLine to the current word                                     
                damageWidth = 0;
            } else {                                                                // Else
                currentLine = testLine;                                                 // The size of the line is fine, and so the current line is set to the test line.      
            }
        }
        damageWidth = ctx.measureText(damageText).width;
        lines.push(currentLine);
        console.log(lines)

        for (let i = 0; i < lines.length; i++) {                                    // Iterates through each line generated
            const line = lines[i];                                                      // Sets line to the current line being iterated on
            const currentY = 252 + i * lineHeight;                      // Sets the line's Y value to the Y value of the description + the height of each line multiplied by the amount of previous lines
            ctx.fillText(line, 361 + damageWidth, currentY);      // Draws the line //  + leadingSpaces.length * 8
            damageWidth = 0;
        }

        lines = [];                             // Creates an array for each line of text that fits in the designated space
        words = properties.split(' ');             // Gets a list of words from each paragraph
        currentLine = words[0];                           // Creates currentLine to represent the current line of text being outputted, and sets it to nothing.

        for (let j = 1; j < words.length; j++) {                                // Iterates through all words in the current paragraph
            const testLine = currentLine + ' ' + words[j];     // Creates a testline for determing whether the current line + the next word would be too large to print.
            const testWidth = ctx.measureText(testLine).width;                      // Measures how large the testLine would be if printed onto the canvas
            if (testWidth > boxWidth - propertiesWidth) {                                     // If the size of the testLine is larger than the description should be:
                lines.push(currentLine);                                                // Output currentLine to the list of lines
                currentLine = words[j];                                                 // Start a new line by setting currentLine to the current word                                     
                propertiesWidth = 0;
            } else {                                                                // Else
                currentLine = testLine;                                                 // The size of the line is fine, and so the current line is set to the test line.      
            }
        }
        propertiesWidth = ctx.measureText(propertiesText).width;
        lines.push(currentLine);
        console.log(lines)

        for (let i = 0; i < lines.length; i++) {                                    // Iterates through each line generated
            const line = lines[i];                                                      // Sets line to the current line being iterated on
            const currentY = 352 + i * lineHeight;                      // Sets the line's Y value to the Y value of the description + the height of each line multiplied by the amount of previous lines
            ctx.fillText(line, 361 + propertiesWidth, currentY);      // Draws the line //  + leadingSpaces.length * 8
            propertiesWidth = 0;
        }

        ctx.fillText(document.getElementById("weapon-attunement-input").value, 361 + attunementWidth, 466)
        ctx.textAlign = "center";
        ctx.fillText(document.getElementById("weapon-gold-input").value, 197 + goldWidth, 466)

    }

    function update_customization_options() {
        const itemType = itemSelect.value;
    
        // Hide all additional customization options
        hide_all_customization_options();
    
        if (itemType === "armor") {
            let inputs = document.querySelectorAll(".armor-customization-input");
            for (let i = 0; i < inputs.length; i++) {
                inputs[i].style.display = "block";
            }
        } else if (itemType === "weapon") {
            let inputs = document.querySelectorAll(".weapon-customization-input");
            for (let i = 0; i < inputs.length; i++) {
                inputs[i].style.display = "block";
            }
        } else if (itemType === "item") {
            let inputs = document.querySelectorAll(".item-customization-input");
            for (let i = 0; i < inputs.length; i++) {
                inputs[i].style.display = "block";
            }
        }
    }
    
    function hide_all_customization_options() {
        let inputs = document.querySelectorAll(".armor-customization-input");
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].style.display = "none";
        }

        inputs = document.querySelectorAll(".weapon-customization-input");
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].style.display = "none";
        }

        inputs = document.querySelectorAll(".item-customization-input");
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].style.display = "none";
        }
    }

});