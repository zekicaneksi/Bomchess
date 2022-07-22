import React, {useEffect, useState, useRef} from 'react';
import './Computer.css';

const Computer = () => {

    const isInitialMount = useRef(true);

    useEffect(() => {

        // ComponentDidMount
        if (isInitialMount.current) {
          isInitialMount.current = false;
    
        } else {
          // ComponentDidUpdate
    
       }
        
      });

    return(
        <div className='computer-container'>

            <div className='computer-left-column'>

            </div>

            <div className='computer-right-column'>

                <div className='computer-board-container'>
                    
                </div>

            </div>

        </div>
    );

};

export default Computer;