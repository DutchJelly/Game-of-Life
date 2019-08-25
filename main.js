
const BOXSIZE = 10;
const WIDTH = 100;
const HEIGHT = 50;

var game;
var runningTimer;

function start(){
    if(game.isRunning) return;
    game.isRunning = true;
    runningTimer = setInterval(function(){
        game.displayNext();
    }, 40);
}

function stop(){
    if(!game.isRunning) return;
    game.isRunning = false;
    clearInterval(runningTimer);
}

function reset(){
    if(game.isRunning)
        stop();
    game.resetAll();
}

function onLoad(){
    game = new GameOfLife(WIDTH, HEIGHT, BOXSIZE);
    game.initDomFields();
}

class GameOfLife{


    constructor(_width, _height, _boxSize){
        this.width = _width;
        this.height = _height;
        this.boxSize = _boxSize;
        this.isRunning = false;
        this.elements = new Array();
    }

    initDomFields(){

        var container = document.getElementById("container");
        container.addEventListener('contextmenu', event => event.preventDefault());
        this.elements = new Array();
        var templateColumnsString = "";
        var templateRowsString = "";
        for(var i = 0; i < this.height; i++){
            templateRowsString += this.boxSize + "px ";
            var row = new Array();
            for(var j = 0; j < this.width; j++){
                if(i === 0)
                    templateColumnsString += this.boxSize + "px ";
                var pixel = new GamePixel(j, i);
                var pixelDiv = pixel.getDOMElement();
                container.appendChild(pixelDiv);
                pixelDiv.onclick = e => this.elementClicked(e.toElement);
                pixelDiv.addEventListener("mouseover", (e) => {
                    if(e.buttons == 1 || e.buttons == 3){
                        this.elementClicked(e.toElement);
                    }
                        
                });
                pixelDiv.onmousedown = e => e.preventDefault();
                row[j] = pixel;
            }
            this.elements[i] = row;
        }
        container.style.gridTemplateColumns = templateColumnsString;
        container.style.gridTemplateRows = templateRowsString;
    }

    ensureState(element, newState){
        if(this.isRunning) return;
        this.elements.forEach(function(ar){
            ar.filter(e => {
                if(e.isSimilarElement(element))
                    e.state = newState
                    e.futureState = e.state;
            })
        });
        if((newState && !element.classList.contains("activated")) ||
        (!newState && element.classList.contains("activated")))
            element.classList.toggle("activated");
    }

    resetAll(){
        this.elements.forEach((x) => {
            x.forEach((y) => {
                y.reset();
                y.setDisplay();
            });
        });
    }

    elementClicked(element){
        if(this.isRunning) return;
        this.elements.forEach(function(ar){
            ar.filter(e => {
                if(e.isSimilarElement(element))
                    e.toggleCurrentState();
                    e.futureState = e.state;
            })
        });
        element.classList.toggle("activated");
    }

    displayNext(){

        //Set all the next states.
        this.elements.forEach(x => x.forEach(y => {
            var neighbours = this.countNeighbours(y);
            if(neighbours === 3 && !y.getState()){
                y.setState(true);
            }
            else if(neighbours >= 4 && y.getState()){
                y.setState(false);
            }
            else if(neighbours < 2 && y.getState()){
                y.setState(false);
            }
            else if((neighbours === 2 || neighbours === 3) && y.getState()){
                y.setState(true);
            }
        }));

        //Display all the changed states.
        this.elements.forEach(x => x.forEach(y => {
            if(y.futureState != y.state){ //This check is important for performance.
                y.goNextState();
                y.setDisplay();
            }
        }));
    }

    //Counts all activated neighbour pixels.
    countNeighbours(element){
        var x = element.x;
        var y = element.y;
        var counter = 0;
        for(var i = x-1; i <= x+1; i++){
            for(var j = y-1; j <= y+1; j++){
                if(j < 0 || i < 0 || i >= this.width || j >= this.height){
                    continue;
                }
                if(i === x && j === y){
                    continue;
                }
                if(this.elements[j][i].getState()){
                    counter++;
                }
            }
        }
        return counter;
    }
}

class GamePixel{

    constructor(_x,_y){
        this.x = _x;
        this.y = _y;
        this.state = false;
        this.futureState = this.state;
        this.element = undefined;
    }

    toggleCurrentState(){
        this.state = !this.state;
    }

    //Gets the current state of this object.
    getState(){
        return this.state;
    }

    //Sets the future state of this object.
    setState(newState){
        this.futureState = newState;
    }

    //Make the future state the current state.
    goNextState(){
        this.state = this.futureState;
        this.futureState = this.state;
    }

    reset(){
        this.state = false;
        this.futureState = false;
    }

    getDOMElement(){
        if(this.element !== undefined){
            return this.element;
        }
        var newElement = document.createElement("div");
        newElement.className = "game-pixel " + "x=" + this.x + " y=" + this.y;
        this.element = newElement;
        return newElement;
    }

    setDisplay(){
        var pElem = this.getDOMElement();
        if((this.state && !pElem.classList.contains("activated")) ||
        (!this.state) && pElem.classList.contains("activated"))
            pElem.classList.toggle("activated"); 
    }

    //Creates a new DOM element or gets it from the html.
    // getDOMElement(){
    //     var existing = this.getExistingElement();        
    //     if(existing !== undefined) {
    //         return existing;
    //     }
    //     var newElement = document.createElement("div");
    //     newElement.className = "game-pixel " + "x=" + this.x + " y=" + this.y;
    //     return newElement;
    // }

    //Attempts to get the existing element that's added to the html.
    // getExistingElement(){
    //     var container = document.getElementById("container");
    //     for(var i = 0; i < document.getElementById("container").children.length; i++){
    //         if(this.isSimilarElement(container.children[i]))
    //             return container.children[i];
    //     }
    //     return undefined;
    // }

    //All properties match.
    isElement(element){
        return !this.state || element.classList.contains("activated");
    }

    //Coordinates match.
    isSimilarElement(element){
        return element.classList.contains("x=" + this.x) && element.classList.contains("y=" + this.y);
    }

}