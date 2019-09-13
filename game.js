'use strict';

let timerID; //ID of Interval (set/clear) functions. Global to stop timer from any function.
let clickCounter = 0; //Global click counter. Global to reset timer which starts with a first click.

setValues();
game();
restartGame();

/**
 * Function randomly sets values to the cards.
 */

function setValues() {

    let symbolsCounter = {
        'symbols': ['🐵', '🦄', '🦀', '🐟', '🐸', '🐰'],
        'counters': [0, 0, 0, 0, 0, 0]
    };

    let cardValues = Array.from(document.querySelectorAll('.back'));

    cardValues.forEach(cardValue => {

        //Get random value in range from 0 to 5 including.
        let randomValue = getRandomInt(0,5);

        //Find symbol which hasn't been already used and it's place in array more than random value.
        let symbolIndex = symbolsCounter.counters.findIndex((counter,index) => (counter < 2 && index >= randomValue));

        //If there're no any symbols left with it's place more than random value then just find any not used before.
        if (symbolIndex === -1)
            symbolIndex = symbolsCounter.counters.findIndex(counter => counter < 2);

        //Assign symbol to the card.
        cardValue.textContent = symbolsCounter.symbols[symbolIndex];

        //Increase counter of used symbols.
        symbolsCounter.counters[symbolIndex]++;

    });

}

/**
 * Function adds class flip if click happened on front side (class 'front') of card (class 'card') and removes class flip
 * if click happened on back side (class 'back'). Flip class add rotation to 'front' and 'back' children.
 * If 2 cards open it checks them, if 3 cards open it flips back 2 first ones if they are not equal.
 */
function game() {

    //Get all the elements represents cards' fronts and backs.
    let cards = Array.from(document.querySelectorAll('.card'));

    //Set event to turn the card on click.
    cards.forEach(field =>
        field.addEventListener('click', function(event) {

            //Stop further event processing. Just in case.
            event.stopPropagation();

            //We count every click.
            clickCounter++;

            //Start timer if it's first click.
            if (clickCounter === 1) timerID = setInterval(timer, 1000);

            //If there are 3 open cards fli[ back previous 2.
            if ((clickCounter % 2 === 1) && clickCounter > 2) flipCardsBack(cards);

            //Flip the card by adding or removing class 'flip'.
            field.classList.toggle('flip');

            //If 2 cards open check if they have the same value.
            if (clickCounter % 2 === 0) setTimeout(() => checkCards(cards), 400);

        })
    );
}

/**
 * Function flips back cards if they are not equal or just one card.
 * @param cards
 */

function flipCardsBack(cards) {

    //Filter only opened and not correct cards.
    let filteredCards = cards.filter(field => (field.classList.contains('flip') && !field.classList.contains('correct')));

    // Flip back result.
    filteredCards.forEach(field => field.classList.remove('flip'));

    //Remove results of check from back sides of cards.
    filteredCards.forEach(field => {
        field.classList.remove('wrong');
    })
}

/**
 * Function checks if values of 2 flipped cards are equal and sets correct classes ('correct' or 'wrong'). In case if
 * values are equal it also adds event to back child to stop further propagation of click events to leave cards opened.
 * @param {Array} cards
 */

function checkCards(cards) {

    //Lets operate only with opened cards and ones which don't guessed already.
    let filteredCards = cards.filter(field => (field.classList.contains('flip') && !field.classList.contains('correct')));

    //Check if there are only a couple of cards.
    if (filteredCards.length === 2)

        //Check if content the same.
        if (filteredCards[0].textContent === filteredCards[1].textContent) {

            filteredCards.forEach(field => {

                //For each add 'correct' class.
                field.classList.add('correct');

                //For children with class 'back' add event listener on click which prevents further propagation.
                let backs = Array.from(field.children);
                backs = backs.filter(back => back.classList.contains('back'));

                backs.forEach(back =>
                    back.addEventListener('click', function (event) {
                        event.stopPropagation();
                    })
                )

            });

            checkAllCards(cards);
        }

        //If content does not the same the  just add 'wrong' class.
        else
            filteredCards.forEach(field => field.classList.add('wrong'));
}

/**
 * Function returns random integer between min and max inclusive.
 * @param {Number} min
 * @param {Number} max
 * @returns {Number}
 */

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Function implements a timer from 01:00 to 00:00.
 */
function timer() {

    //Get timer element.
    let timer = document.querySelector('.time');

    //If timer is exceeded stop it.
    if (timer.textContent === '00:00') {
        document.getElementById('lose-message').classList.add('message-on');
        clearInterval(timerID);
        return;
    }

    //Parse timer text value.
    let parts = timer.textContent.match(/^(\d{1,2}):(\d{1,2})$/);

    //Decrease value for 1 second and set it to timer back.
    if (parts[1] === '00') {
        let newTime = parseInt(parts[2])-1;
        if (newTime < 10) newTime = '0' + newTime;
        timer.textContent = '00:'+ newTime;
    }
        else if (parts[1] === '01') timer.textContent = '00:59';
}

/**
 * Functions checks if all of the cards are correctly guessed by checking class 'correct', shows the winning message
 * if this is true and stops timer.
 * @param {Array} cards
 */

function checkAllCards(cards) {

    //Check if each card has class 'correct'.
    if (cards.every(field => field.classList.contains('correct'))) {

        //Add class 'message-on' to display winning message.
        document.getElementById('win-message').classList.add('message-on');

        //Stop timer.
        clearInterval(timerID);
    }
}

/**
 * Function restarts game within click on restart button.
 */
function restartGame() {

    let restartButtons = document.querySelectorAll('.restart-button');

    //For 2 buttons (lose and win message) restart game.
    restartButtons.forEach(button => {
        button.addEventListener('click', function(event) {

            //Remove all results (added classes) from cards.
            removeResults();

            //Set new random values to the cards.
            setValues();

            //Disable win/lose message.
            document.getElementById('win-message').classList.remove('message-on');
            document.getElementById('lose-message').classList.remove('message-on');

            //Set timer back to 1 minute.
            document.querySelector('.time').textContent = '01:00';
        })
    })
}

/**
 * Function removes all results from cards and flips them back.
 */
function removeResults() {

    //Get all cards.
    let cards = Array.from(document.querySelectorAll('.card'));

    //Flip back each card and remove all the previous results.
    cards.forEach(card => {
        card.classList.remove('flip');
        card.classList.remove('correct');
        card.classList.remove('wrong');
        clickCounter = 0;
    });
}