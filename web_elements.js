 


        
function addFilePanel() {
    if (panelCount >= maxPanels) {
        alert('Maximum number of panels reached.');
        return;
    }

    const filePanelsContainer = document.getElementById('file-panels');

    // Create a new div for the file panel
    const panel = document.createElement('div');
    panel.className = 'panel';

    // Add header to the panel
    const panelHeader = document.createElement('div');
    panelHeader.className = 'panel-header';
    panelHeader.textContent = `Experiment ${panelCount + 1}`;
    panel.appendChild(panelHeader);
    const plotoptions = document.createElement('div');
    minititle(plotoptions, "Plotting options")
    const input = document.createElement('input');
    const inputLabel = document.createElement('label');

    inputLabel.textContent="Decimation";
    input.id=`decimation-${panelCount + 1}`;
    input.type="text"
    input.style.width = '20px';
    input.style.marginBottom = '10px';
    input.style.marginRight= '5px';
    input.style.marginLeft= '5px';
    plotoptions.appendChild(inputLabel)
    plotoptions.appendChild(input)
    


    const linestyle = document.createElement('input');
    const linestylelabel= document.createElement('label');
    linestylelabel.textContent="Label";
    linestyle.id=`label-${panelCount + 1}`;
    linestyle.type="text"
    linestyle.style.width = '50px';
    linestyle.style.marginBottom = '10px';
    linestyle.style.marginRight= '5px';
    linestyle.style.marginLeft= '5px';
    plotoptions.appendChild(linestylelabel)
    plotoptions.appendChild(linestyle)
    
    const colorlabel = document.createElement('label');
    colorlabel.textContent = 'Colour:';
    colorlabel.htmlFor = `colorPicker-${panelCount + 1}`;

    // Create the color picker input
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.id = `colourPicker-${panelCount + 1}`;
    colorPicker.style.width = '40px';
    colorPicker.style.marginBottom = '10px';
    colorPicker.style.marginRight= '5px';
    colorPicker.style.marginLeft= '5px';
    const randomInt = Math.floor(Math.random() * 16777215);
    // Convert the integer to a hexadecimal string and pad it with leading zeros if necessary
    const hexCode = `#${randomInt.toString(16).padStart(6, '0')}`;
    colorPicker.value = hexCode; // Set default color value (optional)

    // Append the label and color picker to the wrapper div
    plotoptions.appendChild(colorlabel);
    plotoptions.appendChild(colorPicker);

    const filter = document.createElement('input');
    const filterlabel = document.createElement('label');

    filterlabel.textContent="Box size (%)";
    filter.id=`filter-${panelCount + 1}`;
    filter.type="text"
    filter.style.width = '25px';
    filter.style.marginBottom = '10px';
    filter.style.marginRight= '5px';
    filter.style.marginLeft= '5px';
    plotoptions.appendChild(filterlabel)
    plotoptions.appendChild(filter)

    panel.appendChild(plotoptions)
    

    
    // Add toggle for file inputs
    const plotoptions2= document.createElement('div');
    minititle(plotoptions2, "File Reading")
    const header = document.createElement('input');
    const headerlabel = document.createElement('label');
    headerlabel.textContent="Header length";
    header.className=`header-${panelCount + 1}`;
    header.type="text"
    header.style.width = '20px';
    header.style.marginBottom = '10px';
    header.style.marginRight= '5px';
    header.style.marginLeft= '5px';
    plotoptions2.appendChild(headerlabel)
    plotoptions2.appendChild(header)
    panel.appendChild(plotoptions2)
    const toggleFileInputs = document.createElement('div');
    const checkboxLabel = document.createElement('label');
    checkboxLabel.textContent = 'Seperate potential file';
    
    toggleFileInputs.className = 'toggle-file-inputs';
    
    const checkbox = document.createElement('input');
    
    checkbox.type = 'checkbox';
    checkbox.id = `toggleFileInputs-${panelCount + 1}`;
    checkbox.onchange = toggleFileInputsChange;
    
    checkboxLabel.htmlFor = checkbox.id;
    toggleFileInputs.appendChild(checkboxLabel);
    toggleFileInputs.appendChild(checkbox);
    
    panel.appendChild(toggleFileInputs);

    // Add file input(s)
    const fileInputContainer = document.createElement('div');
    fileInputContainer.className = 'file-container';
    addFileInput(fileInputContainer, checkbox.checked, panelCount+1);
    panel.appendChild(fileInputContainer)
    minititle(fileInputContainer, "Input parameters")
    // Add textboxes related to the selected global option
    const textboxesContainer = document.createElement('div');
    
    textboxesContainer.className = 'textboxes-container';
    
    panel.appendChild(textboxesContainer);
   
    // Add the panel to the file panels container
    filePanelsContainer.appendChild(panel);
    const ColumnAssignment = document.createElement('div');
    ColumnAssignment.className = `ColumnAssignment-${panelCount+1}`;
    panel.appendChild(ColumnAssignment);
    panelCount++;
    updateParameters();
}


