import React, { useState, useEffect } from 'react';
import hamsterWheelSVG from './hamsterWheel.svg';
import Draggable from 'react-draggable';

export default function Board(props) {
  const [imgPos, setImgPos] = useState(null);
  return (
    <div className='h-full w-full flex absolute items-center justify-center'>
      <div className={"h-5/6 w-5/6 bg-blue-300 absolute border-2 border-red-500 flex items-center justify-center"} >
        {/* <Draggable
          axis="x"
          handle=".handle"
          defaultPosition={{x: 0, y: 0}}>
          <ImageDisplay className="handle" image={props.image}/>
        </Draggable> */}
        <Draggable
          axis="both"
          // handle=".handle"
          position={imgPos}
          scale={1}
          onStop={(e, data) => {
            setImgPos({x: data.x, y: data.y});
          }}>
          <div className='handle'>
            <ImageDisplay image={props.image}/>
          </div>
        </Draggable>
      </div>
    </div>
  )
}

function ImageDisplay(props) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
  }, [props.image]);

  return (
    <div className=' w-64 h-64 flex items-center justify-center'>
      <div className='absolute '>
        <div className={(loading ? "block" : "hidden") + " flex items-center justify-center"}>
          <img className="w-full h-full animate-spin " src={hamsterWheelSVG} alt="hamster wheel" />
        </div>
        <div className={(loading ? "hidden" : "block") + " flex items-center justify-center"}>
          <div className='absolute top-0 bottom-0 left-0 right-0'></div>
          <img className="w-auto h-auto max-h-full rounded-lg object-contain select-none"
            src={props.image} alt='hamster'
            onLoad={() => {setLoading(false); console.log("a")}}/>
        </div>
      </div>
    </div>
  )
}


