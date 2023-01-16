
import './App.css';
import { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getStorage, ref, listAll, getDownloadURL} from "firebase/storage";
import refreshSVG from './refresh.svg';
import mailOpen from './mailOpen.svg';
import mailClosed from './mailClosed.svg';
import chevronLeft from './chevronLeft.svg';
import chevronRight from './chevronRight.svg';
import colorIcon from './color.svg';
import linkIcon from './link.svg';
import Board from './Board';

const backgroundColors = [
  "bg-rose-200",
  "bg-red-200",
  "bg-orange-200",
  "bg-amber-200",
  "bg-yellow-200",
  "bg-lime-200",
  "bg-green-200",
  "bg-emerald-200",
  "bg-teal-200",
  "bg-cyan-200",
  "bg-sky-200",
  "bg-blue-200",
  "bg-indigo-200",
  "bg-violet-200",
  "bg-purple-200",
  "bg-fuchsia-200",
  "bg-pink-200",
];

function PopUpMessage() {
  const [show, setShow] = useState(false);

  const handleClick = () => {
    setShow(!show);
  };
  // icon that shows text box when clicked
  return (
    <div className="fixed bottom-0 left-16 m-4">
      <div className={show ? "block" : "hidden"}>
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="text-left max-w-screen-md ">
            <h1 className="text-3xl font-bold mb-2">Happy Valentines Day Chloe!</h1>
            <p className="text-xl mb-1">
              I hope you like my hamster tab extension! It will show you a new hamster 
              every time you open a new tab, and I can add any photo that you send me :)
              Thank you for being super awesome and the best girlfriend ever! I love you!
            </p>
            <p className="text-xl">
              Love,<br/>Davin &#10084;
            </p>
          </div>
        </div>
      </div>
      <img className="w-10 h-10 cursor-pointer " src={show ? mailOpen : mailClosed} alt="refresh" onClick={handleClick} />
    </div>
  )
}
function PopUpShare(props) {
  const [show, setShow] = useState(false);
  const handleClick = () => {
    setShow(!show);
  };
  function getLink() {
    let link = "https://melodious-pavlova-32b789.netlify.app/?";
    link += "name=" + props.name;
    link += "&bgColor=" + props.bgColor;
    return link;
  }
  // icon that shows text box when clicked
  return (
    <div className="fixed bottom-0 left-0 m-4">
      <a href={getLink()} target="_blank">
        <img className="w-10 h-10 cursor-pointer " src={linkIcon} alt="refresh" onClick={handleClick} />
      </a>
    </div>
  )
}
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAPDfesqEkKNYsZyAiiTPC0P9ZDETDyNl4",
  authDomain: "phototab-1644615816381.firebaseapp.com",
  projectId: "phototab-1644615816381",
  storageBucket: "phototab-1644615816381.appspot.com",
  messagingSenderId: "185221892148",
  appId: "1:185221892148:web:152bb2b7aeace78e396261",
  measurementId: "G-9NX2VF1VY6"
};

