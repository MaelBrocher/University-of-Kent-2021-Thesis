/**
 *
 */
var ParacoordUI = function (config, options) {

    var ui = {};
    var self;
    var config = (config == undefined) ? defaultConfig : config;
    var options = (options == undefined) ? defaultOptions : options;

    var heatmaps = [];

    var dragFlag = 0;
    var showConfigFlag = 0;
    var offset = { 'x': 0, 'y': 0 };

    var init = function () {
        // if (config.debug) out('init')

        self = this;
        initUploadButton();
        initConfigButton();
        initConfigForm();
        initHeatmapExplorer();
        initShortcutKeys();

        d3.select('body').append('div').attr('class', 'loaderbg').style('visibility', 'hidden').append('div').attr('class', 'loader').text('Loading... Please Wait...');
        d3.select('body').append('div').attr('id', 'toast').append('div').attr('id', 'desc');
        ui.heatmapContainer = d3.select('body').append('div').attr('class', 'heatmapContainer');

        loadConfig(config);
    };


    function initUploadButton() {
        // if (config.debug) out('initUploadButton')

        ui.fileInput = d3.select('body').append('input').attr('type', 'file').attr('id', 'fileInput').attr('id', 'fileInput').attr('multiple', true);
        ui.btnUpload = d3.select('body').append('button').attr('id', 'uploadButton').attr('title', 'Add Files').text('+');
        ui.fileInput.on('change', function () {
            d3.select('.loaderbg').style('visibility', 'visible');
            setTimeout(submit(), 10);
        });
        ui.btnUpload.on('mouseup', function () {
            if (dragFlag === 0) ui.fileInput.node().click();
        });
        ui.btnUpload.on('mousedown', function () {
            var e = window.event;
            var bb = this.getBoundingClientRect();
            offset.x = e.clientX - bb.left;
            offset.y = e.clientY - bb.top;
            dragFlag = 0;
        });
    }


    function initConfigButton() {
        // if (config.debug) out('initConfigButton')

        ui.btnConfig = d3.select('body').append('button').attr('id', 'configButton').html('&#128295;').attr('title', 'Selected Heatmap Configuration');

        ui.btnConfig.on('mouseup', function () {
            if (dragFlag === 0) {
                if (showConfigFlag === 0) {
                    ui.config.bg.attr('class', 'show');
                    showConfigFlag = 1;
                } else {
                    ui.config.bg.attr('class', 'hidden');
                    showConfigFlag = 0;
                }
            }
        });
        ui.btnConfig.on('mousedown', function () {
            var e = window.event;
            var bb = this.getBoundingClientRect();
            offset.x = e.clientX - bb.left;
            offset.y = e.clientY - bb.top;
            dragFlag = 0;
        });
    }


    function initConfigForm() {
        // if (config.debug) out('initConfigForm')

        //inner and outer form containers
        ui.config = {};
        ui.config.form = {};
        ui.config.bg = d3.select('body').append('div').attr('id', 'configbg').attr('class', 'hidden');
        ui.config.inner = ui.config.bg.append('div').attr('id', 'configinner')
        var inner = ui.config.inner;
        var form = ui.config.form;

        //title
        inner.append('div').attr('class', 'titleContainer').append('label').attr('class', 'configTitle').text('Configuration');

        //container... WE DON'T USE THIS ANYMORE...
        ui.config.bg.on('click', function () {
            ui.config.bg.attr('class', 'hidden')
        });
        inner.on('click', function () {
            window.event.stopPropagation();
        })

        var div = inner.append('div').attr('class', 'configContainer');
        inner.on('mousedown', function () {
            var e = window.event;
            var bb = this.getBoundingClientRect();
            offset.x = e.clientX - bb.left;
            offset.y = e.clientY - bb.top;
            dragFlag = 0;
        });
        inner.on('mousemove', function () {
            var srce = window.event.srcElement.className
            if (srce == "configContainer"
                || srce == "configTitle") {

                dragElement(this);
            }
        });

        //colour select
        div.append('label').attr('class', 'configLabel').text('Colour Set');
        form.selColourSet = div.append('select');
        form.selColourSet.html('<option value="" style="display:none" disabled selected>Select Colour set</option>');
        form.svgColourRangeKey = div.append('svg').attr('id', 'svgColourRangeKey');

        //colour mode
        div.append('label').attr('class', 'configLabel').text('Colour Mode');
        form.selColourMode = div.append('select');
        form.selColourMode.html('<option value="-1" style="display:none" disabled selected>Select Colour mode</option>');

        //alpha value
        form.lblAlphaTitle = div.append('label').attr('class', 'configLabel').text('Alpha');
        form.lblAlpha = div.append('label').attr('class', 'configValue')
        form.rngAlpha = div.append('input').attr('type', 'range').attr('title', 'Colour Scaling Factor');

        //impossible cell colour
        div.append('label').attr('class', 'configLabel').text('Impossible Cell Colour');
        form.selImpossibleColour = div.append('select');
        form.selImpossibleColour.append('option').attr('disabled', 'true').attr('selected', 'selected').style('display', 'none').text('Select Impossible Cell Colour');
        //impossible cell colour key
        form.svgImpossibleCellKey = div.append('svg').attr('id', 'svgImpossibleCellKey');

        //character set
        div.append('label').attr('class', 'configLabel').text('Character Set');
        form.selCharacterSet = div.append('select');
        form.selCharacterSet.append('option').attr('disabled', 'true').attr('selected', 'selected').style('display', 'none').text('Select Character Set');

        //axis order
        //        div.append('label').attr('class','configLabel').text('Axis Order');
        //        form.selAxisOrder = div.append('select');
        //        form.selAxisOrder.append('option').attr('disabled','true').attr('selected','selected').style('display','none').text('Select Axis Order');

        //max length
        div.append('label').attr('class', 'configLabel').text('Max Length');
        form.lblMaxLength = div.append('label').attr('class', 'configValue').text(config.maxLength);
        form.rngMaxLength = div.append('input').attr('type', 'range');

        //EVENTS//EVENTS//EVENTS//EVENTS//EVENTS//EVENTS//EVENTS//EVENTS//EVENTS//EVENTS//EVENTS
        //colour set
        form.selColourSet.on('change', function () {
            updateHeatmapColour();
        });

        //colour mode
        form.selColourMode.on('change', function () {
            updateHeatmapColour();
        });

        //alpha
        form.rngAlpha.on('mousemove', function () {
            form.lblAlpha.text(this.value);
        })
            .on('change', function () {
                updateHeatmapColour();
            });

        //imposible cell colour
        form.selImpossibleColour.on('change', function () {
            updateHeatmapColour();
        });

        //max length
        form.rngMaxLength.on('mousemove', function () {
            if (this.value == 0) {
                this.value = 1;
            } else {
                form.lblMaxLength.text(this.value);
            }
        })
            .on('change', function () {
                updateHeatmapCore();
            });

        //Char set selection
        form.selCharacterSet.on('change', function () {
            updateHeatmapCore();
            updateExplorer();
        });

        //Axis order
        //        form.selAxisOrder.on('change',function() {
        //            updateHeatmapCore();
        //        });
    }


    function initHeatmapExplorer() {
        // if (config.debug) out('initHeatmapExplorer')

        ui.exp = {};
        ui.exp.cont = d3.select('body').append('div').attr('class', 'explorer');

        var xcont = ui.exp.cont.append('div').attr('id', 'container');
        ui.exp.pwChecker = xcont.append('div').attr('class', 'expPwChecker');

        xcont.append('label').attr('class', 'expHeader').text('General');
        ui.exp.svgOptions = xcont.append('div').attr('class', 'expOptions');

        xcont.append('label').attr('class', 'expHeader').text('Axis Managment');
        ui.exp.AxisMenu = xcont.append('div').attr('class', 'expAxisMenu');

        xcont.append('label').attr('class', 'expHeader').text('Semantic');
        ui.exp.semanticMenu = xcont.append('div').attr('class', 'expSemanticMenu');

        xcont.append('label').attr('class', 'expHeader').text('Filters');
        ui.exp.filters = xcont.append('div').attr('class', 'expFilters');

        xcont.append('label').attr('class', 'expHeader').text('Paracoordinates');
        ui.exp.parallel = xcont.append('div').attr('class', 'expParallel');

        xcont.append('label').attr('class', 'expHeader').text('Cross Correlation Coef');
        ui.exp.corr2 = xcont.append('div').attr('class', 'expcorr2');
        ui.exp.corr2cont = ui.exp.corr2.append('div').attr('id', 'corrContainer');

        ui.exp.stats = ui.exp.cont.append('div').attr('class', 'expStats');

        var exp = ui.exp;
        var cont = exp.cont;
        var filters = exp.filters;
        var stats = exp.stats;
        var parallel = exp.parallel;
        var svgOptions = exp.svgOptions;
        var pwChecker = exp.pwChecker;
        var axisMenu = exp.AxisMenu;
        var semanticMenu = exp.semanticMenu;

        exp.txtPwChecker = pwChecker.append('input').attr('type', 'text').attr('title', 'Strenght of Password shown on each Heatmap').attr('id', 'txtPwChecker').attr('placeholder', 'Check password Strength');

        exp.sprFilterPin = filters.append('input').attr('type', 'number').attr('id', 'sprFilterPin').attr('placeholder', 4).attr('title', 'Filter selected Heatmaps for n-length numbers');
        exp.btnFilterPin = filters.append('button').attr('id', 'btnFilterPin').text('Filter Pins');

        exp.txtFilterDate = filters.append('input').attr('type', 'text').attr('id', 'txtFilterDate').attr('placeholder', '["yyyy", "dd MMMM"]').attr('title', 'Filter selected Heatmaps for JSON formatted date string');
        exp.btnFilterDate = filters.append('button').attr('id', 'btnFilterDate').text('Filter Dates');

        exp.txtFilterWords = filters.append('input').attr('type', 'text').attr('id', 'txtFilterWords').attr('placeholder', 'word, password').attr('title', 'Filter selected Heatmaps for comma-seperated words (inclusive search)');
        exp.btnFilterWords = filters.append('button').attr('id', 'btnFilterWords').text('Filter Words');

        exp.txtDrawWords = parallel.append('input').attr('type', 'text').attr('id', 'txtDrawWords').attr('value', '').attr('placeholder', 'word, password').attr('title', 'Draw comma-seperated words to selected Heatmaps');
        exp.btnDrawWords = parallel.append('button').attr('id', 'btnDrawWords').text('Draw Words');

        exp.sprDrawTop = parallel.append('input').attr('type', 'number').attr('id', 'sprDrawTop').attr('placeholder', 50).attr('title', 'Draw n-most frequent passwords for selected Heatmaps');
        exp.btnDrawTop = parallel.append('button').attr('id', 'btnDrawTop').text('Draw Top #');

        svgOptions.append('label').text('Cell Width');
        svgOptions.append('label').text('Cell Height');
        exp.sprCellWidth = svgOptions.append('input').attr('type', 'number').attr('id', 'sprCellWidth').attr('value', config.cw).attr('title', 'Selected Heatmap cell widths');
        ui.btnZoomIn = svgOptions.append('button').attr('class', 'btnZoomIn').text('+');
        ui.btnZoomOut = svgOptions.append('button').attr('class', 'btnZoomOut').text('-');
        exp.sprCellHeight = svgOptions.append('input').attr('type', 'number').attr('id', 'sprCellHeight').attr('value', config.ch).attr('title', 'Selected Heatmap cell height');


        exp.btnSelectAll = svgOptions.append('button').text('Select All').attr('title', 'Select all Heatmaps').attr('style', "min-height: 25px;min-width: 100px;").on('click', function () {
            exp.chkSelectAll.node().click();
        });
        exp.btnFlipy = svgOptions.append('button').attr('id', 'btnFlipy').text('Flip Y').attr('style', "min-height: 25px;min-width: 100px;").attr('title', 'Flip Y-axis for selected Heatmaps');
        exp.selFlipy = svgOptions.append('input').attr('class', 'hidden').attr('id', 'selFlipy').attr('style', "min-height: 25px;min-width: 100px;").attr('type', 'checkbox');

        exp.inputWordsAxis = axisMenu.append('input').attr('type', 'text').attr('id', 'inputWordsAxis').attr('placeholder', 'word, password');
        exp.btnWordsAxis = axisMenu.append('button').attr('id', 'btnWordsAxis').text('Re-Order Axis');
        exp.selAxisOrder = axisMenu.append('select').style('width', '');
        exp.selAxisOrder.append('option').attr('disabled', 'true').attr('selected', 'selected').style('display', 'none').text('Select Axis Order');
        exp.btnAxisOrderApply = axisMenu.append('button').attr('id', 'btnAxisOrderApply').text('Apply Order')

        exp.btnSemanticFr = semanticMenu.append('button').attr('id', 'btnSemanticFr').text('French Semantic').attr('style', "margin-right:7px")
        exp.btnSemanticEn = semanticMenu.append('button').attr('id', 'btnSemanticEn').text('English Semantic').attr('style', "margin-right:7px")
        exp.btnSemanticDe = semanticMenu.append('button').attr('id', 'btnSemanticDe').text('German Semantic').attr('style', "margin-right:7px")

        exp.btnSemanticFr.on('click', function () {
            getSemanticsFromUpload('fr');
            updateHeatmapCore();
        });
        exp.btnSemanticEn.on('click', function () {
            getSemanticsFromUpload('en');
            updateHeatmapCore();
        });
        exp.btnSemanticDe.on('click', function () {
            getSemanticsFromUpload('de');
            updateHeatmapCore();
        });


        exp.btnAxisOrderApply.on('click', function () {
            OrderAxis();
            updateHeatmapCore();
        });

        exp.inputWordsAxis.on('change', function () {
            updateHeatmapCore();
        });
        exp.btnWordsAxis.on('click', function () {
            updateHeatmapCore();
        });

        //exp.lblError = cont.append('label').attr('id','lblError')
        ui.btnZoomIn.on('click', function () {
            zoomIn();
            updateExplorer();
        });

        ui.btnZoomOut.on('click', function () {
            zoomOut();
            updateExplorer();
        });
        exp.btnDrawWords.on('click', function () {
            drawWords();
        });
        exp.btnFilterPin.on('click', function () {
            filterPins();
        });
        exp.btnFilterDate.on('click', function () {
            filterDates();
        });
        exp.btnFilterWords.on('click', function () {
            filterThoseIncluding()
        });
        exp.sprCellWidth.on('change', function () {
            updateHeatmapCore();
        });
        exp.sprCellHeight.on('change', function () {
            updateHeatmapCore();
        });
        exp.btnFlipy.on('click', function () {
            exp.selFlipy.node().click();
        })
        exp.selFlipy.on('change', function () {
            updateHeatmapCore();
        });
        exp.btnDrawTop.on('click', function () {
            drawTopWords();
        });

        exp.txtPwChecker.on('keyup', function () {
            d3.selectAll('.checkPassword').remove();

            var word = this.value;
            if (word.length > 0) {
                for (var i = 0; i < heatmaps.length; i++) {
                    heatmaps[i].drawWord(word, true);
                }

                highlightPolyline({ 'word': word }, false, false);
            } else {
                var tip = d3.selectAll('#hoverWord');
                var strengthBar = d3.selectAll('#strengthBar');
                tip.text("Strength Bar");
                strengthBar.attr('class', 'show').attr('width', 0 + 'px');
            }
        });

        exp.chkSelectAll = svgOptions.append('input').attr('type', 'checkbox').attr('class', 'hidden').attr('id', 'selFlipy').on('change', function () {
            var isChecked = this.checked;
            var hms = d3.selectAll('.heatmapUI')[0];
            for (var i = 0; i < hms.length; i++) {
                if (isChecked) {
                    if ((hms[i].className + "").includes('selectedHm') == false) {
                        d3.select(hms[i]).select('.btnSelect').node().click();
                    };
                } else {
                    if ((hms[i].className + "").includes('selectedHm') == true) {
                        d3.select(hms[i]).select('.btnSelect').node().click();
                    };
                }
            }
        });

        exp.selectedRemove = svgOptions.append('button').text('Close').attr('title', 'Remove selected Heatmaps from UI').attr('style', "min-height: 25px;min-width: 100px;").on('click', function () {
            var selected = getSelected();
            for (var i = 0; i < selected.length; i++) {
                selected[i].getUI().btnRemove.node().click();
            }
        });
        exp.selectedParent = svgOptions.append('button').text('Parent').attr('title', 'Draw parent for selected Heatmaps').attr('style', "min-height: 25px;min-width: 100px;").on('click', function () {
            var selected = getSelected();
            for (var i = 0; i < selected.length; i++) {
                selected[i].getUI().btnParent.node().click();
            }
        });
        exp.selectedChild = svgOptions.append('button').text('Child').attr('title', 'Draw child for selected Heatmaps').attr('style', "min-height: 25px;min-width: 100px;").on('click', function () {
            var selected = getSelected();
            for (var i = 0; i < selected.length; i++) {
                selected[i].getUI().btnChild.node().click();
            }
        });

        var btnSelectAllPolyLines = parallel.append('button').text('Highlight').attr('title', 'Select all password lines for selected Heatmaps');
        var btnClearPolyLines = parallel.append('button').text('Clear').attr('title', 'Clear all password lines from selected Heatmaps');
        var btnRemoveWords = parallel.append('button').text('Remove').attr('title', 'Remove all selected passwords from selected Heatmaps');
        var selectedWordContainer = parallel.append('div').attr('id', 'selectedWordContainer');
        btnSelectAllPolyLines.on('click', function () {
            var selected = getSelected();
            var words = [];
            for (var i = 0; i < selected.length; i++) {
                selected[i].selectAllLines();
                words = words.concat(selected[i].getSelectedWords());
            }

            words = uniq_fast(words);
            selectedWordContainer.html("");
            for (var i = 0; i < words.length; i++) {
                selectedWordContainer.append('label').attr('class', 'lblSelectedLine').text(words[i]);
            }
        })
        btnClearPolyLines.on('click', function () {
            var selected = getSelected();
            for (var i = 0; i < selected.length; i++) {
                selected[i].clearAllLines();
            }
            selectedWordContainer.html("");
        })
        btnRemoveWords.on('click', function () {
            var selected = getSelected();
            var words = [];
            for (var i = 0; i < selected.length; i++) {
                words = words.concat(selected[i].getSelectedWords());
                selected[i].removeWords(words);
            }
            selectedWordContainer.html("");
        })

    }


    function initShortcutKeys() {
        window.addEventListener('keydown', function (e) {
            if (e.ctrlKey && e.key == 'a') {
                ui.exp.chkSelectAll.node().click();
            } else if (e.key == "Delete" && e.srcElement.tagName != "INPUT") {
                ui.exp.selectedRemove.node().click();
            }
        });
    }


    var submit = function () {
        // if (config.debug) out('submit')
        readFiles(ui.fileInput.property('files'), 'csv', uploadComplete);
    }


    var getSelected = function () {
        //        if (config.debug) out('getSelected')

        var selected = [];
        for (var i = 0; i < heatmaps.length; i++) {
            if (heatmaps[i].isSelected() == true) {
                selected.push(heatmaps[i]);
            }
        }
        return selected;
    }

    var getSemanticsFromUpload = function (lang) {
        function runPyScriptSemantic2(input, lang, heat) {
            var dataS = lang + "2431ecfe25e234d51b22ff47701d0fae" + input;
            $.ajax({
                crossDomain: true,
                type: "POST",
                url: "http://127.0.0.1:5000/semantic2",
                async: true,
                data: { mydata: dataS },
                success: function printAndCallback(result) {
                    heat.setSemantic(result, lang)
                }
            });
        }
        var selected = getSelected();
        var names = "Semantic not ready for :"
        for (var i = 0; i < selected.length; i++) {
            var name = selected[i].getName();
            if (document.getElementById('loadertxt'+name).innerText == "Semantic loading...") {
                names += "\n" + name
            }
            else 
                runPyScriptSemantic2(name, lang, selected[i])
        }
        if (names != "Semantic not ready for :") {
            var x = document.getElementById("toast")
            x.className = "show";
            x.innerText = names;
            setTimeout(function(){ x.className = x.className.replace("show", ""); }, 5000);
        }
        else {
            var selected = getSelected();
            for (var i = 0; i < selected.length; i++) {
                console.log(selected[i].getSemantic())
                var newhm = new Heatmap(lang + " semantic of " + selected[i].getName());
                newhm.isSemantic = true
                newhm.buildHeatmap(selected[i].getWords());
                newhm.setSemantic(selected[i].getSemantic(), lang)
                console.log(newhm.getSemantic())
                var hmui = new HeatmapUI(newhm, self, config, options);
                uploadComplete(lang + " semantic of " + selected[i].getName(), selected[i].getWords(), hmui);
            }
        }
    }

    var CreateSemantics = function (lang) {
        function runPyScriptSemantic(input, lang, callback) {
            var dataS = lang + "2431ecfe25e234d51b22ff47701d0fae";
            for (i = 0; i < input.length; i++) {
                dataS += input[i] + "2431ecfe25e234d51b22ff47701d0fae"
            }
            $.ajax({
                crossDomain: true,
                type: "POST",
                url: "http://127.0.0.1:5000/semantic",
                async: true,
                data: { mydata: dataS },
                success: callback
            });

        }
        function printAndCallback(result) {
            console.log(result)
        };
        var selected = getSelected();
        for (var i = 0; i < selected.length; i++) {
            var datatosend = selected[i].getWords();
            console.log(Object.keys(datatosend))
            runPyScriptSemantic(Object.keys(datatosend), lang, printAndCallback);
        }
    }

    var updateHeatmapColour = function () {
        out('updateHeatmapColour')

        var selected = getSelected();
        for (var i = 0; i < selected.length; i++) {
            var config = selected[i].getConfig();
            config.colourSet = ui.config.form.selColourSet.node().selectedOptions[0].text
            config.colourMode = ui.config.form.selColourMode.node().selectedOptions[0].value;
            config.alpha = ui.config.form.rngAlpha.node().value;
            config.impossibleCells = ui.config.form.selImpossibleColour.node().selectedOptions[0].value;

            //hide alpha options
            if (config.colourMode == "linear" || config.colourMode == "-1") {
                ui.config.form.lblAlphaTitle.property("hidden", true);
                ui.config.form.lblAlpha.property("hidden", true);
                ui.config.form.rngAlpha.style("display", 'none');
            } else {
                ui.config.form.lblAlphaTitle.property("hidden", false);
                ui.config.form.lblAlpha.property("hidden", false);
                ui.config.form.rngAlpha.style("display", 'inline');
            }
        }

        updateSVGs();

        for (var i = 0; i < selected.length; i++) {
            selected[i].colourHeatmap();
        }
    }


    var updateHeatmapCore = function () {
        //        out('updateHeatmapCore')

        var selected = getSelected();
        for (var i = 0; i < selected.length; i++) {
            var config = selected[i].getConfig();
            config.charSet = ui.config.form.selCharacterSet.node().selectedOptions[0].value;
            config.axisOrder = ui.exp.selAxisOrder.node().selectedOptions[0].value;
            config.axisWord = ui.exp.inputWordsAxis.node().value;
            config.maxLength = ui.config.form.rngMaxLength.node().value;
            config.flipy = ui.exp.selFlipy.node().checked;
            config.cw = ui.exp.sprCellWidth.node().value;
            config.ch = ui.exp.sprCellHeight.node().value;
        }

        for (var i = 0; i < selected.length; i++) {
            selected[i].drawHeatmap();
        }
    }


    var loadConfig = function (cfg) {
        // if (config.debug) out('loadConfig')

        config = cfg

        var form = ui.config.form;
        form.selColourSet.selectAll('option').remove();
        for (key in options.colourSet) {
            form.selColourSet.append("option").attr("value", options.colourSet[key]).text(key)
                .property("selected", function () { return key == config.colourSet; });
        }

        form.selColourMode.selectAll('option').remove();
        for (key in options.colourMode) {
            form.selColourMode.append("option").attr("value", key).text(options.colourMode[key])
                .property("selected", function () { return key == config.colourMode; });
        }

        form.lblAlpha.text(config.alpha);

        form.rngAlpha.attr('min', options.alpha.min).attr('max', options.alpha.max).attr('step', options.alpha.step).attr('value', config.alpha);

        form.selImpossibleColour.selectAll('option').remove();
        for (key in options.impossibleCells) {
            form.selImpossibleColour.append("option").attr("value", key).text(options.impossibleCells[key])
                .property("selected", function () { return key == config.impossibleCells; });
        }

        form.selCharacterSet.selectAll('option').remove();
        for (key in options.charSet) {
            form.selCharacterSet.append("option").attr("value", key).text(key)
                .property("selected", function () { return key == config.charSet; });
        }

        //        form.selAxisOrder.selectAll('option').remove();
        //        for (key in options.axisOrder) {
        //                form.selAxisOrder.append("option").attr("value", key).text(options.axisOrder[key])
        //                    .property("selected", function() { return key == config.axisOrder; });
        //        }
        ui.exp.selAxisOrder.selectAll('option').remove();
        for (key in options.axisOrder) {
            ui.exp.selAxisOrder.append("option").attr("value", key).text(options.axisOrder[key])
                .property("selected", function () { return key == config.axisOrder; });
        }

        form.rngMaxLength.attr('min', options.maxLength.min).attr('max', options.maxLength.max).attr('step', options.maxLength.step).attr('value', config.maxLength);
    }


    var updateSVGs = function () {
        // if (config.debug) out('updateSVGs')

        var x = 150;
        var n = 100;
        var gdata = [];

        var width = ui.config.form.svgColourRangeKey.node().getBoundingClientRect().width;
        var height = ui.config.form.svgColourRangeKey.node().getBoundingClientRect().height;

        for (var i = 0; i < n; i++) gdata[i] = x / n * i;

        ui.config.form.svgColourRangeKey.selectAll('g').remove();
        ui.config.form.svgColourRangeKey.append('g')
            .selectAll('g').data(gdata).enter().append('rect')
            .attr('width', width / n).attr('height', height)
            .attr('x', function (d, i) { return i * (width / n) })
            .attr('fill', function (d) { return getScaledColour(d, x) });

        ui.config.form.svgImpossibleCellKey.selectAll('rect').remove();
        ui.config.form.svgImpossibleCellKey.append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', config.impossibleCells);
    }


    var getScaledColour = function (d, x) {
        // if (config.debug) out('getScaledColour')

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
                //out('ERROR at getScaledColour() - No such colour mode');
                break;
        }

        var colourScale = d3.scale.linear()
            .domain([1, 0.75, 0.5, 0.25, 0])
            .range(options.colourSet[config.colourSet]);

        return colourScale(xScaled);
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


    var uploadComplete = function (name, words, hmui) {
        // if (config.debug) out('uploadComplete')

        d3.select('.loaderbg').style('visibility', 'hidden');

        if (hmui != undefined) {
            heatmaps.push(hmui);
            uploadWords(name, words, hmui)
            hmui.init(ui.heatmapContainer);
        }
    }

    var uploadWords = function (name, words, hmui) {
        function runPyScriptUploadHeatmap(input, name) {
            var dataS = name + "2431ecfe25e234d51b22ff47701d0fae";
            for (i = 0; i < input.length; i++) {
                dataS += input[i] + "2431ecfe25e234d51b22ff47701d0fae"
            }
            $.ajax({
                crossDomain: true,
                type: "POST",
                url: "http://127.0.0.1:5000/uploadHeatmap",
                async: true,
                data: { mydata: dataS },
            }).always(function () {
                document.getElementById('loadertxt'+name).innerText = "Semantic is ready"
                document.getElementById('loader'+name).style.visibility = 'hidden';
                document.getElementById('ready'+name).style.visibility = 'visible';
            });
        }
        if (hmui.getIsSemantic() == false) 
            runPyScriptUploadHeatmap(Object.keys(words), name, hmui);
    }

    var readFiles = function (files, delim, callback) {
        // if (config.debug) out('readFiles')

        var n = 0; //File counter
        var reader = new FileReader();

        readFile(files[n]); //Read first file

        function readFile(file) {
            try {
                reader.readAsText(file); //Read file
            } catch (err) {
                ui.exp.lblError.text('Error Reading files')
                d3.select('loaderbg').style('visibility', 'hidden');
            }
        }

        reader.onload = function (e) {
            var cont = false;
            var data = e.target.result;
            var result;

            //Process data correctly
            if (delim == 'tsv') {
                result = d3.tsv.parse(data);
                cont = true;
            } else if (delim == 'csv') {
                result = d3.csv.parse(data);
                cont = true;
            } else {
                cont = false;
            }

            if (cont == true) {
                var hm = new Heatmap(files[n].name);

                //Minimise list
                //transform result{} to key-value pair{}
                var rawData = {};
                result.forEach(function (obj) {
                    var pword = obj.password;
                    var freq = (obj.frequency == undefined) ? 1 : obj.frequency;

                    if (rawData[pword] == undefined || rawData[pword].length > 0) {
                        rawData[pword] = parseInt(freq);
                    } else {
                        rawData[pword] += parseInt(freq);
                    }
                });

                //Add new information to internal objects
                var hm = new Heatmap(files[n].name);
                hm.isSemantic = false,
                hm.buildHeatmap(rawData, false);
                var hmui = new HeatmapUI(hm, self, config, options);
                uploadComplete(files[n].name, hm.getWords(), hmui);
            } else {
                out('function:readFiles(files, delim, callback) - ERROR Unknown delim');
            }

            n++;
            if (n < files.length) { //read next file
                readFile(files[n])
            } else {
                //Chrome bug, clear fileinput so onchange event fires for same file
                ui.fileInput.property('value', "");

                callback == undefined
                    ? out('function:readFiles(files, delim, callback) - WARNING callBack is not a function')
                    : callback();
            };
        };
    };


    var updateSelected = function () {
        // if (config.debug) out('updateSelected')

        for (var i = 0; i < heatmaps.length; i++) {
            if (heatmaps[i].isSelected() == true) {
                heatmaps[i].getUI().cont.attr('class', 'heatmapUI selectedHm');
            } else {
                heatmaps[i].getUI().cont.attr('class', 'heatmapUI');
            }
        }

        var selected = getSelected();
        if (selected[selected.length - 1] != undefined) {
            config = selected[selected.length - 1].getConfig();
        }

        loadConfig(config);
        updateExplorer();
    }

    var zoomIn = function () {
        ui.exp.sprCellWidth.node().value++;
        ui.exp.sprCellHeight.node().value++;
        updateHeatmapCore();

    }


    var zoomOut = function () {
        ui.exp.sprCellWidth.node().value--;
        ui.exp.sprCellHeight.node().value--;
        updateHeatmapCore();
    }

    var updateExplorer = function () {
        // if (config.debug) out('updateExplorer')

        //Remove all previous stats
        var stats = ui.exp.stats;
        stats.selectAll('.statsContainer').remove();

        //Ask each selected heatmap to draw its stats
        var selected = getSelected();
        for (var ii = 0; ii < selected.length; ii++) {
            selected[ii].drawStats(ui.exp.stats);
        }

        //Get corrolation stats
        ui.exp.corr2cont.html("");
        var selected = getSelected();
        for (var i = 0; i < selected.length; i++) {
            for (j = i; j < selected.length; j++) {
                A = selected[i];
                B = selected[j];
                if (A != B) {
                    var r = (corr2(A, B) + '').slice(0, 6)
                    ui.exp.corr2cont.append('label').attr('class', 'lblCorr2').text(r + ' - ' + A.getState().name.slice(0, 12) + ' vs ' + B.getState().name.slice(0, 12));
                }
            }
        }
    }


    var remove = function (hmui) {
        // if (config.debug) out('remove')

        for (var i = 0; i < heatmaps.length; i++) {
            if (hmui === heatmaps[i]) {
                heatmaps.splice(i, 1);
            }
        }
        updateSelected();
    }


    var highlightCell = function (d, onExit) {
        for (var i = 0; i < heatmaps.length; i++) {
            var svg = heatmaps[i].getUI().svg;
            var tip = svg.select('#tip');
            var rect = d3.select(svg.node().getElementById('_' + d.c + '_' + d.pos));
            if (onExit == true) {
                rect.style('stroke', 'grey').style('stroke-width', '0')
                tip.text('');
            } else {
                freq = "0";
                try {
                    if (d.semantic == true) {
                        freq = d.value
                    }
                    else
                        freq = heatmaps[i].getState().position[d.pos].chars[d.c];
                } catch (err) { out(err) }

                rect.style('stroke', 'black').style('stroke-width', '1')
                tip.text('Char: ' + d.c + ' Pos: ' + d.pos + ' Freq: ' + freq).style('fill', 'black');
            }
        }
    }


    var highlightPolyline = function (d, onExit, onClick) {
        for (var i = 0; i < heatmaps.length; i++) {

            var svg = heatmaps[i].getUI().svg;
            var tip = svg.select('#hoverWord');
            var strengthBar = svg.select('#strengthBar');
            var polyline = d3.select(svg.node().getElementById('_' + d.word));

            if (polyline.node() != null) {

                var isSelected = polyline.node().className.baseVal.includes('polylineSelected');
                var isCheckPassword = polyline.node().className.baseVal.includes('checkPassword');
                var strength = heatmaps[i].getStrength(d.word);

                if (onExit == true && onClick == false && isSelected == false && isCheckPassword == false) {
                    polyline.style('stroke', 'black').style('stroke-opacity', 1).style('stroke-width', 1)
                    tip.text('');
                    strengthBar.attr('class', 'hidden')

                } else if (onExit == false && onClick == false && isSelected == false) {
                    polyline.style('stroke', 'red').style('stroke-opacity', 1).style('stroke-width', 3);
                    tip.text('Word: ' + d.word).style('fill', '#000');
                    strengthBar.attr('class', 'show').attr('width', strength.value * strengthBar.attr('maxWidth') + 'px');

                } else if (onClick == true) {

                    if (isSelected == true) {
                        polyline.attr('class', '');
                        polyline.style('stroke', 'black').style('stroke-opacity', 1).style('stroke-width', 1)
                        tip.text('');
                        strengthBar.attr('class', 'hidden');

                    } else {
                        polyline.attr('class', 'polylineSelected');
                        polyline.style('stroke', 'red').style('stroke-opacity', 1).style('stroke-width', 3);
                        tip.text('Word: ' + d.word).style('fill', '#000');
                        strengthBar.attr('class', 'show').attr('width', strength.value * strengthBar.attr('maxWidth') + 'px');
                    }
                } else if (isCheckPassword == true) {
                    polyline.style('stroke', 'red').style('stroke-opacity', 1).style('stroke-width', 3);
                    tip.text('Word: ' + d.word).style('fill', '#000');
                    strengthBar.attr('class', 'show').attr('width', strength.value * strengthBar.attr('maxWidth') + 'px');
                }
            }
        }
    }


    var drawWords = function () {
        var words;
        words = ui.exp.txtDrawWords.property('value').split(',').map(function (d) { return d.trim(); });

        var selected = getSelected();
        for (var i = 0; i < selected.length; i++) {
            for (var j = 0; j < words.length; j++) {
                selected[i].drawWord(words[j]);
            }
        }
    }


    var drawTopWords = function () {
        var n = (ui.exp.sprDrawTop.property('value') == "") ? 50 : ui.exp.sprDrawTop.property('value');
        var selected = getSelected();
        for (var i = 0; i < selected.length; i++) {
            selected[i].drawTop(n);
        }
    }

    var OrderAxis = function () {
        var n = (ui.exp.selAxisOrder.node().selectedOptions[0].value == "") ? undefined : ui.exp.selAxisOrder.node().selectedOptions[0].value;

        var selected = getSelected();
        for (var i = 0; i < selected.length; i++) {
            selected[i].reOrderAxis(n)
        }
        updateExplorer(ui.exp.stats);
    }

    var filterPins = function () {
        var n = (ui.exp.sprFilterPin.property('value') == "") ? undefined : ui.exp.sprFilterPin.property('value');

        var selected = getSelected();
        for (var i = 0; i < selected.length; i++) {
            selected[i].filterPin(n)
        }
        updateExplorer(ui.exp.stats);
    }


    var filterDates = function () {
        var pttn = ui.exp.txtFilterDate.property('value');

        var selected = getSelected();
        for (var i = 0; i < selected.length; i++) {
            selected[i].filterDate(pttn);
        }
        updateExplorer(ui.exp.stats);
    }


    var filterThoseIncluding = function () {
        var words;
        words = ui.exp.txtFilterWords.property('value').split(',').map(function (d) { return d.trim(); });

        var selected = getSelected();
        for (var i = 0; i < selected.length; i++) {
            selected[i].filterThoseIncluding(words);
        }
        updateExplorer(ui.exp.stats);
    }


    var getHeatmaps = function () {
        return heatmaps;
    }


    var corr2 = function (A, B) {

        //Calculate minimal set of characters included in both A, B, and the shown charSet
        var minCS = [];
        var charSet = options.charSet[config.charSet].split('');
        var Ac = Object.keys(A.getState().charSet);
        var Bc = Object.keys(B.getState().charSet);
        charSet.forEach(function (c, i) {
            if (Ac.includes(c) && Bc.includes(c)) minCS.push(c);
        })

        //Calculate min maxLength
        var minML = Math.min(config.maxLength, A.getState().maxLength, B.getState().maxLength);

        //Calculate mean
        var A_freq = 0, B_freq = 0, maxFreq = 0;
        var B_mean = 0, A_mean = 0;
        for (var n = 0; n < minCS.length; n++) {
            for (var m = 1; m <= minML; m++) {
                //Frequency of character minCS[n] at position m
                A_freq = A.getState().position[m].chars[minCS[n]];
                B_freq = B.getState().position[m].chars[minCS[n]];

                //Max frequency used for normalisation
                maxFreq = Math.max(A_freq, B_freq, maxFreq);

                A_mean += A_freq;
                B_mean += B_freq;
            }
        }

        A_mean = A_mean / (minCS.length * minML);
        B_mean = B_mean / (minCS.length * minML);

        //Normalise mean
        A_mean = A_mean / maxFreq;
        B_mean = B_mean / maxFreq;

        //Calculating usign algorithm from http://uk.mathworks.com/help/images/ref/corr2.html
        var A_nm = 0, B_nm = 0;
        var A_mid = 0, B_mid = 0;
        var AB_sum = 0, AA_sum = 0, BB_sum = 0;
        for (var n = 0; n < minCS.length; n++) {
            for (var m = 1; m <= minML; m++) {
                A_nm = A.getState().position[m].chars[minCS[n]];
                B_nm = B.getState().position[m].chars[minCS[n]];

                A_mid = A_nm - A_mean;
                B_mid = B_nm - B_mean;

                AB_sum += A_mid * B_mid;
                AA_sum += A_mid * A_mid;
                BB_sum += B_mid * B_mid;
            }
        }
        var r = AB_sum / Math.sqrt(AA_sum * BB_sum);

        return r;
    }
    var copyHM = function (hm) {

        var newhm = new Heatmap(hm.getState().name + " Copy");
        newhm.buildHeatmap(hm.getWords());
        var hmui = new HeatmapUI(newhm, self, config, options);
        uploadComplete(hm.name, hm.getWords(), hmui);
    }

    return {
        init: init,

        getUI: ui,
        getHeatmaps: getHeatmaps,

        uploadComplete: uploadComplete,
        remove: remove,
        highlightCell: highlightCell,
        highlightPolyline: highlightPolyline,

        updateSelected: updateSelected,
        updateExplorer: updateExplorer,
        copyHM: copyHM,

        corr2: corr2,
    };
}

//Globab access for debugging
var ui
var paracoord;

//Main function tobe called by index.html
function main() {

    //Use user defined options/confif if they are defined
    if (typeof config === undefined || typeof options === undefined) {
        paracoord = new ParacoordUI();
    } else {
        paracoord = new ParacoordUI(config, options);
    }

    //Begin!
    paracoord.init();
    ui = paracoord.getUI;
}