function MonashFile(event){
    const file = event.target.files[0];
    if (file) {
    }
    components=event.target.id.split("-")
    const panelid=Number(components[2])
    const fileName = file.name;
    const lastIndex = fileName.lastIndexOf('_');
    const fileExtension =fileName.substring(lastIndex + 1);
    const validextension=components[0].toLowerCase();
    if (fileExtension !== validextension){
        alert(`Error: only files of type _cv_${validextension} are supported.`);
        event.target.value = '';
        return;
    }
    const reader = new FileReader();
        reader.readAsText(file);  
        reader.onload = function(e) {
            const fileContent = e.target.result;
            const dataline = fileContent.split(/\r\n|\n/);
            const dataArray = dataline.map(dataline => {
                return dataline.split(/[\s,]+/).map(Number).filter(val => !isNaN(val));
              });
                    var time = dataArray.map(function(value,index) { return value[0]; });
                    
                    if  (filesStorage.some(file => file["experiment"] === panelid)){
                        
                        fileIndex = filesStorage.findIndex(file => file["experiment"] === panelid);
                        if (filesStorage[fileIndex]["time"].length != time.length){
                            alert("Length of _cv_current and _cv_voltage are different!");
                            event.target.value = '';
                            return;
                        }else{
                            filesStorage[fileIndex][validextension]=dataArray.map(function(value,index) { return value[1]; });
                        }
                        //filesStorage[fileIndex].validextension
                    } else{
                        const new_entry={};
                        new_entry["experiment"]=panelid;
                        new_entry["time"]=time;
                        new_entry[validextension]=dataArray.map(function(value,index) { return value[1]; });
                        filesStorage.push(new_entry);
                    }
            }   
        }
        
function handleFileChange(event) {
    const file = event.target.files[0];
    console.log("help")
    if (file) {
        const fileName = file.name;
        const lastIndex = fileName.lastIndexOf('.');
        const fileExtension =fileName.substring(lastIndex + 1);
        const PanelID= Number(event.target.id);
        HeaderLen= document.getElementsByClassName(`header-${PanelID}`)[0].value;
        
        if (HeaderLen === "" || isNaN(parseInt(HeaderLen))) {
            HeaderLen=0;
        }else{
            HeaderLen=parseInt(HeaderLen)
        }
        document.getElementsByClassName(`header-${PanelID}`)[0].value=HeaderLen
        
        // 1. Check file type
        if (fileExtension !== 'txt' && fileExtension !== 'csv') {
            alert('Error: Only .txt and .csv files are supported.');
            event.target.value = ''; // Clear the file input
            return;
        }
        
        // 2. Read and check if the file is in column format
        const reader = new FileReader();
        reader.readAsText(file);  
        reader.onload = function(e) {
            const fileContent = e.target.result;
        
            // Assume that the first row contains headers if it's a CSV
            const lines = fileContent.split(/\r\n|\n/);
            
            const num_lines=lines.length;
            dataline=lines.slice(HeaderLen, num_lines-1)
            const toprow=dataline[0].split(/[\s,]+/).map(Number);
            var noheaders = true;
            toprow.forEach((value, colIndex) => {
            if (isNaN(value) && noheaders === true) {
                alert(`Error: Not a number (${dataline[0].trim().split(/[\s,]+/)[colIndex]}) found at column ${colIndex + 1}`);
                event.target.value = '';
                noheaders = false;
                return;
            }
            });

            const dataArray = dataline.map(line => {
            return line.trim().split(/[\s,]+/).filter(Boolean).map(Number);
            });

            const firstLength = dataArray[0].length;
            var data_valid = true;
            for (let i = 1; i < dataArray.length; i++) {
            if (dataArray[i].length !== firstLength && data_valid === true) {
                console.log(dataArray[i], dataline[i].trim().split(/[\s,]+/), dataline[i]);
                alert(`Error: Row ${i + 1} does not match the expected length of ${firstLength}, and is instead ${dataArray[i].length}.\n\nRow contents: ${dataline[i].trim()}`);
                event.target.value = '';
                data_valid = false;
                return;
                }
            }


            cols=addColumnAssignmentDropdowns(PanelID, firstLength,event);
            var new_entry={};
            new_entry["experiment"]=PanelID;
            document.getElementById(`panel-${PanelID}-textbox-freq`).value=null;
            console.log(filesStorage)
            for (i=0; i<filesStorage.length; i++){
                if (filesStorage[i]["experiment"]===PanelID){
                    for (let j = 0; j < firstLength; j++) {
                        
                        filesStorage[i][cols[j]]= dataArray.map(function(value,index) { return value[j]; });
                }
                return;
            }
        }

        for (let i = 0; i < firstLength; i++) {
            new_entry[cols[i]]= dataArray.map(function(value,index) { return value[i]; });
        } 
        filesStorage.push(new_entry);

        };
        
    }
}
