/**
 *
 */
var Heatmap = function (filename, semantic,state, parent) {
	var defaultState = function () {
		return {
			name: filename,
			wordCount: 0,
			charCount: 0,
			maxLength: 0,
			maxCharFreq: 0,
			uniqueCount: 0,
			removedWords: {},
			charSet: {},
			axisOrder: "alphabetical",
			position: {},
			parent: undefined,
			child: undefined,
			lang : "fr",
			isSemantic : semantic,
			semanticCharset : {"ADJ": 0,"ADV": 0,"INTJ": 0,"NOUN": 0,"PROPN": 0,"VERB": 0,"ADP": 0,"AUX": 0,"CONJ": 0,"CCONJ": 0,"DET": 0,"NUM": 0,"PART": 0,"PRON": 0,"SCONJ": 0,"PUNCT": 0,"SYM": 0, "UKN": 0},
			semanticPosition : {},
			semanticCharcount : 0,
			semanticFr : {},
			semanticDe : {},
			semanticEn : {},
		};
	};

	var state = state == undefined ? defaultState() : state;
	state.parent = parent == undefined ? undefined : parent;

	/**
	 * { password : frequency, ... }
	 */
	var buildHeatmap = function (rawData, append, order) {
		//Append to HM or reset
		if (append == false) state = defaultState();

		//stats
		for (pw in rawData) {
			rawData[pw] = rawData[pw];

			state.wordCount += rawData[pw];

			state.uniqueCount++;

			if (state.maxLength < pw.length) state.maxLength = pw.length;

			state.charCount += pw.length * rawData[pw];

			for (i = 0; i < pw.length; ++i) {
				state.charSet[pw[i]] == undefined
					? (state.charSet[pw[i]] = rawData[pw])
					: (state.charSet[pw[i]] += rawData[pw]);
			}
		}
		//Build this	
		for (i = 1; i <= state.maxLength; i++) {
			if (state.position[i] == undefined) {
				state.position[i] = {
					chars: {},
					words: {},
				};
			}

			for (c in state.charSet) {
				if (state.position[i].chars[c] == undefined) {
					state.position[i].chars[c] = 0;
				}
			}
		}

		//Populate this
		for (pw in rawData) {
			var len = pw.length;

			for (cpos = 0; cpos < pw.length; cpos++) {
				var pos = cpos + 1;
				var c = pw[cpos];

				//Character frequency
				state.position[pos].chars[c] += rawData[pw];

				//Max char freq
				if (state.maxCharFreq < state.position[pos].chars[c]) {
					state.maxCharFreq = state.position[pos].chars[c];
				}

				//Add word
				if (pos == len) {
					state.position[len].words[pw] = rawData[pw];
				}
			}
		}
		return this;
	};

	/**
	 *
	 */
	 var reOrderAxis = function (n, bool) {
		state.isSemantic = bool
		var child = new Heatmap(state.name, state.isSemantic, null, this);
		var words = getWords();
		child.isSemantic = state.isSemantic
		child.lang = state.lang
		child.buildHeatmap(words);
		child.setSemantic(getSemantic(), state.lang)
		child.axisOrder = n;

		state.child = child;
		return child;
	};

	/**
	 *
	 */
	 var getHeatmapWords = function () {
		return state.getWords();
	};

	/**
	 *
	 */
	var filterPin = function (n) {
		var child = new Heatmap(state.name,state.isSemantic, null, this);

		//user defined pin length or default 4
		var n = n == undefined ? 4 : n;

		var pttn = new RegExp("^[\\d]{" + n + "}$");
		var words = getWordsOfLength(n);

		for (var key in words) {
			if (!pttn.test(key)) delete words[key];
		}

		child.buildHeatmap(words);

		state.child = child;
		return child;
	};

	/**
	 *
	 */
	var filterDate = function (pttn) {
		var child = new Heatmap(state.name,state.isSemantic, null, this);

		var words = getWords();

		if (pttn == undefined) {
			for (var key in words) {
				if (Date.parse(key) == null) delete words[key];
			}
		} else {
			for (var key in words) {
				if (Date.parseExact(key, pttn) == null) delete words[key];
			}
		}

		child.buildHeatmap(words);

		state.child = child;
		return child;
	};

	/**
	 *
	 */
	var filterThoseIncluding = function (arr) {
		var child = new Heatmap(state.name,state.isSemantic, null, this);

		arr.forEach(function (w) {
			child.buildHeatmap(getWordsIncluding(w));
		});

		state.child = child;
		return child;
	};

	/**
	 * Remove a list of words from a clone of this heatmap, set as child.
	 * @return Return child heatmap
	 */
	var removeWords = function (wArr, matchWord) {
		var child = new Heatmap(state.name,state.isSemantic, null, this);
		child.buildHeatmap(getWords());
		state.child = child;

		out(child);
		for (var i = 0; i < wArr.length; i++) {
			var w = wArr[i];
			child.removeWord(w);
		}

		child.calculateStats();

		return child;
	};

	/**
	 * Remove word from Heatmap, add it to removedWords for safe keeping.
	 * @return 1 for successful removal, 0 for not found
	 */
	var removeWord = function (w, matchWord) {
		//Check word exists in this heatmap
		if (state.position[w.length] == undefined) {
			return 0;
		} else if (state.position[w.length].words[w] == undefined) {
			return 0;
		}

		//Add removed word to removedWords
		state.removedWords[w] = state.position[w.length].words[w];

		//Delete word from heatmap
		delete state.position[w.length].words[w];
		return 1;
	};

	/**
	 * Add a list of words inc frequency to this heatmap
	 * wObj format: {word : frequency}
	 */
	var addWords = function (wObj) {
		buildHeatmap(wObj, true); //Append words to this heatmap

		//Remove object from removed words list
		for (key in wObj) {
			delete state.removedWords[key];
		}
	};

	/**
	 * Recalculate stats for this heatmap
	 */
	var calculateStats = function () {
		var rawData = getWords();

		//Reset stats
		state.wordCount = 0;
		state.charCount = 0;
		state.maxLength = 0;
		state.maxCharFreq = 0;
		state.uniqueCount = 0;
		for (c in state.charSet) state.charSet[c] = 0;
		for (pos in state.position) {
			for (c in state.position[pos].chars) {
				state.position[pos].chars[c] = 0;
			}
		}

		//Calculate stats
		for (pw in rawData) {
			//Word count
			state.wordCount += rawData[pw];

			//Unique word count
			state.uniqueCount++;

			//Max length
			if (state.maxLength < pw.length) state.maxLength = pw.length;

			//Character count
			state.charCount += pw.length * rawData[pw];

			//For every char in the word
			for (cpos = 0; cpos < pw.length; cpos++) {
				var pos = cpos + 1;
				var c = pw[cpos];

				//Character frequency
				state.charSet[c] == undefined
					? (state.charSet[c] = rawData[pw])
					: (state.charSet[c] += rawData[pw]);

				//Character at position frequency
				state.position[pos].chars[c] += rawData[pw];

				//Max character freq
				if (state.maxCharFreq < state.position[pos].chars[c]) {
					state.maxCharFreq = state.position[pos].chars[c];
				}
			}
		}

		return this;
	};

	/**
	 * Get {word:frequency} array of all words contained in this Heatmap
	 * @return Object dictionary of word objects
	 */
	var getWords = function () {
		return getWordsOfLength(1, state.maxLength);
	};

	/**
	 * Get {word:frequency} array of all words using the following rules:
	 *   Returns words of length n
	 *   Returns words of length n to m
	 * @return Object dictionary of word objects
	 */
	var getWordsOfLength = function (n, m) {
		var words = {};

		if (m == undefined) {
			words = state.position[n].words;
		} else {
			//For each position
			for (i = n; i <= m; i++) {
				//For each word add it and its freq
				for (w in state.position[i].words) {
					var wfreq = state.position[i].words[w];
					if (words[w] == undefined) {
						words[w] = wfreq;
					} else {
						words[w] += wfreq;
					}
				}
			}
		}

		return words;
	};

	/**
	 * Get {word:frequency} array of words including the string x
	 * @return list of objects {key:value}
	 */
	var getWordsIncluding = function (x) {
		var wordList = {};

		//For each length
		for (i = x.length; i <= state.maxLength; i++) {
			//For every password of length i
			var words = getWordsOfLength(i);
			for (word in words) {
				//Add word if words includes x
				if (word.includes(x)) {
					var freq = words[word];
					wordList[word] = freq;
				}
			}
		}

		return wordList;
	};

	/**
	 * @return this state
	 */
	var getState = function () {
		return state;
	};

	/**
	 * @return this states child heatmap
	 */
	var getChild = function () {
		return state.child;
	};

	/**
	 * @return French Semantic heatmap
	 */
	 var getSemantic = function () {
		if (state.lang == 'fr')
			return state.semanticFr;
		if (state.lang == 'de')
			return state.semanticDe;
		if (state.lang == 'en')
			return state.semanticEn;
	};

	/**
	 * @set French Semantic heatmap
	 */
	 var setSemantic = function (data, lang) {
		state.lang = lang
		if (lang == 'fr')
		{
		state.semanticFr = data;
		}
		if (lang == 'de') {
			state.semanticDe = data;
		}
		if (lang == 'en') {
			state.semanticEn = data;
		}
		// 1 , [[Noun], 1]
		//stats
		for (pw in data) {
			if (state.maxLength < data[pw][0].length) state.maxLength = data[pw][0].length;

			state.semanticCharcount += data[pw][0].length * data[pw][1];

			for (i = 0; i < data[pw][0].length; ++i) {
				state.semanticCharset[data[pw][0][i]] == undefined
					? (state.semanticCharset[data[pw][0][i]] = data[pw][1])
					: (state.semanticCharset[data[pw][0][i]] += data[pw][1]);
			}
		}
		//Build this
		for (i = 1; i <= state.maxLength; i++) {
			if (state.semanticPosition[i] == undefined) {
				state.semanticPosition[i] = {
					chars: {},
					words: {},
				};
			}

			for (c in state.semanticCharset) {
				if (state.semanticPosition[i].chars[c] == undefined) {
					state.semanticPosition[i].chars[c] = 0;
				}
			}
		}
		//Populate this
		for (pw in data) {
			var len = data[pw][0].length;

			for (cpos = 0; cpos < data[pw][0].length; cpos++) {
				var pos = cpos + 1;
				var c = data[pw][0][cpos];

				//Character frequency
				state.semanticPosition[pos].chars[c] += data[pw][1];

				//Max char freq
				if (state.maxCharFreq < state.position[pos].chars[c]) {
					state.maxCharFreq = state.semanticPosition[pos].chars[c];
				}

				//Add word
				if (pos == len) {
					state.semanticPosition[len].words[pw] = data[pw][0];
				}
			}
		}
	};

	/**
	 * @return this states parent heatmap
	 */
	var getParent = function () {
		return state.parent;
	};

	/**
	 * Get this heatmaps character set ordered alphabetically
	 * @return Ordered character array
	 */
	var getCharSetOrderByAlphabet = function () {
		var charSet = state.charSet;
		var orderedKeys = [];
		var charSetArr = [];

		orderedKeys = Object.keys(state.charSet).sort();

		for (var i = 0; i < orderedKeys.length; i++) {
			var c = orderedKeys[i];
			var cfreq = charSet[c];
			charSetArr.push({ [c]: cfreq });
		}

		return charSetArr;
	};

	/**
	 * Get this heatmaps character set ordered by their frequency
	 * @return Ordered character array by frequency
	 */
	var getCharSetOrderByFrequency = function () {
		var charSet = state.charSet;
		var orderedKeys = [];
		var charSetArr = [];

		orderedKeys = Object.keys(state.charSet).sort(function (a, b) {
			return state.charSet[a] - state.charSet[b];
		});

		for (var i = 0; i < orderedKeys.length; i++) {
			var c = orderedKeys[i];
			var cfreq = charSet[c];
			charSetArr.push({ [c]: cfreq });
		}

		return charSetArr.reverse();
	};

	/**
	 * Get this heatmaps word set ordered alphabetically
	 * @return Ordered character array
	 */
	var getWordsOrderByAlphabet = function () {
		var words = getWords();
		var orderedKeys = [];
		var wordsArr = [];

		orderedKeys = Object.keys(words).sort();

		for (var i = 0; i < orderedKeys.length; i++) {
			var w = orderedKeys[i];
			var wfreq = words[w];
			wordsArr.push({ [w]: wfreq });
		}

		return wordsArr;
	};

	/**
	 * Get this heatmaps word set ordered by its frequency
	 * @return Ordered character array by frequency
	 */
	var getWordsOrderByFrequency = function () {
		var words = getWords();
		var orderedKeys = [];
		var wordsArr = [];

		orderedKeys = Object.keys(words).sort(function (a, b) {
			return words[a] - words[b];
		});

		for (var i = 0; i < orderedKeys.length; i++) {
			var w = orderedKeys[i];
			var wfreq = words[w];
			wordsArr.push({ [w]: wfreq });
		}

		return wordsArr.reverse();
	};

	var getRemovedWords = function () {
		return state.removedWords;
	};

	var getName = function () {
		return state.name;
	}
	/**
	 * Revealing objects and functions
	 */
	return {
		buildHeatmap: buildHeatmap,
		calculateStats: calculateStats,
		
		getHeatmapWords:getHeatmapWords,
		reOrderAxis: reOrderAxis,
		filterPin: filterPin,
		filterDate: filterDate,
		filterThoseIncluding: filterThoseIncluding,

		//addWords    : addWords, // NOT GOOD, Can simply use buildHeatmap(data, append==true)
		removeWord: removeWord,
		removeWords: removeWords,

		getState: getState,
		getChild: getChild,
		getParent: getParent,

		getWords: getWords,
		getWordsOfLength: getWordsOfLength,
		getWordsIncluding: getWordsIncluding,
		getRemovedWords: getRemovedWords,
		getName: getName,

		getSemantic : getSemantic,

		setSemantic : setSemantic,


		getCharSetOrderByAlphabet: getCharSetOrderByAlphabet,
		getCharSetOrderByFrequency: getCharSetOrderByFrequency,
		getWordsOrderByAlphabet: getWordsOrderByAlphabet,
		getWordsOrderByFrequency: getWordsOrderByFrequency,
	};
};

