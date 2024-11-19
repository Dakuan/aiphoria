"use client";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

// Dear reader,
// this is not at all how I would code IRL, but I've only got an hour so I can't really do what I'd like to if this was real.
// Instead I've added lots of notes so at least you know what I'm thinking.
// left it all in one file to make it easier to read quickly rather than having you having to jump into loads of little files
// I didnt extract comoponets / hooks etc as I didnt have time
// this is NOT how id structure something for real - I do have a full size nextjs side project that I can walk you round if you like.
// Cheers,
// Dom

// ps thank you very much for not asking me to spend a week making a production grade app!!!

// lifted this almost verbaim from Claude, only change I made was to make it parameterised
// as the exercise asked for it to be possible for there to be 7 numbers.
// figured i might as well parameterise min/max too (tho it would break the styling)
// obvs random number generation is a whole thing in itself, never had to do it in reality (testing such a thing must be a pain) thankfully!
// this seems to work well enough for a 1 hour exercise
// and yes, a param object would be better so you dont have to do generateLotteryNumbers(undefined, undefined, 7)
function generateLotteryNumbers(max = 45, min = 1, series = 6): number[] {
  // Create array of all possible numbers
  const allNumbers: number[] = Array.from({ length: max }, (_, i) => i + min);

  // Array to store selected numbers
  const selectedNumbers: number[] = [];

  // Select 6 unique random numbers
  for (let i = 0; i < series; i++) {
    // Get random index from remaining numbers
    const randomIndex = Math.floor(Math.random() * allNumbers.length);
    // Add the number at that index to our selected numbers
    selectedNumbers.push(allNumbers[randomIndex]);
    // Remove the selected number from the pool of available numbers
    allNumbers.splice(randomIndex, 1);
  }

  // Return the numbers sorted in ascending order
  return selectedNumbers.sort((a, b) => a - b);
}

// apart from these colors being ugly together, this makes me sad
// id much rather have something that takes a range and messes with the hsl values
// such that you get something pretty that isnt fragile
// also you can't assemble tailwind strings programatically, you need it verbaim in the code
// for the transpiler to do its thing
const style = (num: number) => {
  switch (true) {
    case num >= 1 && num <= 9:
      return `bg-gray-100`;
    case num >= 10 && num <= 19:
      return `bg-blue-100`;
    case num >= 20 && num <= 29:
      return `bg-pink-100`;
    case num >= 30 && num <= 39:
      return `bg-green-100`;
    case num >= 40 && num <= 49:
      return `bg-yellow-100`;
    default:
      return "";
  }
};

export const Generator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [numbersSets, setNumberSets] = useState([generateLotteryNumbers()]);
  const [setIndex, setSetIndex] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;

    // added a timeout so the user thinks that some work is being done
    // ive done this alot with sass apps in the past
    if (isGenerating) {
      timeout = setTimeout(() => {
        setIsGenerating(false);
        setNumberSets((sets) => [...sets, generateLotteryNumbers()]);
        setSetIndex((i) => i + 1);
        timeout = undefined;
      }, 2000);
    }

    // prevent memory leaks on unmmount, hooray for react
    // id bundle all this into a custom hook IRL
    return () => {
      if (!timeout) return;
      clearTimeout(timeout);
    };
  }, [isGenerating]);

  const currentSet = numbersSets[setIndex];

  const onClick = () => setIsGenerating(true);

  const canGoToPrevious = setIndex > 0 && !isGenerating;
  const canGoToNext = setIndex < numbersSets.length - 1 && !isGenerating;

  const onGoToPreviousSet = () => setSetIndex((i) => i - 1);
  const onGoToNextSet = () => setSetIndex((i) => i + 1);

  return (
    <div className="w-96 mt-24 space-y-4" suppressHydrationWarning>
      {/* ux for this is horrible, you'd really want to see where you are in the sets, how many are there etc */}
      <div className="flex-row flex text-white space-x-2 h-8">
        {canGoToPrevious && (
          <button
            onClick={onGoToPreviousSet}
            className={twMerge(
              "bg-gray-500 hover:bg-gray-600 border border-gray-700 hover:border-gray-800 transition-all opacity-100 hover:shadow-sm text-white rounded-lg py-1 px-2",
              isGenerating && "opacity-30 pointer-events-none"
            )}
          >
            Prev
          </button>
        )}
        {canGoToNext && (
          <button
            onClick={onGoToNextSet}
            className={twMerge(
              "bg-gray-500 hover:bg-gray-600 border border-gray-700 hover:border-gray-800 transition-all opacity-100 hover:shadow-sm text-white rounded-lg py-1 px-2",
              isGenerating && "opacity-30 pointer-events-none"
            )}
          >
            Next
          </button>
        )}
      </div>
      <div className="bg-gray-50 border border-gray-300 h-full w-full max-w-96 p-4 rounded-xl drop-shadow-xl space-y-4">
        <div className="flex-row flex space-x-2">
          {/* i wanted to add some animation because i really care about stuff like this, details matter. 
          id use framer motion in reality and do sometihng more subtle and tasteful too!
          this is just a quick and dirty tailwind based approach.
        */}
          {currentSet
            .sort((a, b) => a - b)
            .map((n, i) => (
              <div
                style={{
                  transitionDelay: isGenerating ? "0ms" : `${i * 100}ms`,
                }}
                key={i}
                className={twMerge(
                  "px-4 py-4 border border-gray-200 rounded bg-white flex items-center justify-center font-bold text-gray-900 min-w-0 flex-1 transition-all duration-500",
                  style(n),
                  isGenerating && "animate-pulse bg-gray-50"
                )}
              >
                <span
                  style={{
                    transitionDelay: isGenerating ? "0ms" : `${i * 100}ms`,
                  }}
                  className={twMerge(
                    "transition-opacity ",
                    isGenerating ? "opacity-0" : "opacity-100 duration-700"
                  )}
                >
                  {n}
                </span>
              </div>
            ))}
        </div>
        <button
          type="button"
          onClick={onClick}
          className={twMerge(
            "bg-gray-800 hover:bg-gray-700 border border-gray-800 hover:border-gray-900 transition-all opacity-100 hover:shadow-sm w-full text-white rounded py-2",
            isGenerating && "opacity-30 pointer-events-none text-gray-400"
          )}
        >
          Generate
        </button>
      </div>
    </div>
  );
};
