﻿// Open a dialog and ask for a file.var newFile = File.openDialog("Please choose the file with the relevant texts",    "txt");// If we have a file,if (newFile !== null) {    app.beginUndoGroup("Import Text");    createCompsFromTextFile();    app.endUndoGroup();}/**  Create all compositions from a given text file based on templates.  @IMPORTANT: You MUST have a default template composition for the different  "types" of compositions => "Scripture", "Lower Third", etc.*/function createCompsFromTextFile() {    var content = readDocument(newFile, 0).contentAry,        contentLength = content.length,        currentLine,        parsedContentLine;    // retrieve the current selected comp from the project    // this will be the comp where we add the duplicated comps    var targetComp = app.project.activeItem;    // retrieve the name of the comp and create the name for the footage folder    var parentFolderName = targetComp.name + " Footage [Script Results]";    // create a parent folder for the new comps    var parentFolder = app.project.items.addFolder(parentFolderName);    // define the required fields in the CSV file for the script to work properly    var requiredFields = ['startTime', 'endTime', 'composition'];    // now parse the first line with the title names to retrieve position in text file    var columnPositions = parseFirstLine(content[0], requiredFields);    for (var i = 1; i < contentLength; i++) {        currentLine = content[i];        parsedContentLine = parse(currentLine, columnPositions);        var newComp = createGermanComp(parsedContentLine.comp, i, parentFolder);        placeCompInTimeline(newComp, targetComp, parsedContentLine.startTime, parsedContentLine.endTime);        updateTextLayers(newComp, parsedContentLine.layers);    }}/**  Duplicate an existing "template" composition and return the  new one. It searches by name, as opposed to index to make things easier.  @param originalCompName {String} - the name of the comp to duplicate.  @param lineNumber {int} - the line number of the file is used to update the new comp name  @param parentFolder {Object} - the folder where the new comp should be created*/function createGermanComp(originalCompName, lineNumber, parentFolder) {    if (originalCompName === 'Composition') {        return;    }    var index = findItemIndexByName(originalCompName);    var newComp = app.project.items[index].duplicate();    var newCompName = lineNumber + ' ' + originalCompName;    newComp.name = newCompName;    newComp.parentFolder = parentFolder;    return newComp;}/**  Find an "item" (comp) by name.  @param searchName {String} - a search query.*/function findItemIndexByName(searchName) {    var projLength = app.project.items.length,        index = null;    for (var i = 1; i <= projLength; i++) {        var nameProperty = app.project.item(i).name;        if (nameProperty == searchName) {            index = i;            break;        }    }    return index;}/**  Read a chosen text document, with line skipping option.  @param file {Object} - the file chosen by the user.  @param lineToSkip {Number} - how many lines to skip?*/function readDocument(file, lineToSkip) {    var doc = new File(file);    if (doc.exists) {        var contentAry = new Array();        file.open('r');        while (!file.eof) {            contentAry[contentAry.length] = file.readln();        }        file.close();    }    contentAry.splice(0, lineToSkip);    var contentList = contentAry.join('_dpt_')        .toString()        .replace(new RegExp('_dpt_', 'g'), "\r");    contentAry = contentAry;    return {        'contentAry': contentAry,        'contentList': contentList    }}/**  Parse the first line of a tab separated text file to retrieve  column positions for further use. The result will be an object where for each  required field it has an "Index" attribute where the values is the column  number of this certain field.  If this function finds more columns than just the required fields it puts all  these columns in the attribute "layer". It's an array of object with its  "layerName"s and its "layerIndex"es.  Why is that helpful? Because you can now put more layers into your template  composition in After Effects which you want to be changed by the script. You  just add these additional layer names as columns into your text file and  that's it. You don't need to re-program this script. Only if you want to  change the required fields.  @param text {String} - literally the contents of a .txt file.  @param requiredFields {Array} - the array that includes all columns that are required in the text file  @param delimiter {String} [Optional] - a delimiter between parts of a long string.*/function parseFirstLine(rawText, requiredFields, delimiter) {    delimiter = delimiter || "\t"; // Use tabs by default.    var text = rawText.split(delimiter);    var ret = {        layers: []    };    for (var i = 0; i < text.length; i++) {        var requiredFound = false;        for (var j = 0; j < requiredFields.length; j++) {            if (text[i].toUpperCase() === requiredFields[j].toUpperCase()) {                var attributeName = requiredFields[j] + "Index";                ret[attributeName] = i;                requiredFound = true;            }        }        if (!requiredFound) {            ret.layers.push({                layerName: text[i],                layerIndex: i            });        }    }    // Return an object with the parts we need.    return ret;};/**  Make sense of a tab separated text file.  @param text {String} - literally the contents of a .txt file.  @param columnPositions {Object} - the index of the required and optional fields  @param delimiter {String} [Optional] - a delimiter between parts of a long string.*/function parse(rawText, columnPositions, delimiter, textToShorten, shortenFrom, limit) {    delimiter = delimiter || "\t"; // Use tabs by default.    var ret = {};    // check if the line starts and ends with a " character    // and delete them    var lineLength = rawText.length;    var firstAndLastChar = rawText.charAt(0) + rawText.charAt(lineLength-1);    if (firstAndLastChar === '""') {        rawText = rawText.substring(1,lineLength-1);    }    var text = rawText.split(delimiter);    limit = limit || 2800; // we deactivate it for the moment    // limit = limit || 280;    shortenFrom = 0 || shortenFrom;    textToShorten = false || textToShorten;    var shortenTo = shortenFrom + limit,        bodyText = text[3],        a;    if (textToShorten) {        return {            startTime: text[0],            endTime: text[1],            comp: text[2],            text: text[3].substring(shortenFrom, shortenTo)        };    }    if (bodyText.length > limit) {        a = confirm('The sentence ' + bodyText + 'is too long. Shall I shorten it?');    }    if (a) {        parse(rawText, delimiter, true, shortenFrom, limit);    }    ret.startTime = text[columnPositions.startTimeIndex];    ret.endTime = text[columnPositions.endTimeIndex];    ret.comp = text[columnPositions.compositionIndex];    ret.layers = [];    for (var i = 0; i < columnPositions.layers.length; i++) {        var layer = columnPositions.layers[i];        ret.layers.push({            layerName: layer.layerName,            text: text[layer.layerIndex]        });    }    // Return an object with the parts we need.    return ret;}/**  Update the text layer of a given comp.  @Usage this is used to replace the text in duplicated "German" comps with text from a file.  @param comp {Object} - a composition.  @param textLayers {Array} - an array of text layers with its name and new content.*/function updateTextLayers(comp, textLayers) {    if (!comp) {        return;    }    for (var i = 0; i < textLayers.length; i++) {        var newText = textLayers[i].text;        if (newText) {            var textLayer = comp.layer(textLayers[i].layerName);            var textProp = textLayer.property("Source Text").setValue(newText);        }    }}/**  Places a given comp on a timeline of a target comp by using the given  start and end time. The comp will be a Layer in the target comp and  it will be splitted in three parts: beginning, middle and end.  @param comp {Object} - the comp that needs to be placed in the timeline  @param targetComp {Object} - the comp where the given comp needs to be placed in the timeline  @param startTime {String} - where the comp should start on the timeline of the targetComp  @param endTime {String} - where the comp should end on the timeline of the targetComp  @parem protection {int} - the parts in seconds of the start and end that should not be splitted*/function placeCompInTimeline(comp, targetComp, startTime, endTime, protection) {    if (!comp) {        return;    }    protection = protection || 2; // Use 2 seconds by default.    var fps = targetComp.frameRate;    var durationComp = comp.duration;    var startInSec = timeToSeconds(startTime, fps);    var endInSec = timeToSeconds(endTime, fps);    // Create three layers per comp, the startLayer and endLayer will be    // [protection] seconds long whereas the middleLayer will    // fill the gap between startLayer and endLayer    var startLayer = targetComp.layers.add(comp);    var endLayer = targetComp.layers.add(comp);    // Adjust the start time and end time of the layers and the time they are shown    startLayer.startTime = startInSec;    startLayer.outPoint = startInSec + protection;    startLayer.name = comp.name + " [Start]";    endLayer.startTime = endInSec - durationComp;    endLayer.inPoint = endInSec - protection;    endLayer.name = comp.name + " [End]";    // create as many middleLayers as needed to fill the gap by    // recognizing length of the fill in and length of the comp    var durationMiddleLayer = endInSec - startInSec - 2 * protection;    var count = 0;    var startOfMiddleLayer = startInSec;    do {        var middleLayer = targetComp.layers.add(comp);        middleLayer.name = comp.name + " [Middle " + (count + 1) + "]";        middleLayer.startTime = startOfMiddleLayer;        middleLayer.inPoint = startOfMiddleLayer + protection;        middleLayer.outPoint = Math.min(startOfMiddleLayer + durationComp - protection, endInSec - protection);        // preparation for next iteration        startOfMiddleLayer += (durationComp - 2 * protection);        durationMiddleLayer -= (durationComp - 2 * protection);        count++;    } while (durationMiddleLayer > 0);    // structure the layers a bit by moving the endLayer back to the top    endLayer.moveToBeginning();}/**  Takes a min:sec:frames string and converts it into seconds  @param timeStr {String} - the time to be converted in the format mm:ss:fr  @param fps {float} - the frames per seconds to consider*/function timeToSeconds(timeStr, fps) {    var time = timeStr.split(":");    var seconds = parseInt(time[1]);    seconds += parseInt(time[0]) * 60;    seconds += parseInt(time[2]) / fps;    return seconds;}