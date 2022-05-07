import React, { useState, useEffect } from 'react';
import hamsterWheelSVG from './hamsterWheel.svg';
import { motion, useMotionValue } from "framer-motion"
import plusSVG from './plus.svg';
import crossSVG from './cross.svg';
import centerSVG from './center.svg';
import circleCrossSVG from './circleCross.svg';

const boardSize = {w: 1300, h: 550};

export default function Board(props) {
  const [notes, setNotes] = useState([]);
  const [positions, setPositions] = useState([]);
  const [dragging, setDragging] = useState(0);
  const [zIndexes, setZIndexes] = useState([]);


  useEffect(() => {
    const notes = JSON.parse(window.localStorage.getItem("notes"));
    if (notes) {
      setNotes(notes);
    }
    const positions = JSON.parse(window.localStorage.getItem("positions"));
    if (positions) {
      setPositions(positions);
    }
    const zIndexes = JSON.parse(window.localStorage.getItem("zIndexes"));
    if (zIndexes) {
      setZIndexes(zIndexes);
    }
  }, []);

  function updateNote(note, i) {
    const newNotes = [...notes];
    newNotes[i] = note;
    setNotes(newNotes);
    window.localStorage.setItem("notes", JSON.stringify(newNotes));
  }
  function updatePosition(position, i) {
    const newPositions = [...positions];
    newPositions[i] = position;
    setPositions(newPositions);
    window.localStorage.setItem("positions", JSON.stringify(newPositions));
  }
  function addNote() {
    const newNotes = [...notes];
    newNotes.push("");
    setNotes(newNotes);
    window.localStorage.setItem("notes", JSON.stringify(newNotes));

    const newPositions = [...positions];
    newPositions.push({x: 0, y: 0});
    setPositions(newPositions);
    window.localStorage.setItem("positions", JSON.stringify(newPositions));

    const newZIndexes = [...zIndexes];
    newZIndexes.push(zIndexes.length);
    setZIndexes(newZIndexes);
    window.localStorage.setItem("zIndexes", JSON.stringify(newZIndexes));
  }
  function deleteNote(i) {
    const newNotes = [...notes];
    newNotes.splice(i, 1);
    setNotes(newNotes);
    window.localStorage.setItem("notes", JSON.stringify(newNotes));
    const newPositions = [...positions];
    newPositions.splice(i, 1);
    setPositions(newPositions);
    window.localStorage.setItem("positions", JSON.stringify(newPositions));

    const curZIndex = zIndexes[i];
    const newZIndexes = [...zIndexes];
    newZIndexes.splice(i, 1);
    // decrement every index in the array greater than the deleted index
    for (let j = 0; j < newZIndexes.length; j++) {
      if (newZIndexes[j] > curZIndex) {
        newZIndexes[j]--;
      }
    }
    setZIndexes(newZIndexes);
    window.localStorage.setItem("zIndexes", JSON.stringify(newZIndexes));


  }
  function onDragStart(i) {
    setDragging(dragging + 1);

    const curZIndex = zIndexes[i];
    const newZIndexes = [...zIndexes];
    // decrement every index in the array greater than the deleted index
    for (let j = 0; j < newZIndexes.length; j++) {
      if (newZIndexes[j] > curZIndex) {
        newZIndexes[j]--;
      }
    }
    newZIndexes[i] = newZIndexes.length - 1;
    console.log(newZIndexes);
    setZIndexes(newZIndexes);
    window.localStorage.setItem("zIndexes", JSON.stringify(newZIndexes));
  }
  function deleteAllNotes() {
    setNotes([]);
    setPositions([]);
    setZIndexes([]);
    window.localStorage.removeItem("notes");
    window.localStorage.removeItem("positions");
    window.localStorage.removeItem("zIndexes");
  }

  return (
    <div className='h-full w-full flex absolute items-center justify-center overflow-hidden'>
      <div className={'absolute border-4 rounded-lg ' + (dragging === 0 ? ' border-transparent' : 'border-gray-500/50') +
        ' transistion-opacity duration-200'}
        style={{width: boardSize.w, height: boardSize.h}}
      ></div>
      <ImageDisplay image={props.image} onDragStart={()=>setDragging(dragging+1)} onDragEnd={()=>setDragging(dragging-1)}/>
      <div className='absolute w-0 h-0'>
        {notes.map((note, i) => {
          return (
            <Note note={note} position={positions[i]} key={i} i={i} z={zIndexes[i]}
              updateNote={updateNote} updatePosition={updatePosition} deleteNote={deleteNote}
              onDragStart={onDragStart} onDragEnd={()=>setDragging(dragging-1)} dragging={dragging}
            />
          );
        })}
      </div>
      <div className='absolute w-10 h-10 m-4 bottom-0 right-16'>
        <img className='cursor-pointer' src={plusSVG} onClick={addNote} alt="plus"/>
      </div>
      <div className='absolute w-10 h-10 m-4 bottom-0 right-32'>
        <img className='cursor-pointer' src={circleCrossSVG} onClick={deleteAllNotes} alt="cross"/>
      </div>
    </div>
  );
}


