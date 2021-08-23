/**
 *
 */
var draggedHeatmapUI;
var draggedOverElement = undefined;

var HeatmapUI = function (heatmap, parentui, config, options) {

    var self;
    var id = Math.floor(Math.random() * 100000);

    var selected = false;
    var words = [];
    var mean = {};

    var STRENGTH_SCALE_FACTOR = 6;

    var ui = {};
    var parentui = parentui;
    var heatmap = (heatmap == undefined) ? new Heatmap('') : heatmap;
    var config = (config == undefined) ? defaultConfig : Object.create(config);
    var options = (options == undefined) ? defaultOptions : Object.create(options);

    var dragFlag = 0;
    var offset = { 'x': 0, 'y': 0 };

    var init = function (parent) {
        self = this;
        selected = true
        ui.cont = parent.append('div').attr('class', 'heatmapUI').property('draggable', true);

        var div = ui.cont.append('div').attr('class', 'heatmapHeader')
        ui.btnSelect = div.append('button').attr('class', 'btnSelect').text('Select');
        ui.btnRemove = div.append('button').attr('class', 'btnRemove').text('Close');

        ui.btnParent = div.append('button').attr('class', 'btnParent').text('Parent').property('disabled', true);
        ui.btnChild = div.append('button').attr('class', 'btnChild').text('Child').property('disabled', true);
        ui.btnCopyHM = div.append('button').attr('class', 'copyHeatmap').text('Copy');
        //add the loader while the server didn't respond
        if (heatmap.isSemantic == false) {
            ui.loader = div.append('div').attr('class', 'loaderheatmap').attr('id', 'loader'+ heatmap.getName()).style('visibility', 'visible')
            ui.loadertxt = div.append('div').attr('class', 'loadertext').attr('id', 'loadertxt'+ heatmap.getName()).text("Semantic loading...")
            ui.ready = div.append('div').attr('class', 'loadingReady').attr('id', 'ready' + heatmap.getName()).style('visibility', 'hidden')
        }
        else {
            //add link to Part Of Speech (POS) documentation
            ui.PosDoc = div.append('form').attr('target', '_blank').attr('display', 'block').attr('action', 'https://universaldependencies.org/docs/u/pos/').append('button').attr('type', 'submit').attr('display', 'block').text('i')
        }
        parentui.updateSelected();
        ui.btnSelect.on('click', function () {
            selected = (selected == true) ? false : true;
            parentui.updateSelected();
        });
        ui.btnRemove.on('click', function () {
            ui.cont.remove();
            parentui.remove(self);
        });
        ui.btnParent.on('click', function () {
            drawParent();
            updateButtons();
            parentui.updateExplorer();
        });
        ui.btnChild.on('click', function () {
            drawChild();
            updateButtons();
            parentui.updateExplorer();
        });
        ui.btnCopyHM.on('click', function () {
            parentui.copyHM(heatmap);
        });
        initDragEvents();

        drawHeatmap();
    }


    var initDragEvents = function () {
        ui.cont.node().addEventListener('dragstart', handleDragStart, false);
        ui.cont.node().addEventListener('dragenter', handleDragEnter, false);
        ui.cont.node().addEventListener('dragover', handleDragOver, false);
        ui.cont.node().addEventListener('dragleave', handleDragExit, false);
        ui.cont.node().addEventListener('drop', handleDragEnd, false);

        ui.dragoverUI = ui.cont.append('div').attr('id', 'dragoverUI').attr('class', 'hidden');
        ui.btnNormalMerge = ui.dragoverUI.append('button').attr('id', 'btnNormalMerge').text('Normalised Merge')
        ui.btnSetDifference = ui.dragoverUI.append('button').attr('id', 'btnSetDifference').text('Set Difference')
        ui.btnSetIntersection = ui.dragoverUI.append('button').attr('id', 'btnSetIntersection').text('Set Intersection')


        function handleDragStart(e) {
            if (heatmap == draggedHeatmapUI) {
                //no
            } else {
                //out('drag start');
            }
            draggedHeatmapUI = heatmap;
        }

        function handleDragEnter(e) {
            if (heatmap == draggedHeatmapUI) {
                //no
            } else {
                //show visuals we have hidden
                draggedOverElement = ui.cont;
                ui.dragoverUI.attr('class', 'show');
            }
            e.preventDefault();
        }

        function handleDragOver(e) {
            if (heatmap == draggedHeatmapUI) {
                //no
            } else {
                //Could have scaling bubbles around buttons according to mouse coordinates
            }
            e.preventDefault();
        }

        function handleDragExit(e) {
            if (heatmap == draggedHeatmapUI) {
                //no
            } else {
                //remove any visuals we have shown
                if (e.srcElement.className == "heatmapUI" || e.srcElement.id == "dragoverUI") {
                    ui.dragoverUI.attr('class', 'hidden');
                }
            }
            e.preventDefault();
        }

        function handleDragEnd(e) {
            if (heatmap == draggedHeatmapUI) {
                //Could do some fancy effect?
            } else {
                var scaleFactor = 1;
                var wordCount = heatmap.getState().wordCount;
                var words1 = heatmap.getWords();
                var words2 = draggedHeatmapUI.getWords();
                var heatmap_name = ""
                //Normalise word frequency from draggable if true
                if (e.srcElement.id == "btnNormalMerge") {
                    console.log("Merge")
                    heatmap_name = "Merge " + heatmap.getName() + " " + draggedHeatmapUI.getName();
                    var keys = Object.keys(words2);
                    for (var i = 0; i < keys.length; i++) {

                        var word = keys[0];
                        var oldfreq = words2[word];
                        var newFreq = Math.round(getScaledValue(oldfreq, wordCount, 1));

                        if (newFreq == 0) { //freq was the same
                            words2[word] = oldfreq;
                        } else {
                            words2[word] = newFreq;
                        }
                    }
                    //create the set difference of two heatmaps
                } else if (e.srcElement.id == "btnSetDifference") {
                    heatmap_name = "Difference " + heatmap.getName() + " " + draggedHeatmapUI.getName();
                    console.log("Difference");
                    var keys = new Set(Object.keys(words1));
                    var keys2 = new Set(Object.keys(words2));
                    var diff = new Set([...keys].filter(x => !keys2.has(x)));
                    var copy = new Array();
                    var diffArray = Array.from(diff)
                    for (var i = 0; i < diffArray.length; i++) {
                        var d = diffArray[i]
                        var oldfreq = words1[d];
                        var newFreq = Math.round(getScaledValue(oldfreq, wordCount, 1));

                        if (newFreq == 0) { //freq was the same
                            copy[d] = oldfreq;
                        } else {
                            copy[d] = newFreq;
                        }
                    }
                    words1 = copy;
                    //create the set intersection of two heatmaps
                } else if (e.srcElement.id == "btnSetIntersection") {
                    heatmap_name = "Intersection " + heatmap.getName() + " " + draggedHeatmapUI.getName();
                    console.log("Intersection");
                    var keys = new Set(Object.keys(words1));
                    var keys2 = new Set(Object.keys(words2));
                    var diff = new Set([...keys].filter(x => keys2.has(x)));
                    var copy = new Array();
                    var diffArray = Array.from(diff)
                    for (var i = 0; i < diffArray.length; i++) {
                        var d = diffArray[i]
                        var oldfreq = words1[d];
                        var newFreq = Math.round(getScaledValue(oldfreq, wordCount, 1));

                        if (newFreq == 0) { //freq was the same
                            copy[d] = oldfreq;
                        } else {
                            copy[d] = newFreq;
                        }
                    }
                    words1 = copy;
                    //Some new drag and drop feature button
                } else {
                    return undefined;//Continue to add raw data
                }

                //Create new heatmap
                var newhm = new Heatmap( heatmap_name, true, undefined, undefined);
                newhm.buildHeatmap(words1, false, options.charSet[config.charSet]);
                if (e.srcElement.id == "btnNormalMerge")
                    newhm.buildHeatmap(words2, true, options.charSet[config.charSet]);

                //Create new heatmapUI
                var newhmui = new HeatmapUI(newhm, parentui, config, options);

                //Get parentui to draw this new combined hm
                parentui.uploadComplete(heatmap_name, newhm.getWords(), newhmui);
            }

            d3.selectAll('#dragoverUI').attr('class', 'hidden');

            e.preventDefault();
        }
    }


    var getScaledColour = function (d, x) {
        var yScaled = d / x;

        var xScaled;
        switch (config.colourMode) {
            case ("linear"):
                xScaled = yScaled;
                break;

            case ("alpha"):
                xScaled = Math.pow(yScaled, config.alpha);
                break;

            case ("inverseAlpha"):
                xScaled = Math.pow(yScaled, 1 / config.alpha);
                break;

            default:
                out('ERROR at getScaledColour() - No such colour mode');
                break;
        }

        var colourScale = d3.scale.linear()
            .domain([1, 0.75, 0.5, 0.25, 0])
            .range(options.colourSet[config.colourSet]);

        return colourScale(xScaled);
    }


    var getScaledValue = function (d, x, factor) {
        var sf1 = d / x;
        var scale1 = d3.scale.linear()
            .domain([0, 1])
            .range([0, 1]);

        sf1 = scale1(Math.pow(sf1, 1 / factor));

        var avgsf = sf1;
        return (1 - avgsf);
    }


    var colourHeatmap = function () {
        //Colour cells
        ui.svg.selectAll('.cell').each(function (d) {
            if (d.freq == undefined) {
                d3.select(this).style('fill', config.impossibleCells);
            } else {
                d3.select(this).style('fill', getScaledColour(d.freq, ui.svg.maxFreq));
            }
        });

        ui.svg.select('#hmscale').selectAll('rect')
            .attr('fill', function (d) { return getScaledColour(d.freq, ui.svg.maxFreq) });
    }


    var drawHeatmap = function () {
        if (ui.svg != undefined) ui.svg.remove();

        var datum = [];
        var state = heatmap.getState();
        ui.btnSelect.text(state.name);

        var cw = config.cw;
        var ch = config.ch;
        var kh = config.kh;
        var hh = config.hh;
        var hw = config.hw;
        var sbh = config.sbh;
        var hish = config.hish;
        var fs = config.fs;
        var flipy = config.flipy;
        var axisOrder = state.axisOrder;
        var maxLength = (config.maxLength == -1) ? state.maxLength : config.maxLength;
        var charSet = options.charSet[config.charSet];
        var maxFreq = 0;

        var axisWord = config.axisWord;
        var isSemantic = heatmap.isSemantic
        var SemanticTab = heatmap.getSemantic()

        var svgw = charSet.length * cw + hw;
        var svgh = maxLength * ch + hh + kh + sbh + hish;

        var div = ui.cont.append('div').attr('class', 'svgOverFlow');
        ui.svg = div.append('svg').attr('class', 'svgHeatmap').attr('width', svgw).attr('height', svgh).attr('display', 'block')//.style('border', '1px solid black')

        charSet = applyAxisOrder(axisOrder, charSet, axisWord, isSemantic);
        if (isSemantic == true) {
            cw *= 3.4
            //wider column if it's a semantic heatmap
        }
        for (x = 0; x < charSet.length; x++) {
            var c = charSet[x]
            SemanticTab = heatmap.getSemantic()
            //x axis labels and line
            ui.svg.append('text').attr('id', '_' + c + '_').attr('width', cw).attr('height', hh).attr('x', (x * cw) + hw + cw / 2).attr('y', hh - hh / 2).style('alignment-baseline', 'central').style('text-anchor', 'middle').text(c)
            ui.svg.append('line').attr('x1', (x * cw) + hw).attr('y1', 0).attr('x2', (x * cw) + hw).attr('y2', hh).style('stroke', 'grey').style('stroke-width', '.5');
            for (y = 0; y < maxLength; y++) {
                //Reverse y-axis
                var pos = (flipy == true) ? (y + 1) : (maxLength - y);

                //y axis labels and line
                if (x == 0) {
                    ui.svg.append('text').attr('id', '__' + pos).attr('width', hw).attr('height', ch).attr('x', hw / 2).attr('y', (y * ch) + hh + ch / 2).style('alignment-baseline', 'central').style('text-anchor', 'middle').text(pos);
                    ui.svg.append('line').attr('x1', 0).attr('y1', (y * ch) + hh).attr('x2', hw).attr('y2', (y * ch) + hh).style('stroke', 'grey').style('stroke-width', '.5');
                }

                //Cells
                ui.svg.append('g').append('rect').attr('class', 'cell').attr('id', '_' + c + '_' + pos).attr('x', (x * cw) + hw).attr('y', (y * ch) + hh).attr('width', cw).attr('height', ch).style('stroke', 'grey').style('fill', 'none').attr('width', cw).attr('height', ch).style('stroke-width', '0')
                    .on('mouseover', function (d) {
                        parentui.highlightCell({ 'c': d.c, 'pos': d.pos, 'semantic': isSemantic}, false);
                    })
                    .on('mouseout', function (d) {
                        parentui.highlightCell({ 'c': d.c, 'pos': d.pos, 'semantic': isSemantic }, true);
                    });
                try {
                    var cfreq = 0
                    if (isSemantic == true) {
                        cfreq = state.semanticPosition[pos].chars[c]
                    }
                    else {
                        cfreq = state.position[pos].chars[c];
                    }
                    maxFreq = (maxFreq < cfreq) ? cfreq : maxFreq;
                    datum.push({ 'c': c, 'pos': pos, 'freq': cfreq });
                } catch (err) {
                    datum.push({ 'c': c, 'pos': pos, 'freq': undefined });
                }
            }
        }

        //Draw histogram... Sorry for long method... cba
        var data = [];
        var maxPerc = 0;
        for (var i = 0; i < charSet.length; i++) {
            if (isSemantic == true)
            {
                var c = charSet[i];
                var cfreq = (state.semanticCharset[c] == undefined) ? 0 : state.semanticCharset[c];
                var perc = cfreq / state.semanticCharcount * 100;
                maxPerc = (maxPerc < perc) ? perc : maxPerc;
                data.push({ 'value': perc, 'name': c });    
            }
            else {
                var c = charSet[i];
                var cfreq = (state.charSet[c] == undefined) ? 0 : state.charSet[c];
                var perc = cfreq / state.charCount * 100;
                maxPerc = (maxPerc < perc) ? perc : maxPerc;
                data.push({ 'value': perc, 'name': c });
            }
        }
        var y = d3.scale.linear().range([hish, 0]).domain([0, maxPerc]);
        var barWidth = cw;
        var bar = ui.svg.append('g').attr('id', 'histo').selectAll('#histo').data(data).enter().append('g')
            .attr('transform', function (d, i) { return "translate(" + (i * barWidth + hw) + ", " + ((maxLength * ch) + hh) + ")"; });
        bar.append('rect')
            .attr('y', function (d, i) { return y(d.value); })
            .attr('height', function (d, i) { return hish - y(d.value) })
            .attr('width', barWidth)

        //Property set tjat's needed for somewhere else... You'll break something if you remove this!
        ui.svg.maxFreq = maxFreq;

        //Draw/position strength bar
        var barLength = svgw / 3;
        ui.svg.append('rect').attr('id', 'strengthBar').attr('class', 'show').attr('maxWidth', barLength).text('Strength Bar')
            .attr('x', hw).attr('y', svgh - kh - sbh)
            .attr('height', sbh)
            .attr('fill', '#aaa')
        ui.svg.append('rect').attr('id', 'strengthBarBorder').attr('class', 'show')
            .attr('x', hw).attr('y', svgh - kh - sbh)
            .attr('width', svgw / 3).attr('height', sbh)
            .style('stroke', 'grey').style('stroke-width', '1')
            .attr('fill', 'none');

        //Tooltip text
        ui.svg.append('text').attr('id', 'tip').attr('x', charSet.length * cw + hw).attr('y', svgh - kh - sbh / 2).style('alignment-baseline', 'central').style('text-anchor', 'end')

        //Selected word text
        ui.svg.append('text').attr('id', 'hoverWord').attr('x', hw + fs).attr('y', svgh - kh - sbh / 2).style('alignment-baseline', 'central').style('text-anchor', 'center').style('fill', 'white');

        //Enter data into cells
        ui.svg.selectAll('rect').data(datum).enter()

        //Draw legend
        datum = []
        var max = 100;
        for (i = 0; i <= max; i++) {
            datum.push({ 'i': i, 'freq': Math.floor((maxFreq / max) * i) });
        }
        ui.svg.append('g').attr('id', 'hmscale').selectAll('#hmscale').data(datum).enter().append('rect').attr('width', ((charSet.length * cw - hw) / max) + 2).attr('height', kh).attr('x', function (d, i) { return (((charSet.length * cw) / max) * d.i) + hw }).attr('y', svgh - kh);
        ui.svg.select('#hmscale').selectAll('rect').on('mouseover', function (d) {
            var x = (((charSet.length * cw) / max) * d.i) + hw;
            if (x < 300) {
                legendValue.text(d.freq).attr('x', x + fs);
            }
            else {
                legendValue.text(d.freq).attr('x', x - (fs * (d.freq.toString().length - 2)));
            }
            //Sorry for magic numbers, They're for fine tuning position. Can't remmeber why.
            legendTick.attr('points', (x - 5) + ',' + (svgh - 8) + ' ' + (x + 5) + ',' + (svgh - 8) + ' ' + (x) + ',' + (svgh));
        })
        var legendValue = ui.svg.append('text').attr('id', 'legendValue').attr('x', hw - fs).attr('y', svgh - (kh / 2)).style('alignment-baseline', 'central').style('text-anchor', 'start').text('0')
        var legendTick = ui.svg.append('polygon').attr('id', 'legendTick').attr('points', (hw - 5) + ',' + (svgh - 8) + ' ' + (hw + 5) + ',' + (svgh - 8) + ' ' + (hw) + ',' + (svgh))

        colourHeatmap();
        drawWords();

        //Global text setting
        ui.svg.selectAll('text').style('font-size', fs).style('font-family', 'monospace').style('pointer-events', 'none');

        return ui.svg;
    }

    //return the AxisOrder
    var applyAxisOrder = function (axisOrder, charSet, axisWord, isSemantic) {
        var state = heatmap.getState();
        var returnme = "";
        if (isSemantic == true) {
            charSet = ["NAME","ADJ","ADV","INTJ","NOUN","PROPN","VERB","ADP","AUX","CCONJ","DET","NUM","PART","PRON","SCONJ","PUNCT","SYM", "UKN",]
            if (axisOrder == "alphabetical") {
                return charSet
            }
            else if (axisOrder == "frequency") {
                var data = [];
                for (var i = 0; i < charSet.length; i++) {
                    var c = charSet[i];
                    var cfreq = (state.semanticCharset[c] == undefined) ? 0 : state.semanticCharset[c];
                    data.push({ value: cfreq, name: c });
                }
                data.sort(function (a, b) { return b.value - a.value; });
                returnme = []
                for (var i = 0 ; i < charSet.length; i++) {
                    returnme.push(data[i].name)
                }
                return returnme
            }
        }
        if (axisOrder == "alphabetical")
            returnme = options.charSet[config.charSet];
        else if (axisOrder == "frequency") {
            var data = [];
            for (var i = 0; i < charSet.length; i++) {
                var c = charSet[i];
                var cfreq = (state.charSet[c] == undefined) ? 0 : state.charSet[c];
                data.push({ value: cfreq, name: c });
            }
            data.sort(function (a, b) { return b.value - a.value; });
            for (i = 0; i < charSet.length; i++) {
                returnme += data[i].name;
            }
        }
        if (axisWord != "")
            returnme = removeDuplicateCharacters(axisWord + returnme)
        return returnme;
    }
    var removeDuplicateCharacters = function (string) {
        return string
            .split('')
            .filter(function (item, pos, self) {
                return self.indexOf(item) == pos;
            })
            .join('');
    }

    var drawStats = function (parent) {

        var container = parent.append('div').attr('class', 'statsContainer');
        var state = getState();

        container.append('label').text('File Name').attr('class', 'left');
        var lblSelectedName = container.append('label').attr('id', 'lblSelectedName').attr('class', 'right');
        container.append('br');

        container.append('label').text('Word Count').attr('class', 'left');
        var lblWordCount = container.append('label').attr('id', 'lblWordCount').attr('class', 'right');
        container.append('br');

        container.append('label').text('Char Count').attr('class', 'left');
        var lblCharCount = container.append('label').attr('id', 'lblCharCount').attr('class', 'right');
        container.append('br');

        container.append('label').text('Max Length').attr('class', 'left');
        var lblMaxLength = container.append('label').attr('id', 'lblMaxLength').attr('class', 'right');
        container.append('br');

        container.append('label').text('Max Frequency').attr('class', 'left');
        var lblMaxCharFreq = container.append('label').attr('id', 'lblMaxCharFreq').attr('class', 'right');
        container.append('br');

        container.append('label').text('Unique Words').attr('class', 'left');
        var lblUniqueCount = container.append('label').attr('id', 'lblUniqueCount').attr('class', 'right');
        container.append('br');

        var svgCharSet = container.append('svg').attr('id', 'svgCharSet');

        //stat labels
        lblSelectedName.text(state.name);
        lblWordCount.text(state.wordCount.toLocaleString());
        lblCharCount.text(state.charCount.toLocaleString());
        lblMaxLength.text(state.maxLength.toLocaleString());
        lblMaxCharFreq.text(state.maxCharFreq.toLocaleString());
        lblUniqueCount.text(state.uniqueCount.toLocaleString());

        //character frequency
        var chart = svgCharSet;
        chart.selectAll('g').remove();
        chart.selectAll('text').remove();
        chart.attr('height', '50px');
        var data = [];
        var maxPerc = 0;
        var userCharSet = options.charSet[config.charSet];

        var hh = 12;
        var fh = 12;
        var fs = 12
        var width = chart.node().getBoundingClientRect().width;
        var height = chart.node().getBoundingClientRect().height;

        var lblCharSetHeader = chart.append('text').attr('width', width).attr('height', hh).attr('x', width / 2).attr('y', hh / 2).style('alignment-baseline', 'central').style('text-anchor', 'middle').text('Character Frequency');
        var lblCharSetHover = chart.append('text').attr('width', width).attr('height', hh).attr('x', width / 2).attr('y', height - hh + fh / 2).style('alignment-baseline', 'central').style('text-anchor', 'middle').text('Char: - Frequency: -.-%');

        for (var i = 0; i < userCharSet.length; i++) {
            var c = userCharSet[i];
            var cfreq = (state.charSet[c] == undefined) ? 0 : state.charSet[c];
            var perc = cfreq / state.charCount * 100;
            maxPerc = (maxPerc < perc) ? perc : maxPerc;
            data.push({ 'value': perc, 'name': c });
        }
        var y = d3.scale.linear().range([height - hh - fh, 0]).domain([0, maxPerc]);
        var barWidth = width / data.length;
        var bar = chart.selectAll('g').data(data).enter().append('g')
            .attr('transform', function (d, i) { return "translate(" + (i * barWidth) + ",0)"; });
        bar.append('rect')
            .attr('y', function (d, i) { return y(d.value) + hh; })
            .attr('height', function (d, i) { return height - y(d.value) - hh - fh })
            .attr('width', barWidth)
            .on('mouseover', function (d, i) {
                lblCharSetHover.text('Char: ' + d.name + ' Frequency: ' + d.value.toFixed(1) + '%');
            });

        chart.selectAll('text').style('font-size', fs).style('font-family', 'monospace').style('pointer-events', 'none');
    }


    var drawWords = function () {
        words.forEach(function (d) { drawWord(d) });
    }


    var drawWord = function (word, isCheckPassword) {
        //Accumilate points of the word
        try {
            var points = '';
            for (var i = 0; i < word.length - 1; i++) {
                var c1 = word[i];
                var pos1 = i + 1;
                var c2 = word[i + 1];
                var pos2 = i + 2;

                var b1 = d3.select(document.getElementById('_' + c1 + '_' + pos1)).filter(function (d) { if (d.c == c1 && d.pos == pos1) return this; }).node().getBBox();
                var b2 = d3.select(document.getElementById('_' + c2 + '_' + pos2)).node().getBBox();

                var x1 = b1.x + b1.width / 2;
                var y1 = b1.y + b1.height / 2;
                var x2 = b2.x + b2.width / 2;
                var y2 = b2.y + b2.height / 2;

                points += x1 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ';
            }
            //Draw polyline
            var line = ui.svg.append('polyline').attr('id', '_' + word).attr('points', points).style('fill', 'none').style('stroke', 'black').style('stroke-width', '1').style('stroke-opacity', 1)
                .on('mouseover', function () {
                    parentui.highlightPolyline({ 'word': word }, false, false);
                })
                .on('mouseout', function () {
                    var freq = heatmap.getState().position[word.length].words[word]
                    parentui.highlightPolyline({ 'word': word }, true, false);
                })
                .on('click', function () {
                    parentui.highlightPolyline({ 'word': word }, false, true);
                })

            if (isCheckPassword == true) {
                line.attr('class', 'checkPassword');
            }
        } catch (err) {
            console.log(err)
            return 1;
        }

        if (heatmap.isSemantic == true) {
                    //Accumilate points of the word
            try {
                var points = '';
                for (var i = 0; i < word.length - 1; i++) {
                    var c1 = word[i];
                    var pos1 = i + 1;
                    var c2 = word[i + 1];
                    var pos2 = i + 2;

                    var b1 = d3.select(document.getElementById('_' + c1 + '_' + pos1)).filter(function (d) { if (d.c == c1 && d.pos == pos1) return this; }).node().getBBox();
                    var b2 = d3.select(document.getElementById('_' + c2 + '_' + pos2)).node().getBBox();

                    var x1 = b1.x + b1.width / 2;
                    var y1 = b1.y + b1.height / 2;
                    var x2 = b2.x + b2.width / 2;
                    var y2 = b2.y + b2.height / 2;

                    points += x1 + ',' + y1 + ' ' + x2 + ',' + y2 + ' ';
                }
                //Draw polyline
                var line = ui.svg.append('polyline').attr('id', '_' + word).attr('points', points).style('fill', 'none').style('stroke', 'black').style('stroke-width', '1').style('stroke-opacity', 1)
                    .on('mouseover', function () {
                        parentui.highlightPolyline({ 'word': word }, false, false);
                    })
                    .on('mouseout', function () {
                        var freq = heatmap.getState().position[word.length].words[word]
                        parentui.highlightPolyline({ 'word': word }, true, false);
                    })
                    .on('click', function () {
                        parentui.highlightPolyline({ 'word': word }, false, true);
                    })

                if (isCheckPassword == true) {
                    line.attr('class', 'checkPassword');
                }
            } catch (err) {
                console.log(err)
                return 1;
            }
        }
        
        return 0;
    }


    var getStrength = function (word) {
        var strength = {};

        var avgFreq = 0;
        for (var x = 0; x < word.length; x++) {
            var pos = x + 1;
            var c = word[x];
            var freq = heatmap.getState().position[pos].chars[c];

            if (freq == undefined) {
                return undefined;
            } else {
                avgFreq += freq;
            }
        }
        avgFreq = avgFreq / word.length;


        strength.avgFreq = avgFreq;
        strength.value = getScaledValue(avgFreq, ui.svg.maxFreq, STRENGTH_SCALE_FACTOR);
        strength.colour = getScaledColour(avgFreq, ui.svg.maxFreq);
        return strength;
    }


    var getConfig = function () {
        return config;
    }


    var getUI = function () {
        return ui;
    }


    var isSelected = function () {
        return selected;
    }


    var getState = function () {
        return heatmap.getState();
    }

    var setSemantic = function (data, lang) {
        heatmap.setSemantic(data, lang);
    }

    var getSemantic = function () {
        return heatmap.getSemantic();
    }

    var getIsSemantic = function() {
        return heatmap.isSemantic;
    }

    var setIsSemantic = function(val) {
        heatmap.isSemantic = val;
    }
    var getName = function () {
        return heatmap.getName()
    }

    var getWords = function () {
        return heatmap.getWords();
    }

    var reOrderAxis = function (n) {
        heatmap = heatmap.reOrderAxis(n , heatmap.isSemantic);
        heatmap.getState().axisOrder = n
        drawHeatmap();
        updateButtons();
    }

    var filterPin = function (n) {
        heatmap = heatmap.filterPin(n);
        drawHeatmap();
        updateButtons();
    }


    var filterDate = function (n) {
        heatmap = heatmap.filterDate(n);
        drawHeatmap();
        updateButtons();
    }


    var filterThoseIncluding = function (n) {
        heatmap = heatmap.filterThoseIncluding(n);
        drawHeatmap();
        updateButtons();
    }


    var removeWords = function (n) {
        heatmap = heatmap.removeWords(n);
        drawHeatmap();
        updateButtons();
    }


    var drawChild = function () {
        heatmap = heatmap.getChild();
        drawHeatmap();
        updateButtons();
    }


    var drawParent = function () {
        heatmap = heatmap.getParent();
        drawHeatmap();
        updateButtons();
    }


    var dragElement = function (ele) {
        // if (config.debug) out('dragElement')

        var e = window.event;
        if (e.buttons == 1) {
            dragFlag = 1;
            ele.style.position = 'absolute';
            ele.style.top = e.clientY - offset.y + 'px';
            ele.style.left = e.clientX - offset.x + 'px';
        }
    }


    var getHeatmap = function () {
        return heatmap;
    }


    var updateButtons = function () {
        if (heatmap.getParent() == undefined) {
            ui.btnParent.node().disabled = true;
        } else {
            ui.btnParent.node().disabled = false;
        }

        if (heatmap.getChild() == undefined) {
            ui.btnChild.node().disabled = true;
        } else {
            ui.btnChild.node().disabled = false;
        }
    }


    var drawTop = function (n) {
        var words = heatmap.isSemantic == true ? heatmap.getSemanticOrderByFrequency() :heatmap.getWordsOrderByFrequency() ;

        n = (words.length < n) ? words.length : n;

        for (var i = 0; i < n; i++) {
            if (heatmap.isSemantic) 
            {
                drawWord(words[i]);
            }
            else {
                drawWord(Object.keys(words[i])[0]);
            }
        }
    }


    var getID = function () {
        return id;
    }


    var getSelectedWords = function () {
        var words = [];

        var lines = ui.svg.selectAll('.polylineSelected');
        for (var i = 0; i < lines[0].length; i++) {
            words.push(lines[0][i].id.slice(1)); //Remove underscore from word id
        }

        return words;
    }


    var selectAllLines = function () {
        ui.svg.selectAll('polyline').attr('class', 'polylineSelected').style('stroke', 'red').style('stroke-opacity', 1).style('stroke-width', 3);
    }


    var clearAllLines = function () {
        ui.svg.selectAll('polyline').remove();
    }

    return {
        init: init,
        getID: getID,
        getUI: getUI,
        isSelected: isSelected,

        selectAllLines: selectAllLines,
        clearAllLines: clearAllLines,

        drawWord: drawWord,
        drawTop: drawTop,
        drawHeatmap: drawHeatmap,
        colourHeatmap: colourHeatmap,
        drawStats: drawStats,

        drawChild: drawChild,
        drawParent: drawParent,

        getConfig: getConfig,
        getState: getState,
        getStrength: getStrength,
        getSelectedWords: getSelectedWords,

        getName: getName,

        setIsSemantic : setIsSemantic,
        getIsSemantic : getIsSemantic,
		getSemantic : getSemantic,
		setSemantic : setSemantic,

        getWords: getWords,
        reOrderAxis: reOrderAxis,
        filterPin: filterPin,
        filterDate: filterDate,
        filterThoseIncluding: filterThoseIncluding,
        removeWords: removeWords,
    }
}