/**
 * Testing
 * NOTE REMOVE WORDS FUNCTION CHANGED TO REMOVE WORDS AND RETURN CHILD, SOME TESTS WILL FAIL...
 */
// var hm = new Heatmap("testfile.txt", null, null);
// var rawData = {"20 Feb": 1 , "02 June 1993": 2, "1234": 5786, "2000": 2550,  "12345": 4523,  "111111": 2570,  "123456": 25969,  "696969": 3345,  "1234567": 2479,  "12345678": 8667,  "password": 32027,  "qwerty": 5455,  "dragon": 4321,  "pussy": 3945,  "baseball": 3739,  "football": 3682,  "letmein": 3536,  "monkey": 3487,  "abc123": 3310,  "mustang": 3289,  "michael": 3249,  "shadow": 3209,  "master": 3182,  "jennifer": 2581,  "jordan": 2538,  "superman": 2523,  "harley": 2485,  "fuckme": 2378};
// (function() {
// out('=================START HEATMAP TESTING========================');

// out('\n'+'getState()')
// out(hm.getState())

// out('\n'+'buildHeatmap(rawData')
// out(hm.buildHeatmap(rawData))

// out('\n'+'getWordsOfLength(5)')
// out(hm.getWordsOfLength(5))

// out('\n'+'getWordsOfLength(7,8)')
// out(hm.getWordsOfLength(7,8))

