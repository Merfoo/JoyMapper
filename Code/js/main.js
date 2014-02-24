var $buttons;
var sticks;

// When document is loaded call init function
$(document).ready(init);

// Called when the app is first loaded
function init()
{   
    console.log("INIT");
    
    if(!window.chrome)
        alert("Sorry but this has been developed only for chrome.");
    
    // Check for the various File API support.
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob)
      alert('The File APIs are not fully supported in this browser.');
  
    initDomRelated();
    initJoysticks();
    reset();
}

// Initializes everything related to dom elements
function initDomRelated()
{
    $buttons = $("input[type=text]");
    
    for(var i = 0; i < $buttons.length; i++)
    {
        for(var j = 0; j < $buttons.length - 1; j++)
        {
            if(convertToNumber($buttons[j].id.substring("button".length)) > convertToNumber($buttons[j + 1].id.substring("button".length)))
            {
                var tmp = $buttons[j];
                $buttons[j] = $buttons[j + 1];
                $buttons[j + 1] = tmp;
            }
        }
    }
}

// Inits the joysticks
function initJoysticks()
{
    sticks = navigator.webkitGetGamepads();
    console.log(sticks);
}

// Resets everything
function reset()
{
    
}

// Gets all the data, processes it, and saves it
function processInputData()
{
    var fileData = "";
    writeToFile(fileData, "gamepadMap.csv");
}

// Writes the data to the users computer with the specified name
function writeToFile(data, fileName)
{
    var blob = new Blob([data], {type: "text/plain;charset=utf-8"});
    saveAs(blob, fileName);
}

// Reads all files
function getLoadedFiles(evt)
{
    console.log("OPEN SAVE BUTTON CLICKED");
    
    var files = evt.target.files;
    var data = "";
    var filesLoaded = 0;
    
    for (var i = 0, f; (f = files[i]); i++)
    {   
        var reader = new FileReader();

        reader.onload = function()
        {
            data += this.result;
            
            if(++filesLoaded === files.length)
                processLoadedData(split(data, ","));
        };

        reader.readAsText(f);
    }
}

// Process and write to master file
function processLoadedData(data)
{
    console.log("DATA LOADED FROM SAVED FILE: " + data.length);
    console.log(data);
    
}

// Removes commas from strings
function removeCommas(data)
{
    var ret = "";
    
    for(var i = 0; i < data.length; i++)
        if(data[i] !== ',')
            ret += data[i];
    
    return ret;
}

// Splits the string
function split(str, delim)
{
    var index = 0; 
    var delimIndex = 0;
    var delimLen = delim.length;
    var ret = [];
    
    while((delimIndex = str.indexOf(delim, index)) !== -1)
    {
        ret.push(str.substring(index, delimIndex));
        index = delimIndex + delimLen;
    }
    
    if(index !== str.length)
        ret.push(str.substring(index, str.length));
    
    return ret;
}

// Converts the string to a number, retursn 0 if can't find number
function convertToNumber(str)
{
    var ret = parseInt(str);
    
    if(!ret)
    {
        console.log("ERROR, CAN'T CONVERT '" + str + "' TO A NUMBER.");
        ret = 0;
    }
    
    return ret;
}

// Converts rgb to hex
function rgbToHex(r, g, b)
{
    var red = r.toString(16);
    var green = g.toString(16);
    var blue = b.toString(16);
    
    if(red.length < 2)
        red = "0" + red;
    
    if(green.length < 2)
        green = "0" + green;
    
    if(blue.length < 2)
        blue = "0" + blue;

    return "#" + red + green + blue;
}

// Removes new line character
function removeNewLine(data)
{
    var ret = "";
    
    for(var i = 0; i < data.length; i++)
        if(data[i] !== "\n")
            ret += data[i];
    
    return ret;
}