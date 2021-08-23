//Added AxisOrder and AxisWord
var config = {
    "debug" : true,
    "cw": 10, //cell width
    "ch": 10, //cell height
    "kh": 15, //legend height
    "hh": 15, //header height
    "hw": 15, //header width
    "sbh": 25, //Strength bar height
    "hish": 25, //Histogram height
    "fs": 12, //font size
    "flipy": false, //invert y axis
    "hspace" : 5, // horizontal space between cells
    "vspace" : 0, // vertical space between cells
    "maxLength"         : 15, //displayed as y-axis (-1 for all)
    "charSet"           : "alphaNum", //display as y-axis
    "colourSet"         : "YlGn",
    "impossibleCells"   : "grey",
    "colourMode"        : "inverseAlpha",
    "alpha"             : 2.5,
    "axisOrder"         : "alphabetical",//Order axis by frequency or by alphabetical
    "axisWord" : "", //To add a word in the axis, for example if axisWord = password, the axiswill be paswordbcefghijklmnqrtuvxyz

};
var options = {
    "tableSize"          : {
        "min"            : 5,
        "max"            : 20,
    },
    "charSet"            : {
        "lowAlpha"       : "abcdefghijklmnopqrstuvwxyz",
        "highAlhpa"      : "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "alpha"          : "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "num"            : "0123456789",
        "lowAlphaNum"    : "0123456789abcdefghijklmnopqrstuvwxyz",
        "symbols"        : "! \"£$%^&*()_+-=[]{};'#:@~,.\\/<>?\|`¬",
        "alphaNum"       : "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "alphaNumSymbol" : "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ! \"£$%^&*()_+-=[]{};'#:@~,.\\/<>?\|`¬",
        "lowHighCompare": "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz",
        "vowelsConsonantsalpha" : "aeiouybcdfghjklmnpqrstvwxzAEIOUYBCDFGHJKLMNPQRSTVWXZ",
        "vowelsConsonantsLow" : "aeiouybcdfghjklmnpqrstvwxz",
        "vowelsConsonantsHigh" : "AEIOUYBCDFGHJKLMNPQRSTVWXZ",

    },
    "colourSet"        : {
        "YlGn"           :["#ffffcc","#c2e699","#78c679","#31a354","#006837"],
        "YlGnBu"         :["#ffffcc","#a1dab4","#41b6c4","#2c7fb8","#253494"],
        "GnBu"           :["#f0f9e8","#bae4bc","#7bccc4","#43a2ca","#0868ac"],
        "BuGn"           :["#edf8fb","#b2e2e2","#66c2a4","#2ca25f","#006d2c"],
        "PuBuGn"         :["#f6eff7","#bdc9e1","#67a9cf","#1c9099","#016c59"],
        "PuBu"           :["#f1eef6","#bdc9e1","#74a9cf","#2b8cbe","#045a8d"],
        "BuPu"           :["#edf8fb","#b3cde3","#8c96c6","#8856a7","#810f7c"],
        "RdPu"           :["#feebe2","#fbb4b9","#f768a1","#c51b8a","#7a0177"],
        "PuRd"           :["#f1eef6","#d7b5d8","#df65b0","#dd1c77","#980043"],
        "OrRd"           :["#fef0d9","#fdcc8a","#fc8d59","#e34a33","#b30000"],
        "YlOrRd"         :["#ffffb2","#fecc5c","#fd8d3c","#f03b20","#bd0026"],
        "YlOrBr"         :["#ffffd4","#fed98e","#fe9929","#d95f0e","#993404"],
        "Purples"        :["#f2f0f7","#cbc9e2","#9e9ac8","#756bb1","#54278f"],
        "Blues"          :["#eff3ff","#bdd7e7","#6baed6","#3182bd","#08519c"],
        "Greens"         :["#edf8e9","#bae4b3","#74c476","#31a354","#006d2c"],
        "Oranges"        :["#feedde","#fdbe85","#fd8d3c","#e6550d","#a63603"],
        "Reds"           :["#fee5d9","#fcae91","#fb6a4a","#de2d26","#a50f15"],
        "Greys"          :["#f7f7f7","#cccccc","#969696","#636363","#252525"],
        "PuOr"           :["#e66101","#fdb863","#f7f7f7","#b2abd2","#5e3c99"],
        "BrBG"           :["#a6611a","#dfc27d","#f5f5f5","#80cdc1","#018571"],
        "PRGn"           :["#7b3294","#c2a5cf","#f7f7f7","#a6dba0","#008837"],
        "PiYG"           :["#d01c8b","#f1b6da","#f7f7f7","#b8e186","#4dac26"],
        "RdBu"           :["#ca0020","#f4a582","#f7f7f7","#92c5de","#0571b0"],
        "RdGy"           :["#ca0020","#f4a582","#ffffff","#bababa","#404040"],
        "RdYlBu"         :["#d7191c","#fdae61","#ffffbf","#abd9e9","#2c7bb6"],
        "Spectral"       :["#d7191c","#fdae61","#ffffbf","#abdda4","#2b83ba"],
        "RdYlGn"         :["#d7191c","#fdae61","#ffffbf","#a6d96a","#1a9641"],
        "Accent"         :["#7fc97f","#beaed4","#fdc086","#ffff99","#386cb0"],
        "Dark2"          :["#1b9e77","#d95f02","#7570b3","#e7298a","#66a61e"],
        "Paired"         :["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99"],
        "Pastel1"        :["#fbb4ae","#b3cde3","#ccebc5","#decbe4","#fed9a6"],
        "Pastel2"        :["#b3e2cd","#fdcdac","#cbd5e8","#f4cae4","#e6f5c9"],
        "Set1"           :["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00"],
        "Set2"           :["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854"],
        "Set3"           :["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3"]
    },
    "impossibleCells"    : {
        "blue"           : 'Blue',
        "green"          : 'Green',
        "grey"           : 'Grey',
        "orange"         : 'Orange',
        "white"          : 'White',
    },
    "colourMode"         : {
        "linear"         : 'Linear',
        "alpha"          : 'x^alpha',
        "inverseAlpha"   : 'x^(1/alpha)',
    },
    "axisOrder"          : {
        "alphabetical"   : "Alphabetical",
        "frequency"      : "Frequency",
    },
    "alpha"              : {
        "min"            : 1,
        "max"            : 10,
        "step"           : 0.1,
    },
    "maxLength"          : {
        "min"            : -1,
        "max"            : 60,
        "step"           : 1,
    },
    "flipy"              : "false",
};