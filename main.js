


var game;

function onLoad(){
    game = new GameOfLife(50);
    game.initDomFields();
}

class GameOfLife{

    constructor(_size){
        this.size = _size;
    }

    initDomFields(){

        var container = document.getElementById("container");
        var elements = new Array();

        for(var i = 0; i < this.size; i++){
            var row = new Array();
            for(var j = 0; j < this.size; j++){
                var pixel = new GamePixel(j, i);
                var pixelDiv = pixel.getDOMElement();
                container.appendChild(pixelDiv);
                pixelDiv.style.width = (1000/this.size) + "px";
                pixelDiv.style.height = (1000/this.size) + "px";
                pixelDiv.onclick = e => this.elementClicked(e.toElement);
                row[j] = pixelDiv;
            }
            elements[i] = row;
        }
        console.log(elements);
    }
    elementClicked(element){
        // elements.foreach(ar => ar.filter(e => e.isSimilarElement(element).toggleCurrentState()));
        element.classList.toggle("activated");
    }

    displayNext(){
        
    }

    //Counts all activated neighbour pixels.
    countNeighbours(x, y){
        var counter = 0;
        for(var i = x-1; i <= x+1; i++){
            for(var j = y-1; j <= y+1; j++){
                if(x < 0 || y < 0 || x >= this.size || y >= this.size){
                    continue;
                }
                if(elements[j][i].getState()){
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
        this.futureState = undefined;
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
        this.futureState = undefined;
    }

    //Creates a new DOM element or gets it from the html.
    getDOMElement(){
        var existing = this.getExistingElement();
        if(existing !== undefined && existing.classList != undefined) {
            console.log(existing);
            return existing;
        }
        var newElement = document.createElement("div");
        newElement.className = "game-pixel " + "x=" + this.x + " y=" + this.y;
        return newElement;
    }

    //Attempts to get the existing element that's added to the html.
    getExistingElement(){
        return Array.prototype.slice.call(document.getElementById("container").children).filter(x => this.isSimilarElement(x))
    }

    //All properties match.
    isElement(element){
        return !this.state || element.classList.contains("activated");
    }

    //Coordinates match.
    isSimilarElement(element){
        return element.classList.contains("x=" + this.x) && element.classList.contains("y=" + this.y);
    }

}