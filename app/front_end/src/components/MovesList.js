import React, {useEffect, useRef} from 'react';
import './MovesList.css';

/**
 * 
 * @param {{moves: Array,
 * orientation: String }} props
 * moves is the array of moves to list
 * 
 * orientation is either 'h' (horizontal) or 'v' (vertical)
 */

const MovesList = (props) => {

  const isMounted = useRef();
  const listRef = useRef(null);

  const enableAutoScroll = useRef(true);
  const holdScrollValue = useRef(0);

  useEffect(() => {
    if (!isMounted.current) {
      // ComponentDidMount

      isMounted.current = true;
    } else {
      // ComponentDidUpdate

      let scrollTop = (props.orientation=='v' ? listRef.current.scrollTop : listRef.current.scrollLeft);
      let offsetHeight = (props.orientation=='v' ? listRef.current.offsetHeight : listRef.current.offsetWidth);
      let scrollHeight = (props.orientation=='v' ? listRef.current.scrollHeight : listRef.current.scrollWidth);

      // If user scrolled up, disable auto scroll
      if(holdScrollValue.current > scrollTop){
        enableAutoScroll.current = false;
      }
      
      // Enable auto scroll if user scrolled to bottom
      if((scrollTop + offsetHeight + 2) >= scrollHeight){
        enableAutoScroll.current = true;
      }
      
      if(enableAutoScroll.current){
        listRef.current?.scrollTo({ top: scrollHeight, left: scrollHeight, behavior: 'smooth'});
        holdScrollValue.current = scrollTop;
      }
    }
  });


  let listRowNumber = [];
  let listWhiteMove = [];
  let listBlackMove = [];

  for (let i = 0; i < props.moves.length; i++) {
      let toPush = <p key={"moveNumber"+i} className="moveslist-row-move-item">{props.moves[i].from + props.moves[i].to}</p>;
    if(i%2==0) listWhiteMove.push(toPush);
    else listBlackMove.push(toPush);
  }

  for (let i = 0; i < listWhiteMove.length; i++) {
    listRowNumber.push(<p key={"rowNumber"+i} className='moveslist-row-number-item'>{i}</p>);
  }

  if(props.orientation=='v'){
    return (
      <div className='moveslist-container' ref={listRef}>
        <div className='moveslist-row-number'>
            {listRowNumber}
        </div>
        <div className='moveslist-row-moves-container'>
            <div className='moveslist-white'>
                {listWhiteMove}
            </div>
            <div className='moveslist-black'>
                {listBlackMove}
            </div>
        </div>
      </div>
    );
  } else{

    let horizontalRows=[];

    for(let i=0; i<listRowNumber.length; i++){
      horizontalRows.push(
        <div key={"horizontal"+i} className='moveslist-horizontal-column'>
          {listRowNumber[i]}
          {listWhiteMove[i]}
          {(listBlackMove[i] !== undefined) ? listBlackMove[i] : <p></p>}
      </div>
      );
    }

    return(
      <div className='moveslist-container' ref={listRef}>
        {horizontalRows}
      </div>
    );
  }

  
};

export default MovesList;