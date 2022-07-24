import React, {useEffect, useState, useRef} from 'react';
import GameBoard from '../components/GameBoard';
import {Chess} from "chess.js";
import {Navigate} from "react-router-dom";
import MovesList from '../components/MovesList';
import {Mutex} from 'async-mutex';
import './Computer.css';

const Computer = () => {

    const isInitialMount = useRef(true);

    const [game, setGame] = useState(new Chess());
    const [myColor, setMyColor] = useState(((Math.floor(Math.random() * 100)) > 50 ? 'w' : 'b'))
    const [moves, setMoves] = useState([]);
    const [movesListOrientation, setMovesListOrientation] = useState('v');
    const [navigate, setNavigate] = useState('computer');
    const restartRef = useRef();
    const mutex = useRef(new Mutex());

    function makeARandomMove(){
        const possibleMoves = game.moves();
        if (game.game_over() || game.in_draw() || possibleMoves.length === 0)
        return; // exit if the game is over
        const randomIndex = Math.floor(Math.random() * possibleMoves.length);

        let gameCopy = {...game};
        gameCopy.move(possibleMoves[randomIndex]);
        setGame(gameCopy);
    }

    function handleRestartBtn(){
        setGame(new Chess());
        setMyColor((old) => (old === 'w' ? 'b' : 'w'));
        restartRef.current.disabled = true;
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

        mutex.current.runExclusive(async function () {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            if(game.turn() !== myColor) makeARandomMove();
            restartRef.current.disabled = false;
            mutex.current.cancel();
        }).catch(e => {});

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
                        <button ref={restartRef} className='computer-restart-button' onClick={handleRestartBtn}></button>
                    </div>
                </div>
    
                <div className='computer-right-column'>
    
                    <div className='computer-board-container'>
                        <GameBoard 
                            game={game}
                            setGame={setGame}
                            myColor={myColor}
                            arePiecesDraggable={true}
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