// out('\n'+'getWordsIncluding(12345)')
// out(hm.getWordsIncluding('12345'))

// var childHM = new Heatmap('childhm', null, hm);
// var words   = hm.getWordsIncluding('12345');

// out('\n'+'child.getState()')
// out(childHM.getState());

// out('\n'+'child.getState().parent.getState()')
// out(childHM.getState().parent.getState());

// out('\n'+'child.buildHeatmap(words)')
// out(childHM.buildHeatmap(words));

// out('\n'+'child.getWords()')
// out(childHM.getWords());

// out('\n'+'child.getCharSetOrderByAlphabet()')
// out(childHM.getCharSetOrderByAlphabet());

// out('\n'+'child.getCharSetOrderByFrequency()')
// out(childHM.getCharSetOrderByFrequency());

// out('\n'+'filterPin(4).getWords()');
// out(hm.filterPin(4).getWords());

// out('\n'+'filterPin(4).getParent().getWords()');
// out(hm.filterPin(4).getParent().getWords());

// out('\n'+'filterDate().getWords()');
// out(hm.filterDate().getWords());

// out('\n'+'filterDate(["dd MMMM yyyy", "yyyy", "dd MMMM"]).getWords()');
// out(hm.filterDate(["dd MMMM yyyy", "yyyy", "dd MMMM"]).getWords());

