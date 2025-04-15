import { WORDS } from "./words.js";

const backImageArry = [
'../images/backgrounds/background1.png',
'../images/backgrounds/background2.png',
'../images/backgrounds/background3.jpg',
'../images/backgrounds/background4.jpg',
'../images/backgrounds/background5.jpg',
'../images/backgrounds/background6.jpg',
'../images/backgrounds/background7.jpg',
'../images/backgrounds/background8.jpg',
'../images/backgrounds/background9.jpg',
'../images/backgrounds/background10.jpg',
'../images/backgrounds/background11.jpg',
'../images/backgrounds/background12.jpg',
'../images/backgrounds/background13.png',
'../images/backgrounds/background14.jpg',
'../images/backgrounds/background15.jpg'];


const NUMBER_OF_GUESSES = 8;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;
let rightGuessString = "";
let allGuesses = [];
let allWordGuesses = [];
var now = new Date();
var fullDaysSinceEpoch = Math.floor(now / 8.64e7);

var stewsbd = new Date('2025-04-15');
var owenDay = Math.floor(stewsbd / 8.64e7);
console.log("owen day="+owenDay.toString()+" current:"+fullDaysSinceEpoch.toString());

var day0forGame = owenDay;
var daySinceGameStart = fullDaysSinceEpoch -day0forGame;
let indexForTodaysWord = daySinceGameStart % WORDS.length;
console.log("day=" + daySinceGameStart.toString() + " index=" + indexForTodaysWord.toString());
if(indexForTodaysWord>=0)
	rightGuessString = WORDS[indexForTodaysWord];
console.log(rightGuessString);
let succeeded = false;

let highestStreak = 0;
let currentStreak = 0;
let lastSuccessDay = 0;
let totalWins = 0;
let totalDaysAttempted = 0;

let guessOn = [0,0,0,0,0,0,0,0];
var correctGuessIndex = -1;

const zeroPad = (num, places) => String(num).padStart(places, '0')

const varAllGuesses = "hod_allWordGuesses";
const varCurrentStreak ="hod_currentStreak";
const varLastSuccess = "hod_lastSuccessDay";
const varHighestStreak = "hod_highestStreak";
const varTotalWins = "hod_totalWins";
const varTotalDays = "hod_totalDaysAttempted";
const varCurrentCorrectIndex = "hod_currentCorrectIndex";
const varGuessOn = "hod_guessOn_";
const varIndexForToday = "hod_indexForTodaysWord";

function initBoard() {
    let board = document.getElementById("game-board");

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div");
        row.className = "letter-row";

        for (let j = 0; j < rightGuessString.length; j++) {
            let box = document.createElement("div");
            if (isSpecialCharacter(rightGuessString[j])) {
                box.className = "space-box";
                box.textContent = rightGuessString[j];
            }
            else
                box.className = "letter-box";

            row.appendChild(box);
        }

        board.appendChild(row);
    }
}

function isSpecialCharacter(c) {
    return " -'/.".includes(c);
}

function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
			let oldColor = elem.style.backgroundColor;
            if (oldColor === "green") {
                return;
            }

            if (oldColor === "orange" && color !== "green") {
                return;
            }

            if (color === "green" || color === "gray")
                elem.style.color = "white";            

            elem.style.backgroundColor = color;
            break;
        }
    }
}


function deleteLetter() {
    let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
    let box = row.children[nextLetter - 1];
    box.textContent = "";
    box.classList.remove("filled-box");
    currentGuess.pop();
    nextLetter -= 1;

    // this only handles single special characters - if there were two together we would need to make this a loop
    if (isSpecialCharacter(rightGuessString[nextLetter])) {
        console.log('delete special one!');
        let box = row.children[nextLetter - 1];
        box.textContent = "";
        box.classList.remove("filled-box");
        currentGuess.pop();
        nextLetter -= 1;
    }
}

String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

function replaceAtIndex(guess,index,replacement)
{
    var newGuess =[];
    for(let i=0;i<guess.length;i++)
    {
        if(i==index)
            newGuess.push(replacement);
        else newGuess.push(guess[i]);
    }

    return newGuess;
}