function App() {

  const [image, setImage] = useState(null);
  const [name, setName] = useState(null);
  const [isFixedImage, setIsFixedImage] = useState(false)
  const [bgColor, setBgColor] = useState(Math.floor(Math.random() * backgroundColors.length));
  const [showingOld, setShowingOld] = useState(false);
  const [loadingCache, setLoadingCache] = useState(false);
  let storage;

  async function updateLocalStorage() {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    storage = getStorage(app);
    const hamstersRef = ref(storage, 'hamsters');
    const res = await listAll(hamstersRef);
    const hamsters = res.items;
    let urlList = [];
    let nameList = [];
    let promises = [];
    hamsters.forEach(hamster => {
      console.log(hamster)
      promises.push(getDownloadURL(hamster)
        .then((res) => {
          urlList.push(res);
          nameList.push(hamster.name);
        }).catch((error) => {
          console.log(error);
        }));
    });
    await Promise.all(promises);
    console.log(urlList);
    window.localStorage.setItem("hamster_image_urls", JSON.stringify(urlList));
    window.localStorage.setItem("hamster_image_names", JSON.stringify(nameList));
    setLoadingCache(false);
  }

  function reloadImages() {
    // setImage(null);
    updateLocalStorage();
    if (!isFixedImage) {
      pickImage();
    }
  }

  function swapImage() {
    const old_img = window.localStorage.getItem("old_img");
    const new_img = window.localStorage.getItem("new_img");
    if (old_img) {
      if (showingOld) {
        setImage(new_img);
        setShowingOld(false);
      }
      else {
        setImage(old_img);
        setShowingOld(true);
      }
    }
  }

  function getURLParamImage() {
    const queryParameters = new URLSearchParams(window.location.search);
    const bgColor = queryParameters.get("bgColor");
    if (bgColor) {
      setBgColor(bgColor)
    }
    const name = queryParameters.get("name");
    console.log(name);
    if (name) {
      setIsFixedImage(true);
      console.log("setImage");
      if (!storage) {
        const app = initializeApp(firebaseConfig);
        storage = getStorage(app);
      }
      console.log(storage)
      
      const imageRef = ref(storage, "hamsters/"+name);
      const promise = getDownloadURL(imageRef)
        .then((url) => {
          console.log("set setimage")
          console.log(url)
          setImage(url);
        })
        .catch((error) => {
          console.log(error);
          return null;
        })
      return promise;
    }
    return null;
  }

  function getNameFromURL(url) {
    // console.log("getting name")
    // console.log(url)
    const hamsters = JSON.parse(window.localStorage.getItem("hamster_image_urls"));
    const names = JSON.parse(window.localStorage.getItem("hamster_image_names"));

    const index = hamsters.indexOf(url);
    // console.log(names[index])
    return names[index];
  }

  async function pickImage() {
    window.localStorage.setItem("old_img", window.localStorage.getItem("new_img"));
    const hamsters = JSON.parse(window.localStorage.getItem("hamster_image_urls"));
    const names = JSON.parse(window.localStorage.getItem("hamster_image_names"));
    let index;
    let name;
    do {
      index = Math.floor(Math.random() * hamsters.length);
      name = names[index];
      console.log(name);
      console.log(name.substring(name.length-3, name.length))
    }
    while (name.substring(name.length-3, name.length) === "mov")
    const new_img = hamsters[index];
    window.localStorage.setItem("new_img", new_img);
    setImage(new_img);
    setBgColor(Math.floor(Math.random() * backgroundColors.length));
  }

  useEffect(() => {
    if (window.localStorage.getItem("hamster_image_urls") === null) {
      console.log("loading")
      setLoadingCache(true);
      updateLocalStorage();
    }

    if (!getURLParamImage()) {
      console.log("picking");
      pickImage();
    }
  }, [])


  useEffect(() => {
    console.log("image changed")
    console.log(image)
    setName(getNameFromURL(image));
  }, [image])
  
  return (
    <div className={"w-full h-full absolute " + backgroundColors[bgColor]} >
      {/* <ImageDisplay image={image}/> */}
      <Board image={image} />
      <div className="absolute bottom-0 right-0 m-4">
        <img className="w-10 h-10 cursor-pointer " src={refreshSVG} alt="refresh" onClick={reloadImages} />
      </div>
      <div className={isFixedImage ? "hidden" : ""}>
        <div className='absolute top-0 right-0 m-4'>
          <img className='w-10 h-10 cursor-pointer' src={showingOld ? chevronRight : chevronLeft} alt="arrow" onClick={swapImage}/>
        </div>
        <div className="absolute top-0 left-0 m-4">
          <img className="w-10 h-10 cursor-pointer " src={colorIcon} alt="color" onClick={() => {setBgColor((bgColor+1) % backgroundColors.length)}}/>
        </div>
        <PopUpMessage/>
      </div>
      <PopUpShare name={name} bgColor={bgColor}/>
    </div>
  );
}

export default App;
