import React, {useEffect, useState, useRef} from 'react';
import { Chessboard } from "react-chessboard";
import './GameBoard.css';


/**
 * 
 * @param {{game: chess.js,
 * setGame: chess.js,
 * myColor: string, 
 * arePiecesDraggable: Boolean,
 * onSquareClickCallback: function,
 * onDropCallback: function }} props
 * myColor is 'w' or 'b' 
 * 
 * Callback funcions are functions to be called on valid moves and are optional
 */
const GameBoard = (props) => {

    const isInitialMount = useRef(true);

    const boardContainerRef = useRef();
    const [clickedSquare, setClickedSquare] = useState('-');
    const [boardWidth, setBoardWidth] = useState();

    // Custom squares for the board
    const [optionSquares, setOptionSquares] = useState({});
    const [inCheckSquare, setInCheckSquare] = useState({});

    function makeAMove(moveToMake){
        // Make the move
        let gameCopy = {...props.game};
        let result = gameCopy.move(moveToMake);
        props.setGame(gameCopy);
    
        if(result != null ) inCheckBackground(); // Check and set the background to red if the king is in check
    
        return result;
    }

    // Check and set the background to red if the king is in check
    function inCheckBackground() {

        const board = props.game.board();

        if(props.game.in_check()){
            board.forEach((rowArray) => {
                rowArray.forEach((square) => {
                if(square == null)
                    return;
                else {
                    if(square.type == "k" && props.game.turn() == square.color){
                    let toSetSquare = {};
                    toSetSquare[square.square] = {
                        background: 'red'
                    }
                    setInCheckSquare(toSetSquare);
                    }
                }
                }); 
            });
        }
        else {
        setInCheckSquare({});
        }
    
    }

    function showPossibleMoves(square){
        const moves = props.game.moves({
          square,
          verbose: true
        });
    
        const newSquares = {};
    
        newSquares[square] = {
          background: 'rgba(255, 255, 0, 0.4)'
        };
    
        if (moves.length !== 0) {
          
          moves.map((move) => {
            newSquares[move.to] = {
              background:
                props.game.get(move.to) && props.game.get(move.to).color !== props.game.get(square).color
                  ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
                  : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
              borderRadius: '50%'
            };
            return move;
          });
    
        }
        
        setOptionSquares(newSquares);
    }

    function onMouseOverSquare(square) {

        const pieceOnTheSquare = props.game.get(square);
        const myColor = props.myColor;
    
        if(clickedSquare == '-') {
          if(pieceOnTheSquare != null
          && props.game.turn() == myColor
          && pieceOnTheSquare.color == myColor) showPossibleMoves(square);
        }
    }

    function onMouseOutSquare() {

        if(clickedSquare=='-') {
          if (Object.keys(optionSquares).length !== 0) setOptionSquares({});
        }
    }

    function onPieceDragBegin(piece, sourceSquare){
        setClickedSquare('-');
        setOptionSquares({});
        showPossibleMoves(sourceSquare);
    }

    function onSquareClick(square){

        const myColor = props.myColor;
        const squareColor = props.game.get(square)?.color;
    
        if(myColor != props.game.turn()) return; // do nothing if it isn't my turn
    
        if(squareColor == myColor){
          if (Object.keys(optionSquares).length !== 0) setOptionSquares({}); // if showing, don't show possible moves for any piece
          setClickedSquare(square);
          showPossibleMoves(square);
    
        } else if (squareColor != myColor && clickedSquare != '-'){
    
          const move = makeAMove({
            from: clickedSquare,
            to: square,
            promotion: "q", // always promote to a queen for example simplicity
          });
    
          // If the move is legal, call the callback
          if(move != null){
            if(props.onSquareClickCallback) props.onSquareClickCallback(move);
          }
    
          setOptionSquares({});
          setClickedSquare('-');
    
        } else{
          return;
        }
        
    }

    function onDrop(sourceSquare, targetSquare) {

        // Make the move
        let move = makeAMove({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q", // always promote to a queen for example simplicity
        });
    
        // Move is illegal
        if(move === null)  return false;
    
        // If the move is legal, call the callback
        if(props.onDropCallback) props.onDropCallback(move);
        
    
        setOptionSquares({});
        
        return true;
    }

    // Makes opponent's pieces undraggable
    function isDraggablePiece({piece, sourceSquare}){

        if(piece[0] != props.myColor){
        return false;
        }else{
        return true;
        }
      
    }

    function resizeBoard(){
        let clientWidth = boardContainerRef.current?.clientWidth;
        let clientHeight = boardContainerRef.current?.clientHeight;
    
    
        if(clientWidth > clientHeight) setBoardWidth(clientHeight);
        else setBoardWidth(clientWidth);
    }

    useEffect(() => {
        inCheckBackground();
    }, [props.game]);

    useEffect(() => {

        // ComponentDidMount
        if (isInitialMount.current) {
          isInitialMount.current = false;

          inCheckBackground();

          resizeBoard();

          window.addEventListener('resize', resizeBoard);
    
        } else {
          // ComponentDidUpdate
    
       }
        
    });

    useEffect(() => {
        // --- ComponentWillUnmount
        return () => {
          window.removeEventListener('resize', resizeBoard);
        }
    },[]);

    return(
        <div className='gameboard-fill' ref={boardContainerRef}>
            <Chessboard
                boardWidth={boardWidth}
                position={props.game.fen()}
                onPieceDrop={onDrop}
                onSquareClick={onSquareClick}
                boardOrientation={(props.myColor == 'w' ? 'white' : 'black')}
                isDraggablePiece={isDraggablePiece}
                arePiecesDraggable={props.arePiecesDraggable}
                onPieceDragBegin={onPieceDragBegin}
                onMouseOverSquare={onMouseOverSquare}
                onMouseOutSquare={onMouseOutSquare}
                customSquareStyles={{
                ...optionSquares,
                ...inCheckSquare
                }}
            />
        </div>
    );


};

export default GameBoard;