// out('\n'+'filterThoseIncluding(["12345", "2000", "dragon"]).getWords()');
// out(hm.filterThoseIncluding(["12345", "2000", "dragon"]).getWords());

// out('\n'+'filterThoseIncluding("abcd".split("").getWords()');
// out(hm.filterThoseIncluding("abcd".split("")).getWords());

// out('\n'+'getWordsOrderByAlphabet().slice(0,3)');
// out(hm.getWordsOrderByAlphabet().slice(0,3),true);

// out('\n'+'getWordsOrderByFrequency().slice(0,3)');
// out(hm.getWordsOrderByFrequency().slice(0,3),true);

// out('\n'+'getCharSetOrderByAlphabet().slice(0,3)');
// out(hm.getCharSetOrderByAlphabet().slice(0,3),true);

// out('\n'+'getCharSetOrderByFrequency().slice(0,3)');
// out(hm.getCharSetOrderByFrequency().slice(0,3),true);

// out('\n'+'removeWords("1234")');
// out(hm.getState());
// out(hm.removeWords("1234"));
// out(hm.getState());

// out('\n'+'removeWords(["02 June 1993", "password", "notInList"])');
// out(hm.removeWords(["02 June 1993", "password", "notInList"]));
// out(hm.getState());

// out('\n'+'getRemovedWords()');
// out(hm.getRemovedWords(), true);

// out('\n'+'addWords({"1234" : 5786})');
// hm.addWords( {"1234" : 5786} );
// out(hm.getState());
// out(hm.getRemovedWords(), true);

// out('\n'+'addWords( getRemovedWords() )');
// hm.addWords(hm.getRemovedWords());
// out(hm.getState());
// out(hm.getRemovedWords(), true);

// out('=================END HEATMAP TESTING========================')
// })();
