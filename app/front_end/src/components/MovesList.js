import React, {useEffect, useRef} from 'react';
import './MovesList.css';

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

        // If user scrolled up, disable auto scroll
        if(holdScrollValue.current > listRef.current.scrollTop)
          enableAutoScroll.current = false;
        
        // Enable auto scroll if user scrolled to bottom
        if((listRef.current.scrollTop + listRef.current.offsetHeight + 2) >= listRef.current.scrollHeight)
          enableAutoScroll.current = true;
        
        if(enableAutoScroll.current){
          listRef.current?.scrollTo({ top: listRef.current.scrollHeight, left:0, behavior: 'smooth'});
          holdScrollValue.current = listRef.current.scrollTop;
        }
    }
  });


  let listRowNumber = [];
  let listWhiteMove = [];
  let listBlackMove = [];

  for (let i = 0; i < props.moves.length; i++) {
      let toPush = <p key={i} className="moveslist-row-move-item">{props.moves[i].from + props.moves[i].to}</p>;
    if(i%2==0) listWhiteMove.push(toPush);
    else listBlackMove.push(toPush);
  }

  for (let i = 0; i < listWhiteMove.length; i++) {
    listRowNumber.push(<p key={i} className='moveslist-row-number-item'>{i}</p>);
  }

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
};

export default MovesList;