import React, {useEffect, useState, useRef} from 'react';
import GameBoard from '../components/GameBoard';
import {Chess} from "chess.js";
import {Navigate} from "react-router-dom";
import MovesList from '../components/MovesList';
import './Computer.css';

const Computer = () => {

    const isInitialMount = useRef(true);

    const [game, setGame] = useState(new Chess());
    const [myColor, setMyColor] = useState(((Math.floor(Math.random() * 100)) > 50 ? 'w' : 'b'))
    const [moves, setMoves] = useState([]);
    const [movesListOrientation, setMovesListOrientation] = useState('v');
    const [navigate, setNavigate] = useState('computer');

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

    function changeLayoutOfMovesList(){
        if(window.innerWidth <= 600){
            setMovesListOrientation('h');
        } else{
            setMovesListOrientation('v');
        }
    }

    useEffect(() => {

        // ComponentDidMount
        if (isInitialMount.current) {
          isInitialMount.current = false;

          changeLayoutOfMovesList();

          if(game.turn() != myColor) setTimeout(() => makeARandomMove(),1000);

          window.addEventListener('resize', changeLayoutOfMovesList);
    
        } else {
          // ComponentDidUpdate
    
       }
        
    });

    useEffect(() => {
        // --- ComponentWillUnmount
        return () => {
          window.removeEventListener('resize', changeLayoutOfMovesList);
        }
    },[]);

    if(navigate==='computer'){
        return(
            <div className='computer-container'>
    
                <div className='computer-left-column'>
    
                    <div className='computer-moves-div'>
                        <MovesList moves={moves} orientation={movesListOrientation}/>
                    </div>
    
                    <div className='computer-buttons'>
                        <button className='computer-back-button'  onClick={() => setNavigate('back')}></button>
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
    } else if(navigate === 'back'){
        return(
            <Navigate to='/' />
        );
    } else {

    }

};

export default Computer;