// change to check guess (index)
function checkGuess(rowIndex) {
    let row = document.getElementsByClassName("letter-row")[rowIndex];
    let guessString = "";
    let rightGuess = Array.from(rightGuessString);
    for (const val of currentGuess) {
        guessString += val;
    }

    if (guessString.length != rightGuessString.length) {
        toastr.error("Not enough letters!");
        return;
    }
    allWordGuesses.push(guessString);

    var letterColor = [];
    for (let lc = 0; lc < rightGuessString.length; lc++)
        letterColor.push("gray");

    // check green
    for (let i = 0; i < rightGuessString.length; i++) {
        if (rightGuess[i] === currentGuess[i]) {
            letterColor[i] = "green";
            rightGuess[i] = "#";
            currentGuess = replaceAtIndex(currentGuess, i, "#");
        }
    }

    //check yellow
    //checking guess letters
    for (let guessIndex = 0; guessIndex < currentGuess.length; guessIndex++) {
        for (let answerIndex = 0; answerIndex < rightGuess.length; answerIndex++) {
            if (letterColor[answerIndex] == "green")
                continue;
            if (rightGuess[answerIndex] === "#")
                continue;
            if (rightGuess[answerIndex] === currentGuess[guessIndex]) {
                letterColor[guessIndex] = "orange";
                rightGuess[answerIndex] = "#";

                currentGuess = replaceAtIndex(currentGuess, guessIndex, "#");
                continue;

            }
        }
    }

    // Build colour boxes for share data
    let colorBoxes = [];
    for (let i = 0; i < letterColor.length; i++) {
        if (isSpecialCharacter(rightGuessString[i]))
            colorBoxes.push(rightGuessString[i]);
        else {
            if (letterColor[i] === "green")
                colorBoxes.push("🟩");
            else if (letterColor[i] === "orange")
                colorBoxes.push("🟨");
            else
                colorBoxes.push("⬛");
        }
    }

    allGuesses.push(colorBoxes);

    for (let i = 0; i < rightGuessString.length; i++) 
	{
        if (isSpecialCharacter(rightGuessString[i])) continue;
        let box = row.children[i];
        let delay = 125 * i;
        setTimeout(() => {
            //flip box
            animateCSS(box, "flipInX");
            //shade box
            box.style.backgroundColor = letterColor[i];
            shadeKeyBoard(guessString.charAt(i) + "", letterColor[i]);
        }, delay);
    }

    if (guessString === rightGuessString) {
        succeeded = true;

        if (lastSuccessDay != indexForTodaysWord) {
			console.log("Guessed correct with guess#"+(NUMBER_OF_GUESSES-guessesRemaining).toString());
			correctGuessIndex = NUMBER_OF_GUESSES-guessesRemaining;
			guessOn[correctGuessIndex]++;
			
            // increase streak
            totalWins++;
            totalDaysAttempted++;
            currentStreak++;
            if (currentStreak > highestStreak)
                highestStreak = currentStreak;
            lastSuccessDay = indexForTodaysWord;
        }
		
		guessesRemaining = 0;

        showResult(rightGuessString);

        storeSession();
		
		updateChart();

        return;
    } else {
		hideChart();
        guessesRemaining -= 1;
        currentGuess = [];
        nextLetter = 0;


        if (guessesRemaining === 0) {

            totalDaysAttempted++;
            currentStreak = 0;

            showResult(rightGuessString);
        }

        storeSession();
    }
}

function hideChart()
{
	const ctx = document.getElementById('chartBox');
	ctx.style.display = "none";
}

function updateChart()
{
	const ctx = document.getElementById('myChart');
	var barColors = [];
	
	for(let i=0;i<NUMBER_OF_GUESSES;i++)
	{
		if(i===correctGuessIndex)
			barColors.push("green");
		else
			barColors.push("gray");
	}

	new Chart(ctx, {
		type: 'bar',
	
    data: {
      labels: ['1', '2', '3', '4', '5', '6','7','8'],
      datasets: [{
        label: '',
        data: guessOn,
		backgroundColor:barColors,
        borderWidth: 0,
		
      }]
    },
    options: {
		plugins: {
			legend: {
				display: false
			},
			 datalabels: {
                anchor: 'end', // Position of the labels (start, end, center, etc.)
                align: 'end', // Alignment of the labels (start, end, center, etc.)
                color: 'black', // Color of the labels
                font: {
                    weight: 'bold',
                },
                formatter: Math.round
                
            }
		},
		indexAxis:'y',
		scaleShowValues: true,
		 scales: {
			 x: {
        grid: {
          display: false,
        }
			 },
			 y: {
        grid: {
          display: false,
        }
			 }
    }
		
	}	
  });
  
  	const charBox = document.getElementById('chartBox');
	charBox.style.display = "block";
}

