var $buttons;
var maxSticks = 6;
var pressedThreshold = 0.25;
var stickId = 1;
var buttonId = 1;
var pressedKey;
var rawSticks;
var sticks;
var assignMode = false;
var keyMode = false;
var keyGotPressed = false;
var keyCodes = { enter: 13 };

// When document is loaded call init function
$(document).ready(init);

// Called when the app is first loaded
function init()
{   
    print("INIT");
    
    if(!window.chrome)
        alert("Sorry but this has been developed only for chrome.");
    
    // Check for the various File API support.
    if (!window.File || !window.FileReader || !window.FileList || !window.Blob)
      alert('The File APIs are not fully supported in this browser.');
  
    initDomRelated();
    initJoysticks();
    reset();
    main();
}

// Initializes everything related to dom elements
function initDomRelated()
{
    $("[class*='gamepadButton']").click(function(e){ gamepadButtonClicked(e.target.id); });
    $("#assign").click(assignClicked);
    $("#saveSettings").click(generateAHKScript);
    $("#openSave").click(function(){$("#openSavedFile").click();});
    $("#openSavedFile").change(getLoadedFiles);
    $(document).keyup(keyupEventHandler);
    
    $buttons = $("input[type=text]");
    
    for(var i = 0; i < $buttons.length; i++)
    {
        for(var j = 0; j < $buttons.length - 1; j++)
        {
            if(parseInt($buttons[j].id.substring("button".length)) > parseInt($buttons[j + 1].id.substring("button".length)))
            {
                var tmp = $buttons[j];
                $buttons[j] = $buttons[j + 1];
                $buttons[j + 1] = tmp;
            }
        }
    }
    
    for(var i = 0; i < $buttons.length; i++)
        $buttons[i].value = "";
}

// Inits the joysticks
function initJoysticks()
{
    rawSticks = navigator.webkitGetGamepads();
    sticks = new Array(maxSticks);
    
    for(var i = 0; i < sticks.length; i++)
        sticks[i] = new Joystick();
    
    print(sticks);
}

// Main loops for the program
function main()
{
    updateJoysticks();
    
    if(assignMode)
    {
        for(var buttonIndex = 0; buttonIndex < $buttons.length; buttonIndex++)
        {
            if(sticks[stickId - 1].getButton(buttonIndex))
            {
                print("Button: " + (buttonIndex + 1));
                //$buttons[buttonIndex].css({"opacity" : "0.5"});
                buttonId = buttonIndex + 1;
                assignMode = false;
                keyMode = true;
                break;
            }
        }
    }
    
    if(keyMode && keyGotPressed)
    {
        sticks[stickId - 1].setKey(buttonId - 1, $buttons[buttonId - 1].value = pressedKey);
        //$buttons[buttonIndex].css({"opacity" : "1"});
        assignUnclicked();
    }
    
    window.webkitRequestAnimationFrame(main);
}

// Updates joystick
function updateJoysticks()
{
    rawSticks = navigator.webkitGetGamepads();
    
    for(var stickIndex = 0; stickIndex < rawSticks.length; stickIndex++)
    {
        var tmpStick = rawSticks[stickIndex];
        
        if(tmpStick)
        {
            // All non-joystick stick buttons
            for(var buttonIndex = 0; buttonIndex < tmpStick.buttons.length && buttonIndex < $buttons.length; buttonIndex++)
                sticks[stickIndex].setButton(buttonIndex, tmpStick.buttons[buttonIndex] > pressedThreshold);
            
            /* Subtracting 1 from each button value because array index are 0-based */
            // Left stick
//            sticks[stickIndex].setButton(17 - 1, tmpStick.axes[0] > pressedThreshold);   // Button 17
//            sticks[stickIndex].setButton(19 - 1, tmpStick.axes[0] < -pressedThreshold);  // Button 19
//            sticks[stickIndex].setButton(18 - 1, tmpStick.axes[1] > pressedThreshold);   // Button 18
//            sticks[stickIndex].setButton(20 - 1, tmpStick.axes[1] < -pressedThreshold);  // Button 20
//            
//            // Right stick
//            sticks[stickIndex].setButton(21 - 1, tmpStick.axes[2] > pressedThreshold);   // Button 21
//            sticks[stickIndex].setButton(23 - 1, tmpStick.axes[2] < -pressedThreshold);  // Button 23
//            sticks[stickIndex].setButton(22 - 1, tmpStick.axes[3] > pressedThreshold);   // Button 22
//            sticks[stickIndex].setButton(24 - 1, tmpStick.axes[3] < -pressedThreshold);  // Button 24
        }
    }
}

