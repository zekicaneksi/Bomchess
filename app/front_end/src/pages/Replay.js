import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useParams } from "react-router-dom";
import {Chess} from "chess.js";
import GameBoard from "../components/GameBoard";
import MovesList from '../components/MovesList';
import * as HelperFunctions from '../components/HelperFunctions';
import './Replay.css';


const Replay = (props) => {

    const isInitialMount = useRef(true);

    let routerParams = useParams();

    const [game, setGame] = useState(new Chess());
    const [matchInfo, setMatchInfo] = useState();
    const [remainingTimes, setRemainingTimes] = useState({white: 0, black: 0});
    const [moveNumber, setMoveNumber] = useState();
    const [orientation, setOrientation] = useState('w');
    const [movesListOrientation, setMovesListOrientation] = useState('v');

    useEffect(() => {
        if(moveNumber === undefined){}
        else if(moveNumber === -1){
            let remainingTime = HelperFunctions.milisecondsToChessCountDown(matchInfo.length*60000);
            setGame((old) => {
                let toReturn = {...old};
                toReturn.reset();
                return toReturn;
            });
            setRemainingTimes({
                white: remainingTime,
                black: remainingTime
            });
        }
        else {
            let whiteRemainingTime, blackRemainingTime;
            if(moveNumber % 2 === 0){
                let whiteMove = matchInfo.fenArrayWithRemainingTimes.whiteMoves[moveNumber/2];
                whiteRemainingTime = whiteMove.remainingTime;
                blackRemainingTime = (moveNumber === 0 ? remainingTimes.black : matchInfo.fenArrayWithRemainingTimes.blackMoves[(moveNumber/2)-1].remainingTime);
                setGame((old) => {
                    let toReturn = {...old};
                    toReturn.load(whiteMove.fen);
                    return toReturn;
                });
            } else {
                let blackMove = matchInfo.fenArrayWithRemainingTimes.blackMoves[parseInt(moveNumber/2)];
                blackRemainingTime = blackMove.remainingTime;
                whiteRemainingTime = matchInfo.fenArrayWithRemainingTimes.whiteMoves[(moveNumber-1)/2].remainingTime;
                setGame((old) => {
                    let toReturn = {...old};
                    toReturn.load(blackMove.fen);
                    return toReturn;
                });
            }
            setRemainingTimes({
                white: whiteRemainingTime,
                black: blackRemainingTime
            });
        }
    }, [moveNumber]);


    function movesListOnClickHandle(moveNumber){
        setMoveNumber(moveNumber);
    }

    function nextBtnHandle(){
        if(matchInfo.moves.length === 0) return;
        if(moveNumber === undefined) setMoveNumber(0)
        else if(moveNumber!==matchInfo.moves.length-1) setMoveNumber(old => old+1);
    }

    function previousBtnHandle(){
        if(matchInfo.moves.length === 0) return;
        if(moveNumber!==-1 && moveNumber !== undefined) setMoveNumber(old => old-1);
    }

    function crateFenForMovesWithRemainingTimes(moves, gameLength, gameDate){

        gameLength = parseInt(gameLength)*60000; // Minute to milisecond

        let toReturn = {};
        toReturn.whiteMoves = [];
        toReturn.blackMoves = [];

        const chess = new Chess();

        for(let i = 0; i < moves.length; i++){

            let toPush = {};
            
            if(chess.turn() === 'w'){
                if(toReturn.whiteMoves.length === 0){
                    toPush.remainingTime = gameLength - (moves[i].timestamp - gameDate);
                }
                else{
                    toPush.remainingTime = toReturn.whiteMoves.at(-1).remainingTime - (moves[i].timestamp - moves[i-1].timestamp);
                }
            }
            else {
                if(toReturn.blackMoves.length === 0){
                    toPush.remainingTime = gameLength - (moves[i].timestamp - (gameDate + (moves[i-1].timestamp - gameDate)));
                }else{
                    toPush.remainingTime = toReturn.blackMoves.at(-1).remainingTime - (moves[i].timestamp - moves[i-1].timestamp);
                }
            }

            chess.move(moves[i]);
            toPush.fen = chess.fen();

            (chess.turn() === "w" ? toReturn.blackMoves.push(toPush) : toReturn.whiteMoves.push(toPush));
        }

        for(let i = 0; i < toReturn.whiteMoves.length; i++){
            toReturn.whiteMoves[i].remainingTime = HelperFunctions.milisecondsToChessCountDown(toReturn.whiteMoves[i].remainingTime);
            if(toReturn.blackMoves[i] !== undefined) toReturn.blackMoves[i].remainingTime = HelperFunctions.milisecondsToChessCountDown(toReturn.blackMoves[i].remainingTime);
        }

        return toReturn;
    }

    function changeLayoutOfMovesList(){
        if(window.innerWidth <= 800){
            setMovesListOrientation('h');
        } else{
            setMovesListOrientation('v');
        }
    }

    function getMatchInfo(){

        let responseFunction = (httpRequest) => {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
              if (httpRequest.status === 200) {
                let match = JSON.parse(httpRequest.response);
                match.fenArrayWithRemainingTimes = crateFenForMovesWithRemainingTimes(match.moves, match.length, match.date);
                let initialRemainingTime = HelperFunctions.milisecondsToChessCountDown(parseInt(match.length)*60000);
                setRemainingTimes({
                    white: initialRemainingTime,
                    black: initialRemainingTime});
                setMatchInfo(match);
              } else if (httpRequest.status === 404) {
                setMatchInfo('notFound');
              } else {
                alert("unknown error from server");
              }
            }
        }

        HelperFunctions.ajax('/replay?matchId='+routerParams.matchId,'GET',responseFunction);

    }

    useEffect(() => {
        // ComponentDidMount
        if (isInitialMount.current) {
            isInitialMount.current = false;

            getMatchInfo();
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


    if(matchInfo === undefined){
        return(<p>Loading...</p>);
    }
    else if(matchInfo === 'notFound'){
        return(
            <div>
                <p>Match with the {routerParams.matchId} id couldn't be found.</p>
                <button onClick={() => setMatchInfo('home')}>Go Back</button>
            </div>
        )
    }
    else if(matchInfo === 'home'){
        return(<Navigate to='/' />);
    }
    else {

        let whiteUsername = <a href={"/profile/"+matchInfo.white} target={'_blank'}>{matchInfo.white}</a>
        let blackUsername = <a href={"/profile/"+matchInfo.black} target={'_blank'}>{matchInfo.black}</a>    

        return(
            <div className='replay-container'>
                <div className='replay-left-div-container'>
                    <div className='replay-moveslist-container'>
                        <MovesList
                        moves={matchInfo.moves}
                        orientation={movesListOrientation}
                        onClickHandle={movesListOnClickHandle}/>
                    </div>
                    <div className='replay-moveslist-btn-container'>
                        <button onClick={previousBtnHandle} className="replay-previous-btn"></button>
                        <button onClick={nextBtnHandle} className="replay-next-btn"></button>
                    </div>
                    <button onClick={() => {setOrientation(old => (old === 'w' ? 'b' : 'w'))}} className="replay-switch-btn"></button>
                </div>
                <div className='replay-middle-div-container'>
                    <GameBoard
                    game={game}
                    setGame={setGame}
                    myColor={orientation}
                    arePiecesDraggable={false}
                    disableSquareClick={true}
                    />
                </div>
                <div className='replay-right-div-container'>

                    <div className="replay-user-timer-top">
                
                        {(orientation === 'w' ? 
                            <React.Fragment>
                            <p>{remainingTimes.black}</p>
                            {blackUsername}
                            </React.Fragment>
                            :
                            <React.Fragment>
                            <p>{remainingTimes.white}</p>
                            {whiteUsername}
                            </React.Fragment> 
                        )}  

                    </div>

                    <div className="replay-messages">

                        {((matchInfo.moves.length-1 === moveNumber) || (matchInfo.moves.length === 0)) && 
                        <React.Fragment>
                        <p>Ended by: {(matchInfo.endedBy === 'drawOffer' ? 'draw' : matchInfo.endedBy)}</p>
                        <p>Winner: {(matchInfo.winner === 'b' ? 'black' : 'white')}</p>
                        </React.Fragment>}

                    </div>

                    <div className='replay-user-timer-bottom'>

                        {(orientation === 'w' ? 
                            <React.Fragment>
                            {whiteUsername}
                            <p>{remainingTimes.white}</p>
                            </React.Fragment>
                            :
                            <React.Fragment>
                            {blackUsername}
                            <p>{remainingTimes.black}</p>
                            </React.Fragment> 
                        )}

                    </div>

                </div>
            </div>
        );
    }
};

export default Replay;