function showResult(correctWord) {
    if(succeeded)
    {
        document.getElementById("hodorFace").src = "images/hodor_happy.png";
        document.getElementById("myForm").style.backgroundColor = 'rgb(112, 216, 91)';         
        document.getElementById("resultLabel").innerText = "You guessed right! Current streak:"+currentStreak.toString();        
    }
    else
    {
        document.getElementById("hodorFace").src = "images/hodor_sad.png";
        document.getElementById("myForm").style.backgroundColor = 'rgb(247, 47, 40)'; 
        document.getElementById("resultLabel").innerText = "You've run out of guesses! Game over!";
    }

    document.getElementById("correctWord").innerText = correctWord;
    document.getElementById("myForm").style.display = "grid";
	
    updateStats();
}

function updateStats()
{
    let winperc = Math.floor((totalWins ) / (totalDaysAttempted) * 100);
    console.log("Perc:"+winperc.toString());
    if (isNaN(winperc))
        winperc = 0;
    (document.getElementById("game-stats")).innerText = "Attempts: " + totalDaysAttempted.toString() + "  Wins:" + totalWins.toString() + " (" + winperc.toString() + "%)";
try{
	document.getElementById("stat_played").innerText = totalDaysAttempted.toString();
	document.getElementById("stat_wonperc").innerText = winperc.toString();
	document.getElementById("stat_streak").innerText = currentStreak.toString();
	document.getElementById("stat_maxstreak").innerText = highestStreak.toString();
}
catch(err)
{
	document.getElementById("correctWord").innerText = err.message;
}

}

function insertLetter(pressedKey) {
    if (!((pressedKey.charCodeAt(0) >= 48 && pressedKey.charCodeAt(0) <= 57) || (pressedKey.charCodeAt(0) >= 97 && pressedKey.charCodeAt(0) <= 122))) {
        console.log('not valid character');
        return;
    }

    if (nextLetter === rightGuessString.length) {
        console.log("hit end of length of [" + rightGuessString + "] nextLetter=" + nextLetter.toString());
        return;
    }

    pressedKey = pressedKey.toLowerCase();

    let row = document.getElementsByClassName("letter-row")[NUMBER_OF_GUESSES - guessesRemaining];
    let box = row.children[nextLetter];
    animateCSS(box, "pulse");
    box.textContent = pressedKey;

    box.classList.add("filled-box");
    currentGuess.push(pressedKey);
    nextLetter += 1;
    if (isSpecialCharacter(rightGuessString[nextLetter])) {
        console.log("jumping over next character as it is special " + rightGuessString[nextLetter]);
        currentGuess.push(rightGuessString[nextLetter]);
        nextLetter += 1;
    }

    storeSession();
}

function storeSession() {
    
    localStorage.setItem(varAllGuesses, JSON.stringify(allWordGuesses));
    localStorage.setItem(varIndexForToday, JSON.stringify(indexForTodaysWord));

    localStorage.setItem(varCurrentStreak, JSON.stringify(currentStreak));
    localStorage.setItem(varLastSuccess, JSON.stringify(lastSuccessDay));
	
	localStorage.setItem(varHighestStreak, JSON.stringify(highestStreak));
	
	localStorage.setItem(varTotalWins, JSON.stringify(totalWins));
	localStorage.setItem(varTotalDays, JSON.stringify(totalDaysAttempted));
	for(let i=0;i<NUMBER_OF_GUESSES;i++)
	{
		localStorage.setItem(varGuessOn+(i+1).toString(), JSON.stringify(guessOn[i]));
	}
	
	localStorage.setItem(varCurrentCorrectIndex, JSON.stringify(correctGuessIndex));
}

