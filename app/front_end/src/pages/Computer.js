import React, {useEffect, useState, useRef} from 'react';
import GameBoard from '../components/GameBoard';
import {Chess} from "chess.js";
import MovesList from '../components/MovesList';
import './Computer.css';

const Computer = () => {

    const isInitialMount = useRef(true);

    const [game, setGame] = useState(new Chess());
    const [myColor, setMyColor] = useState(((Math.floor(Math.random() * 100)) > 50 ? 'w' : 'b'))
    const [moves, setMoves] = useState([]);

    function makeARandomMove(){
        const possibleMoves = game.moves();
        if (game.game_over() || game.in_draw() || possibleMoves.length === 0)
        return; // exit if the game is over
        const randomIndex = Math.floor(Math.random() * possibleMoves.length);

        let gameCopy = {...game};
        gameCopy.move(possibleMoves[randomIndex]);
        setGame(gameCopy);
    }

    function moveCallback(){
        setTimeout(() => makeARandomMove(),1000);
    }

    // Update moves when a move is made
    useEffect(() => {

        function moves_jsonToArray(){
            let toReturn = [];
        
            const holdMoves = {...game.history({verbose:true})};
            for(var i in holdMoves){
              toReturn.push(holdMoves[i]);
            }
        
            return toReturn;
        }


        setMoves(moves_jsonToArray());

    }, [game]);


    useEffect(() => {

        // ComponentDidMount
        if (isInitialMount.current) {
          isInitialMount.current = false;

          if(game.turn() != myColor) setTimeout(() => makeARandomMove(),1000);
    
        } else {
          // ComponentDidUpdate
    
       }
        
    });

    return(
        <div className='computer-container'>

            <div className='computer-left-column'>

                <div className='computer-moves-div'>
                    <MovesList moves={moves} />
                </div>

                <div className='computer-buttons'>
                    <button className='computer-back-button'></button>
                    <button className='computer-restart-button'></button>
                </div>
            </div>

            <div className='computer-right-column'>

                <div className='computer-board-container'>
                    <GameBoard 
                        game={game}
                        setGame={setGame}
                        myColor={myColor}
                        arePiecesDraggable={true}
                        onDropCallback={moveCallback}
                        onSquareClickCallback={moveCallback}
                    />    
                </div>

            </div>

        </div>
    );

};

export default Computer;