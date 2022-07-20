import './MovesList.css';

const MovesList = (props) => {
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
      <div className='moveslist-container'>
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