const animateCSS = (element, animation, prefix = "animate__") =>
    // We create a Promise and return it
    new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`;
        // const node = document.querySelector(element);
        const node = element;
        node.style.setProperty("--animate-duration", "0.3s");

        node.classList.add(`${prefix}animated`, animationName);

        // When the animation ends, we clean the classes and resolve the Promise
        function handleAnimationEnd(event) {
            event.stopPropagation();
            node.classList.remove(`${prefix}animated`, animationName);
            resolve("Animation ended");
        }

        node.addEventListener("animationend", handleAnimationEnd, { once: true });
    });

document.addEventListener("keyup", (e) => {
    if (guessesRemaining === 0) {
        return;
    }

    let pressedKey = String(e.key);
    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter();
        return;
    }

    if (pressedKey === "Enter") {
        checkGuess(NUMBER_OF_GUESSES - guessesRemaining);
        return;
    }

    let found = pressedKey.match(/[a-z0-9]/gi);
    
    if (!found || found.length > 1) {
        return;
    } else {
        insertLetter(pressedKey);
    }
});

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target;

    if (!target.classList.contains("keyboard-button")) {
        return;
    }

    let key = target.textContent;

    if(target.id==="del-button")
    {
        console.log("delete!");
        key = "Backspace";
    }

    document.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
});

document.getElementById("Options-Row").addEventListener("click", (e) => {
    const target = e.target;
	if( target.classList.contains("history-button"))
	{
		console.log("show history");
		loadHistory();
		return;
	}
});

document.getElementById("myForm").addEventListener("click", (e) => {
    const target = e.target;
    console.log(target.classList);
    if (target.classList.contains("fa-close") ||
        target.classList.contains("close-btn")) {
        console.log("close!");
        document.getElementById("myForm").style.display = "none";
        return;
    }

    if (target.classList.contains("lookup-btn")) {
		const newURL = new URL("http://google.com/search");		
		newURL.searchParams.set("q", rightGuessString + " game of thrones");
		window.open(newURL, '_blank').focus();
        return;
    }

    if (!target.classList.contains("share-btn")) {
        return;
    }

    let textToShare = "Hodorle " + indexForTodaysWord.toString();
    if (succeeded) textToShare = textToShare + " " + allGuesses.length.toString() + "/"+NUMBER_OF_GUESSES+"\r\n";
    else textToShare = textToShare + " X/"+NUMBER_OF_GUESSES+"\r\n";
    for (let i = 0; i < allGuesses.length; i++) {
        for (let l = 0; l < allGuesses[i].length; l++) {
            textToShare = textToShare + allGuesses[i][l];
        }

        textToShare = textToShare + "\r\n";
    }

    console.log(textToShare);

    if (navigator.share) {
        navigator.share({
            text: textToShare,
            title: 'Hodorle result',
        }).then(() => {
            console.log('Thanks for sharing!');
        })
            .catch(console.error);
    } else {
        // fallback
    }

});

window.onload = function () {
	
	if( owenDay>fullDaysSinceEpoch)
	{
		console.log("no ready yet");
		(document.getElementById("game-number")).innerText = "Game starts on " + stewsbd;
		(document.getElementById("game-stats")).innerText ="";
		(document.getElementById("keyboard-cont")).style.display = "none";
		(document.getElementById("Options-Row")).style.display = "none";
		
		return;
	}

    const totalbackgrounds = 9; // 0-19
    console.log('background' + ((indexForTodaysWord + 52) % totalbackgrounds).toString());

    var urlstring = 'url(' + backImageArry[indexForTodaysWord%backImageArry.length]+')';
    
    console.log(urlstring);

    $('body').css('background-image', urlstring);

    let tempWordGuesses = JSON.parse(localStorage.getItem(varAllGuesses));
    currentStreak = JSON.parse(localStorage.getItem(varCurrentStreak,));
    lastSuccessDay = JSON.parse(localStorage.getItem(varLastSuccess));
    highestStreak = JSON.parse(localStorage.getItem(varHighestStreak,));
    totalWins = JSON.parse(localStorage.getItem(varTotalWins,));
    totalDaysAttempted = JSON.parse(localStorage.getItem(varTotalDays,));

	correctGuessIndex = JSON.parse(localStorage.getItem(varCurrentCorrectIndex,));
	
	for(let i=0;i<NUMBER_OF_GUESSES;i++)
	{
		guessOn[i] = JSON.parse(localStorage.getItem(varGuessOn+(i+1).toString()));
	}

    if (totalDaysAttempted === null) totalDaysAttempted = 0;
    if (totalWins === null) totalWins = 0;
    if (currentStreak === null) currentStreak = 0;
    if (lastSuccessDay === null) lastSuccessDay = 0;
    if (highestStreak === null) highestStreak = 0;

    if (!(indexForTodaysWord === 0 && lastSuccessDay === WORDS.length - 1) &&
        indexForTodaysWord - lastSuccessDay > 1) {
        console.log("Streak ended - not played for at least a day");
        currentStreak = 0;
    }

    if (tempWordGuesses === null || localStorage.getItem(varIndexForToday) != indexForTodaysWord) {
        console.log("resetting guess");
    }
    else {
        for (let i = 0; i < tempWordGuesses.length; i++) {
            let row = document.getElementsByClassName("letter-row")[i];
            currentGuess = tempWordGuesses[i];
            for (let l = 0; l < tempWordGuesses[i].length; l++) {
                let box = row.children[l];
                animateCSS(box, "pulse");
                box.textContent = tempWordGuesses[i][l];
                box.classList.add("filled-box");
            }

            checkGuess(NUMBER_OF_GUESSES - guessesRemaining);
        }
    }

    (document.getElementById("game-number")).innerText = "Game: " + indexForTodaysWord.toString() + " / " + WORDS.length.toString() + " Streak:" + currentStreak.toString() + " Best Streak:" + highestStreak.toString();
    updateStats();
}

initBoard();
