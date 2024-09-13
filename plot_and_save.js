async function plot(event){
    console.time("plotting")
    datastore=[];
    plotstore=[];
    await init('./biquad_wasm_bg.wasm');

    const values = {};
    // Create the first two side-by-side plots (first row)
    
    
    // Get values from dropdowns
    values.experiment = document.getElementById('experiment').value;
    values.xaxis = document.getElementById('xaxis').value;
    values.powerspectrum = document.getElementById('powerspectrum').value;
    values.currentscaling = document.getElementById('currentscaling').value;
    values.potentialscaling = document.getElementById('potentialscaling').value;
    const scaledict={"None":1, "milli":1e3, "micro":1e6, "nano":1e9};
    const scaleunitdict={"None":"", "milli":"m", "micro":"μ", "nano":"n"}
    values.harmonictype = document.getElementById('harmonictype').value;

    // Get value from checkbox
    values.hanning = document.getElementById('hanning').checked; // returns true or false

    // Get values from sliders and number inputs
    values.lowestharm = parseInt(document.getElementById('fromSlider').value);
    values.highestharm = parseInt(document.getElementById('toSlider').value)+1;
    const num_harmonics=values.highestharm-values.lowestharm;
    const num_experiments=Number(panelCount);
    const container = document.getElementById('graphs-container');
    container.innerHTML = '';
    for (let i=0;i<2; i++){
        const graphDiv = document.createElement('div');
        graphDiv.id = `graph${i}`;
        graphDiv.className = 'graph-container half-width';
        container.appendChild(graphDiv);
    }
    for (let i=2;i<(2+(values.highestharm-values.lowestharm)+1); i++){
        const graphDiv = document.createElement('div');
        graphDiv.id = `graph${i}`;
        graphDiv.className = 'graph-container full-width';
        container.appendChild(graphDiv);
    }
    const lastgraph=2+(values.highestharm-values.lowestharm);

    if (num_experiments==0){
        return;
    }
    const plot_object={}
    const dropdowns=["Time", "Current", "Potential"];
    var key;
    var getid;
    
    var data_array=[];
    var harmonic_array=[];
    var FT_array=[];
    for (let i = 0; i < num_experiments; i++) {
        var fileIndex = filesStorage.findIndex(file => file["experiment"] === i+1);
        if (fileIndex==-1){
            continue;
        }
        key=i+1;
        plot_object[key]={};
       
        var xy;
        if (filesStorage[fileIndex].hasOwnProperty("Column 1" )) {
            var existingid=[];
            for (let j=0; j<3; j++){
                getid=document.getElementById(`column-${dropdowns[j]}-${i+1}`).value;
                if (existingid.includes(getid)){
                    alert(`${getid} assigned to two variables`)
                    return;
                }
                existingid.push(getid)
                plot_object[key][dropdowns[j].toLowerCase()]=filesStorage[fileIndex][getid]
            }
            
        }else{
            for (let j=0; j<3; j++){
                if (filesStorage[fileIndex].hasOwnProperty(dropdowns[j].toLowerCase())){
                    plot_object[key][dropdowns[j].toLowerCase()]=filesStorage[fileIndex][dropdowns[j].toLowerCase()]
                }else if ((filesStorage[fileIndex].hasOwnProperty("voltage")) && (dropdowns[j]==="Potential")){
                    plot_object[key]["potential"]=filesStorage[fileIndex]["voltage"]
                }
                else{
                    alert(`Missing ${dropdowns[j]} data`)
                    return;
                }

            }
        }
        
        var dec=document.getElementById(`decimation-${i+1}`).value;
        if ( dec=== "" || isNaN(parseInt(dec))){
            document.getElementById(`decimation-${i+1}`).value=15;
            plot_object[key]["decimation"]=15;
        }else{
            plot_object[key]["decimation"]=Math.abs(parseInt(dec));
            document.getElementById(`decimation-${i+1}`).value= plot_object[key]["decimation"];
        }
        var label=document.getElementById(`label-${i+1}`).value;
        if (label===""){
            document.getElementById(`label-${i+1}`).value=`Exp ${i+1}`;
            plot_object[key]["label"]=`Exp ${i+1}`
        }else{
            plot_object[key]["label"]=label
        }
        plot_object[key]["colour"]=document.getElementById(`colourPicker-${i + 1}`).value;
        var filter=document.getElementById(`filter-${i+1}`).value;
        if ( filter=== "" || isNaN(parseInt(filter))){
            document.getElementById(`filter-${i+1}`).value=100;
            plot_object[key]["filter"]=100;
        }else{
            plot_object[key]["filter"]=Math.min(100,Math.abs(parseInt(filter)));
            document.getElementById(`filter-${i+1}`).value=plot_object[key]["filter"]
        }
        var user_freq=document.getElementById(`panel-${key}-textbox-freq`).value;
        var write_frequency =false;
        if (isNaN(parseFloat(user_freq))){
            user_freq=0;
            write_frequency=true;
        }
        else{
            user_freq=parseFloat(user_freq);
        }
        var curr_array=plot_object[key]["current"].map(element => element * scaledict[values.currentscaling])
        var pot_array=plot_object[key]["potential"].map(element => element * scaledict[values.potentialscaling])
        var dcvalues={};
        const sample_rate=1/(plot_object[key]["time"][1]-plot_object[key]["time"][0]);
        var x;
        for (let i=0; i<curr_array.length; i++){
            x=parseFloat(curr_array[i])
            if (isNaN(x)){
                curr_array.splice(i, 1);
                pot_array.splice(i, 1);
                plot_object[key]["time"].splice(i, 1);
            }
        }
        const rust_objects=wasm.harmonics(plot_object[key]["time"],
                                            curr_array,
                                            user_freq,
                                            values.harmonictype==="envelope",
                                            values.hanning,
                                            Array.from({ length: num_harmonics}, (_, index) => values.lowestharm + index),
                                            plot_object[key]["filter"],
                                            plot_object[key]["decimation"],
                                            sample_rate,
                                            );
        

        if (write_frequency===true){
            document.getElementById(`panel-${key}-textbox-freq`).value=Math.round(rust_objects.dominantFrequency * 100) / 100;            
        }
        const xyz=wasm.decimate_data(plot_object[key]["time"], 
                        curr_array, 
                        pot_array,
                        plot_object[key]["decimation"],
                        sample_rate, 
                        rust_objects.dominantFrequency*(values.highestharm+2));
        var data_object={"Time":xyz[0], "current":xyz[1], "Potential":xyz[2]}
        
        data_array.push(data_object)
        const freq=rust_objects.dominantFrequency
        const amp=1e3*wasm.get_amplitude(plot_object[key]["potential"], plot_object[key]["time"][1]-plot_object[key]["time"][0], freq)
        
        var voltage_params={};
        voltage_params["estart"]=calculateMean(plot_object[key]["potential"].slice(0, findClosestIndex(plot_object[key]["time"], 2/freq )))
        const midpoint=plot_object[key]["time"][parseInt(plot_object[key]["time"].length/2)]

        voltage_params["ereverse"]=calculateMean(plot_object[key]["potential"].slice(findClosestIndex(plot_object[key]["time"], midpoint-(1/freq) ), findClosestIndex(plot_object[key]["time"], midpoint+(1/freq) )))
        voltage_params["v"]=voltage_params["ereverse"]-voltage_params["estart"]/midpoint
        if (document.getElementById("xaxis").value==="DC_Potential"){
            const necessary_keys=["estart", "ereverse", "v"]
            
            for (let i=0; i<necessary_keys.length; i++){
                dcvalues[necessary_keys[i]]=parseFloat(document.getElementById(`panel-${key}-textbox-${necessary_keys[i]}`).value)
                if (isNaN(dcvalues[necessary_keys[i]])){
                    document.getElementById(`panel-${key}-textbox-${necessary_keys[i]}`).value=voltage_params[necessary_keys[i]];
                    dcvalues[necessary_keys[i]]=voltage_params[necessary_keys[i]];
                    
                }
            }
            const dcaxes=wasm.dc_potential(xyz[0], dcvalues["estart"], dcvalues["ereverse"], dcvalues["v"]).map(x => x*scaledict[values.potentialscaling]);
            data_object["DC_Potential"]=dcaxes;

        }
        document.getElementById(`panel-${key}-textbox-amp`).value=Math.round((amp) * 10) / 10;   
        
        rust_objects.harmonics[0]=[...data_object[document.getElementById("xaxis").value]];
        harmonic_array.push(rust_objects.harmonics);
        FT_array.push({"freqs":rust_objects.fftFreqs, "mags":rust_objects.fftMagnitudes})
        var savelement={title:plot_object[key]["label"], data:{}};
        if (document.getElementById("csvcheckbox").checked===true){
            
            savelement["data"]["Time (s)"]=data_object.Time
            savelement["data"][`Current (${scaleunitdict[values.currentscaling]}A)`]=data_object.current
            
            savelement["data"][`Potential (${scaleunitdict[values.potentialscaling]}V)`]=data_object.Potential
            if (data_object.hasOwnProperty("DC_Potential")){
                savelement["data"][`DC Potential (${scaleunitdict[values.potentialscaling]}V)`]=data_object.DC_Potential
            }
            for (let i=0; i<num_harmonics; i++){
                savelement["data"][`Harmonic ${values.lowestharm+i} (${scaleunitdict[values.currentscaling]}A)`]=rust_objects.harmonics[i+1];
            }
            datastore.push(savelement)
        }
        
  
    }
    
    var harmonic_plot;
    const xaxis_dict={"Time":"Time (s)", "Potential":`Potential (${scaleunitdict[values.potentialscaling]}V)`, "DC_Potential":`DC potential (${scaleunitdict[values.potentialscaling]}V)`}
    if (document.getElementById("xaxis").value==="DC_Potential"){
        var harm_plot_opts={
            drawPoints: false,
            legend:"always",
            showRoller: false,
            xlabel: xaxis_dict[document.getElementById("xaxis").value],
            ylabel: `Current (${scaleunitdict[values.currentscaling]}A)`,
            connectSeparatedPoints:false,
            drawPoints:true,
            strokeWidth:0.0}
        }else{
            var harm_plot_opts={
            drawPoints: false,
            legend:"always",
            showRoller: false,
            xlabel: xaxis_dict[document.getElementById("xaxis").value],
            ylabel: `Current (${scaleunitdict[values.currentscaling]}A)`,
            connectSeparatedPoints:true,
            strokeWidth:2}
        }
    var pot_plot_opts={title: `Time-Potential`,
            drawPoints: false,
            showRoller: false,
            xlabel: 'Time (s)',
            ylabel: `Potential (${scaleunitdict[values.potentialscaling]}V)`,
            connectSeparatedPoints:true}
    var cur_plot_opts={
            title: `${values["xaxis"]}-Current`,
            drawPoints: false,
            legend:"always",
            showRoller: false,
            xlabel: xaxis_dict[document.getElementById("xaxis").value],
            ylabel: `Current (${scaleunitdict[values.currentscaling]}A)`,
            connectSeparatedPoints:true,
        };
    var FT_plot_opts={title: `Magnitude spectrum`,
        drawPoints: false,
        showRoller: false,
        xlabel: 'Frequencies (Hz)',
        ylabel: `Magnitude`,
        connectSeparatedPoints:true}
    if (document.getElementById("powerspectrum").value==="logarithmic"){
        FT_plot_opts["logscale"]=true;
    }
    var pot_plot_key;
    if (document.getElementById("ShowDC")!= null && document.getElementById("ShowDC").checked===true){
        pot_plot_key="DC_Potential";
        pot_plot_opts["strokeWidth"]=2;
    }
    else{
        pot_plot_key="Potential";
    }
    
    const potential_plot = mergeSeriesForDygraphs(
                                        data_array.map(dec_exp => {
                                                return columnStackObject(dec_exp, ["Time",pot_plot_key]);
                                            })
                                        );
    
    const current_plot=mergeSeriesForDygraphs(
                                        data_array.map(dec_exp => {
                                                return columnStackObject(dec_exp, [document.getElementById("xaxis").value, "current"]);
                                            })
                                        );
    
    const FT_plot=mergeSeriesForDygraphs(
                                        FT_array.map(dec_exp => {
                                                return columnStackObject(dec_exp, ["freqs", "mags"]);
                                            })
                                        );
   
    const colours=[];
    const labels=[];
    for (var key in plot_object){
        
        if(plot_object.hasOwnProperty(key)){
            colours.push(plot_object[key]["colour"])
            labels.push(plot_object[key]["label"])
        }
    }

   
    if (data_array.length==1){
        pot_plot_opts["color"]=colours[0]
        cur_plot_opts["color"]=colours[0]
        pot_plot_opts["labels"]=["Time"].concat(labels);
        cur_plot_opts["labels"]=["Time"].concat(labels);
        FT_plot_opts["color"]=colours[0]
        FT_plot_opts["labels"]=["Frequency"].concat(labels);
    }else{
        cur_plot_opts["colors"]=colours;
        pot_plot_opts["colors"]=colours;
        
        pot_plot_opts["labels"]=["Time"].concat(labels);
        cur_plot_opts["labels"]=["Time"].concat(labels);
        FT_plot_opts["colors"]=colours;
        FT_plot_opts["labels"]=["Frequency"].concat(labels);
    }
    const pp=new Dygraph(document.getElementById("graph0"), 
    potential_plot,pot_plot_opts
    );
    const cp=new Dygraph(document.getElementById("graph1"), 
    current_plot, cur_plot_opts
    );
    const fp=new Dygraph(document.getElementById(`graph${num_harmonics+2}`), 
    FT_plot, FT_plot_opts,
    );
    plotstore.push(fp)
    plotstore.push(pp)
    plotstore.push(cp)
    
    for (let i=1; i<num_harmonics+1; i++){
        
        harmonic_plot=mergeSeriesForDygraphs(
                                        harmonic_array.map(harmonic_exp => {
                                                return columnStack(harmonic_exp, [0, i]);
                                            })
                                        );
        
        harm_plot_opts["title"]=`Harmonic ${values.lowestharm+(i-1)}`;
        if (data_array.length==1){
            harm_plot_opts["color"]=colours[0]
            harm_plot_opts["labels"]=["Time"].concat(labels);
            
        }else{
            harm_plot_opts["colors"]=colours;
            harm_plot_opts["labels"]=["Time"].concat(labels);
        }
        const hp=new Dygraph(document.getElementById(`graph${i+1}`), 
            harmonic_plot,harm_plot_opts
            );
        plotstore.push(hp)
    }
    
    return values;
}
async function saveallplot(event){
    const savebtn= document.getElementById('plotsave');
    savebtn.disabled = true;
    const zip = new JSZip();
    if (plotstore.length===0){
        return;
    }
    const promises = plotstore.map((graph, index) => 
                html2canvas(document.getElementById(`graph${index}`),
                {
                    logging: false,
                    height: 400
                }
            
                ).then(canvas => {
                    return new Promise(resolve => {
                        canvas.toBlob(blob => {
                            const title = graph.getOption('title');
                            const filename = sanitizeFilename(title) + '.png';
                            zip.file(filename, blob);
                            resolve();
                        });
                    });
                })
            );

    await Promise.all(promises);

    zip.generateAsync({type:"blob"}).then(function(content) {
        const link = document.createElement('a');
        link.download = 'graphs.zip';
        link.href = URL.createObjectURL(content);
        link.click();
        savebtn.disabled = false;

    });
}
async function savecsv(event) {
    const savebtn=document.getElementById("csvsave");
    savebtn.disabled=true;
    if (datastore.length===0){
        return;
    }
    const zip = new JSZip();

    datastore.forEach((obj, index) => {
    const csvContent = objectToCSV(obj["data"]);
    zip.file(`${obj["title"]}.csv`, csvContent);
    });

    const content = await zip.generateAsync({ type: "blob" });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'data.zip';
    link.click();
    URL.revokeObjectURL(link.href);
    savebtn.disabled=false;
}