// Resets everything
function reset()
{
    gamepadButtonClicked("gamepadButton1");
}

// Handles keyup event
function keyupEventHandler(e)
{
    print(String.fromCharCode(e.keyCode).toLowerCase());
    
    if(keyMode)
    {
        pressedKey = String.fromCharCode(e.keyCode).toLowerCase();
        keyGotPressed = true;
    }
    
    if(e.keyCode === keyCodes.enter)
    {
        if(!assignMode)
            assignClicked();
        
        else
            assignUnclicked();
    }
}

// Callback function when the "assign" div has been pressed
function assignClicked()
{
    assignMode = true;
    $("#assign").css({"opacity" : "0.5"});
}

// Sets the "assign" div back to normal
function assignUnclicked()
{
    assignMode = false;
    keyMode = false;
    keyGotPressed = false;
    $("#assign").css({"opacity" : "1"});
}

// Callback function when "gamepadButtonX" div has been pressed
function gamepadButtonClicked(id)
{
    print(id);
    $("[class*='gamepadButton']").css({"opacity" : "1"}); 
    $("#" + id).css({"opacity" : "0.5"});
    stickId = id[id.length - 1] - 0; // "- 0" makes it a number
    
    updateDOMButtons();
}

// Updates the buttons in the application visually
function updateDOMButtons()
{
    for(var buttonIndex = 0; buttonIndex < $buttons.length; buttonIndex++)
        $buttons[buttonIndex].value = sticks[stickId - 1].getKey(buttonIndex);
}

// Gets all the data, processes it, and saves it
function generateAHKScript()
{
    print("generateAHKScript() called");
    var fileData = "";
    
    for(var stickIndex = 0; stickIndex < maxSticks; stickIndex++)
        for(var buttonIndex = 0; buttonIndex < $buttons.length; buttonIndex++)
            if((sticks[stickIndex].getKey(buttonIndex) + "").length > 0)
                fileData += (stickIndex + 1) + "Joy" + (buttonIndex + 1) + "::Send " + sticks[stickIndex].getKey(buttonIndex) + "\n";
    
    writeToFile(fileData, "scoutingJoystick.ahk");
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
    print("OPEN SAVE BUTTON CLICKED");
    
    var files = evt.target.files;
    var reader = new FileReader();

    reader.onload = function()
    {
        processLoadedData(this.result);
    };

    reader.readAsText(files[0]);
}

// Process and write to master file
function processLoadedData(data)
{
    print("DATA LOADED FROM SAVED FILE: " + data.length);
    print(split(data, "\n"));
    var splitData = split(data, "\n");
    
    for(var splitIndex = 0; splitIndex < splitData.length; splitIndex++)
    {
        // Ex data = '1Joy1::Send a', When joystick 1 button 1 is pressed, send letter 'a'
        var curData = splitData[splitIndex];
        var joyIndex = parseInt(curData[0]) - 1; // Joystick index
        var buttonIndex = parseInt(curData.substring(curData.indexOf("y") + 1, curData.indexOf(":"))) - 1; // Button index
        var letter = curData[curData.length - 1]; // Get the letter
        sticks[joyIndex].setKey(buttonIndex, letter);
    }
    
    updateDOMButtons();
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

// Python version of printing, too lazy to type "console.log" over and over again
function print(str)
{
    console.log(str);
}

// CLASSES
var stupid = 0;
function Joystick()
{
    stupid++;
    this.buttons = [$buttons.length];
    this.keys = [$buttons.length];
    
    for(var i = 0; i < $buttons.length; i++)
    {
        this.buttons[i] = false;
        this.keys[i] = "";
    }
}

Joystick.prototype.setButton = function(index, value)
{
    this.buttons[index] = value;
};

Joystick.prototype.getButton = function(index)
{
    return this.buttons[index];
};

Joystick.prototype.setKey = function(index, value)
{
    this.keys[index] = value;
};

Joystick.prototype.getKey = function(index)
{
    return this.keys[index];
};