function addFileInput(container, showTwoInputs, panelID) {
    container.innerHTML = ''; // Clear previous inputs
   
  
    if (showTwoInputs) {
        // Create file input group with labels
        const fileInputGroup1 = document.createElement('div');
        fileInputGroup1.className = 'file-input-group';
        
        const label1 = document.createElement('label');
        label1.textContent = 'Time-Current:';
        const input1 = document.createElement('input');
        input1.type = 'file';
        input1.onchange = MonashFile;

        fileInputGroup1.appendChild(label1);
        fileInputGroup1.appendChild(input1);
        container.appendChild(fileInputGroup1);

        const fileInputGroup2 = document.createElement('div');
        fileInputGroup2.className = 'file-input-group';
        
        const label2 = document.createElement('label');
        label2.textContent = 'Time-Potential:';
        const input2 = document.createElement('input');
        input2.type = 'file';
        
        input2.id=`Voltage-button-${panelID}`;
        input1.id=`Current-button-${panelID}`;
        input2.onchange = MonashFile;

        fileInputGroup2.appendChild(label2);
        fileInputGroup2.appendChild(input2);
        container.appendChild(fileInputGroup2);
    } else {
        // Create single file input with label
        const fileInputGroup = document.createElement('div');
        fileInputGroup.className = 'file-input-group';
        
        const label = document.createElement('label');
        label.textContent = ' Data file:';
        const input = document.createElement('input');
        input.type = 'file';
        input.id=panelID
        input.onchange = handleFileChange;

        fileInputGroup.appendChild(label);
        fileInputGroup.appendChild(input);
        container.appendChild(fileInputGroup);
    }
    
}

function toggleFileInputsChange(event) {
    
    const container = event.target.parentElement.nextElementSibling;
    addFileInput(container, event.target.checked,event.target.id.split("-")[1]);
}


function controlFromInput(fromSlider, fromInput, toInput, controlSlider) {
    const [from, to] = getParsed(fromInput, toInput);
    fillSlider(fromInput, toInput, '#C6C6C6', '#25daa5', controlSlider);
    if (from > to) {
        fromSlider.value = to;
        fromInput.value = to;
    } else {
        fromSlider.value = from;
    }
}
    
function controlToInput(toSlider, fromInput, toInput, controlSlider) {
    const [from, to] = getParsed(fromInput, toInput);
    fillSlider(fromInput, toInput, '#C6C6C6', '#25daa5', controlSlider);
    setToggleAccessible(toInput);
    if (from <= to) {
        toSlider.value = to;
        toInput.value = to;
    } else {
        toInput.value = from;
    }
}

function controlFromSlider(fromSlider, toSlider, fromInput) {
  const [from, to] = getParsed(fromSlider, toSlider);
  fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);
  if (from > to) {
    fromSlider.value = to-1;
    fromInput.value = to-1;
  } else {
    fromInput.value = from;
  }
}

function controlToSlider(fromSlider, toSlider, toInput) {
  const [from, to] = getParsed(fromSlider, toSlider);
  fillSlider(fromSlider, toSlider, '#C6C6C6', '#25daa5', toSlider);
  setToggleAccessible(toSlider);
  if (from < to) {
    toSlider.value = to;
    toInput.value = to;
  } else {
    toInput.value = from+1;
    toSlider.value = from+1;
  }
}

function getParsed(currentFrom, currentTo) {
  const from = parseInt(currentFrom.value, 10);
  const to = parseInt(currentTo.value, 10);
  return [from, to];
}

function fillSlider(from, to, sliderColor, rangeColor, controlSlider) {
    const rangeDistance = to.max-to.min;
    const fromPosition = from.value - to.min;
    const toPosition = to.value - to.min;
    
}
function minititle(div, text){
    const plotbreak2 = document.createElement('p');
    
    plotbreak2.textContent = "";
    div.appendChild(plotbreak2)
    const plottitle = document.createElement('b');
    
    plottitle.textContent = text;
    
    
    const plotbreak = document.createElement('p');
    
    plotbreak.textContent = "";
    div.appendChild(plottitle)
    div.appendChild(plotbreak)
}
function setToggleAccessible(currentTarget) {
  const toSlider = document.querySelector('#toSlider');
  if (Number(currentTarget.value) <= 0 ) {
    toSlider.style.zIndex = 2;
  } else {
    toSlider.style.zIndex = 0;
  }
}
function addColumnAssignmentDropdowns(PanelID, num_cols,event) {
  
    const getdiv=document.getElementsByClassName(`ColumnAssignment-${PanelID}`)[0];
    
    getdiv.innerHTML='';
    minititle(getdiv, "Column Assignment")
    const dropdowns=["Time", "Current", "Potential"];
    dropdowns.forEach(title =>{
        const label = document.createElement('label');
        label.textContent = `${title}:`;
        
        const columns = Array.from({length: num_cols}, (v, i) => `Column ${i + 1}`);
        const select = document.createElement('select');
        select.id=`column-${title}-${PanelID}`
        select.style.marginBottom = '10px';
        select.style.marginRight= '5px';
        select.style.marginLeft= '5px';
        // Loop through the options array and create option elements
        var new_entry={};
        new_entry["experiment"]=PanelID;
        columns.forEach(option => {
            const optionElement = document.createElement('option');
            
            optionElement.value = option;
            optionElement.text = option;
            
            select.appendChild(optionElement);
        });
        getdiv.appendChild(label)
        getdiv.appendChild(select);
        
    });
    
    const panel = event.target.closest('.panel');
    panel.appendChild(getdiv);
    return Array.from({length: num_cols}, (v, i) => `Column ${i + 1}`);
}
