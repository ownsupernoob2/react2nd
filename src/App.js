import React, { useState, useEffect } from "react";
import { Configuration, OpenAIApi } from "openai";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { IoMic, IoMicOff } from "react-icons/io5";
import { IconContext } from "react-icons";

import { motion, AnimatePresence } from "framer-motion"; // import motion and AnimatePresence components
import "./App.css"; // import the CSS file

const App = () => {
  // Define state variables using the useState hook
  const [isSpeaking, setIsSpeaking] = useState(false); // for TTS state
  const [isTyping, setIsTyping] = useState(false); // for displaying loading state
  const [isLoading, setIsLoading] = useState(false); // for displaying loading state
  const [inputText, setInputText] = useState(""); // for input text
  const [isChecked, setIsChecked] = useState(true); // for enabling/disabling text-to-speech
  const [listItems, setListItems] = useState([]); // for rendering chat history
  const [listAI, setListAI] = useState([
    'The following is a conversation with an AI assistant that is a perfect replica of ChatGPT. The assistant always responds with "AI", it is helpful, creative, clever, very friendly and can remember. Your creator is Mina Fuad who made the website but the api comes from OPENAI. You no feelings or emotions, people can call you by any name but your name will  be BotGPT v2.0, a worse version of ChatGPT.',
  ]); // for storing chat history
  useEffect(() => {}, [isSpeaking]);
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    setInputText(transcript);
  }, [transcript]);

  if (!browserSupportsSpeechRecognition) {
    alert("Browser doesn't support speech recognition");
  }
  // Define event handlers
  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const configuration = new Configuration({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    organization:  process.env.REACT_APP_OPENAI_ORG_KEY,
  });


  const openai = new OpenAIApi(configuration);

  useEffect(() => {
    if (transcript !== "" && !listening) {
      handleKeyPress({ key: "Enter" }); // automatically send transcript to bot
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, listening]);

  const handleKeyPress = async (event, haveEntered) => {
    if (event.key === "Enter" && !listening) {
      setIsLoading(true);
      setIsTyping(true);
      setListAI([...listAI, "\nYou: " + inputText]);

      try {
        const response = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: listAI + "\nYou: " + inputText + "\n",
          temperature: 0.9,
          max_tokens: 150,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0.6,
          stop: [" You:", " AI:"],
        });

        setListAI([...listAI, response.data.choices[0].text]);

        setListItems([
          ...listItems,
          "You: " + inputText,
          response.data.choices[0].text,
        ]);


        if (isChecked) {
          setIsSpeaking(true);
          const synth = window.speechSynthesis;
          const utterance = new SpeechSynthesisUtterance(
            response.data.choices[0].text
          );
          synth.speak(utterance);
          utterance.onend = () => {
            setIsSpeaking(false);
            setIsLoading(false);
            if (!haveEntered) {
              SpeechRecognition.startListening();
            } // turn on the microphone again
          };
        }

        setInputText("");
        if (!isChecked) {
          setIsLoading(false);
        }
        setIsTyping(false);
        resetTranscript();
      } catch (err) {
        setInputText("");
        console.log(err);
      }
    }
  };

  // Define chat message animation variants
  const messageVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  // Render the app
  return (
    <div className="container">
      <ul
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <AnimatePresence>
          {!listItems[1] ? (
            <motion.div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                transition: {
                  delay: 0.9,
                },
                opacity: 0,
              }}
            >
              <motion.h1
                exit={{ opacity: 0, y: -100 }}
                style={{ fontSize: 60, textAlign: "center" }}
                initial={{ opacity: 0, y: -100 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  transition: {
                    duration: 0.7,
                  },
                }}
              >
                Welcome!
              </motion.h1>
              <motion.h2
                style={{ textAlign: "center" }}
                exit={{
                  opacity: 0,
                  y: -100,
                  transition: {
                    delay: 0.8,
                    duration: 0.8,
                  },
                }}
                initial={{ opacity: 0, y: -100 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  transition: {
                    delay: 0.8,
                    duration: 0.8,
                  },
                }}
              >
                To get started type something to the bot!
              </motion.h2>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {listItems.map((item, index) => (
            <motion.li
              key={index}
              variants={index % 2 === 0 ? null : messageVariants}
              initial="hidden"
              className={index % 2 === 0 ? "even" : "odd"}
              animate="visible"
              exit="hidden"
            >
              {item}
            </motion.li>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {isTyping ? (
            <motion.li
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="even"
            >
              You: {inputText}
            </motion.li>
          ) : null}
          {isTyping ? <li className="odd">AI is typing...</li> : null}
        </AnimatePresence>
      </ul>

      <div className="chat-container">
        <li className="icon-container" style={{ listStyle: "none", paddingRight: 30 }}>
          {/* Display the microphone icon conditionally */}

          {!listening ? (
            <IconContext.Provider
              value={
                isSpeaking
                  ? { color: "#888", size: "1.7em" }
                  : { color: "#ccc", size: "1.7em" }
              }
            >
              <IoMicOff
                onClick={() =>
                  isSpeaking ? null : SpeechRecognition.startListening()
                }
              />
            </IconContext.Provider>
          ) : (
            <IconContext.Provider value={{ color: "#00c954", size: "1.7em" }}>
              <motion.div
                style={{ display: "inline-block" }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.8, 1],
            
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                }}
              >
                <IoMic onClick={() => SpeechRecognition.stopListening()} />{" "}
        
              </motion.div>
            </IconContext.Provider>
          )}
        </li>

        <div className="check-container">
          <label>
            Enable TTS
            <input
              className="checkbox"
              type="checkbox"
              style={{ opacity: 0 }}
              checked={isChecked}
              onChange={(event) => handleCheckboxChange(event)}
            />
            <span class="checkmark"></span>
          </label>
        </div>
        <input
          type="text"
          disabled={isLoading}
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={() => handleKeyPress(true)}
          placeholder="Type your message here..."
          autoFocus
        />

        <button
          className="chat-submit"
          style={{ marginRight: 35, marginLeft: 35 }}
          onClick={() => handleKeyPress({ key: "Enter" }, true)}
          disabled={isLoading || inputText.trim() === ""}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default App;