function Note(props) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [typing, setTyping] = useState(false);

  function setNote(m) {
    props.updateNote(m, props.i);
  }
  function setPosition(p) {
    props.updatePosition(p, props.i);
  }
  useEffect(() => {
    x.set(props.position.x);
    y.set(props.position.y);
  } , [props.position, x, y]);

  return (

    <div className='absolute w-0 h-0 -translate-x-32 -translate-y-32'
      style={{zIndex: props.z}}>
      <motion.div className={'w-64 h-64 p-8 bg-yellow-300 flex items-center flex-col group cursor-move ' +
        ' rounded-lg shadow-lg hover:shadow-xl focus:shadow-xl transition-shadow duration-200'}
        drag={!typing}
        dragConstraints={{
          top: -1*boardSize.h/2 + 64*2,
          right: boardSize.w/2 - 64*2,
          bottom: boardSize.h/2 - 64*2,
          left: -1*boardSize.w/2 + 64*2,
        }}
        onDragStart={()=>props.onDragStart(props.i)}
        onDragEnd={(e, info) => {
          props.onDragEnd();
        }}
        onTransitionEndCapture={()=>{
          setPosition({x: x.get(), y: y.get()});
        }}
        style={{x,y}}
      >
        <div className='absolute w-5 h-5 m-2 top-0 left-0 opacity-0 cursor-pointer group-hover:opacity-100 transition-opacity duration-200'>
          <img src={crossSVG} onClick={() => {props.deleteNote(props.i);}} alt="cross"/>
        </div>
        <textarea className={'w-48 h-48 text-2xl text-gray-900 font-quicksand bg-transparent border-none outline-none resize-none overflow-hidden ' + 
          (props.dragging?'':' hover:bg-stone-100/50 focus:bg-stone-50/20')}
          
          value={props.note}
          onFocus={() => setTyping(true)}
          onBlur={() => setTyping(false)}
          onChange={(e) => {setNote(e.target.value)}}
        />
      </motion.div>
    </div>

  )
}
function ImageDisplay(props) {
  const [loading, setLoading] = useState(true);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const size = 384;
  useEffect(() => {
    const oldPos = window.localStorage.getItem("image_pos");

    if (oldPos) {
      x.set(JSON.parse(oldPos).x);
      y.set(JSON.parse(oldPos).y);
    }
  })

  useEffect(() => {
    setLoading(true);
  }, [props.image]);

  function reset_pos() {
    x.set(0.00001);
    y.set(0.00001);
    window.localStorage.setItem("image_pos", JSON.stringify({x: 0, y: 0}));
  }

  return (
    <motion.div className={'group flex items-center justify-center cursor-move ' + 
      'rounded-lg hover:shadow-xl hover:bg-stone-100/10 transition-shadow duration-200'}
      drag
      dragConstraints={{
        top: -1*boardSize.h/2 + size/2,
        right: boardSize.w/2 - size/2,
        bottom: boardSize.h/2 - size/2,
        left: -1*boardSize.w/2 + size/2,
      }}
      onDragStart={()=>props.onDragStart()}
      onDragEnd={(e, info) => {
        props.onDragEnd();
        window.localStorage.setItem("image_pos", JSON.stringify({x: x.get(), y: y.get()}));

      }}
      onTransitionEndCapture={() => {
        
        window.localStorage.setItem("image_pos", JSON.stringify({x: x.get(), y: y.get()}));
      }}
      style={{x, y, width: size, height: size}}
    >
      <div className='absolute top-0 left-0 right-0 bottom-0'></div>

      <div className={(loading ? "block " : "hidden ") + "flex items-center justify-center"}>
        <img className="w-full h-full animate-spin " src={hamsterWheelSVG} alt="hamster wheel" />
      </div>
      <div className={(loading ? "hidden " : "block ") + 
          "h-full w-full flex items-center justify-center bg-transparent rounded-lg"}>
        <img className="w-fit h-fit max-h-full max-w-full rounded-lg object-contain select-none"
          src={props.image} alt='hamster'
          onLoad={() => {setLoading(false); console.log("a")}}/>
      </div>
      <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-10 h-10 top-0 left-0">
        <button onClick={reset_pos}>
          <img className="w-8 h-8 m-3" src={centerSVG} alt="refresh" />
        </button>
      </div>
    </motion.div>
  )
}


