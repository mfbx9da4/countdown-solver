# [Countdown solver](https://countdown-solver.vercel.app)

This app displays all possible solutions for a Countdown numbers round in a tree form.

- [Demo](https://countdown-solver.vercel.app)

![image](https://user-images.githubusercontent.com/1690659/128640586-f7a7cacb-1adf-42d7-af4c-95740f91cf62.png)

If you haven't seen Countdown, it's a game show. Watch a [quick numbers round](https://www.youtube.com/watch?v=pfa3MHLLSWI).
The numbers round goes like this:

- Contestants have 30 seconds to reach the target number using a sequence of calculations from 6 input numbers.
- The target number is a three digit number. The input numbers will be positive integers less than or equal to 100.
- At no stage during calculations can negative numbers or fractions be used.
- For the more detailed constraints [please read](<https://en.wikipedia.org/wiki/Countdown_(game_show)#Numbers_round>). I'll paraphrase the rules below.

### How it works

- [Solver](https://github.com/mfbx9da4/countdown-solver/blob/main/solver/solver.ts). The algorithm
  iterates through all permutations of the input numbers by brute force. This is run in a web worker so as
  not to block the main thread.
- [Tree layout algorithm](https://github.com/mfbx9da4/countdown-solver/blob/main/layout/davidStrategy.ts).
  The main thread, keeps a tree in memory. As each exact solution is yielded by the web
  worker the main thread adds it to a tree structure. It is then run through a [homegrown layout algorithm](https://github.com/mfbx9da4/countdown-solver/blob/main/layout/davidStrategy.ts) to absolutely position the nodes and edges.
- [Tree drawing in svg](https://github.com/mfbx9da4/countdown-solver/blob/main/components/Tree.tsx). Using
  react, svg `circle`s and `line`s are absolutely positioned.
- For fun I also worked out [how many possible expressions there are](https://math.stackexchange.com/questions/4219234/how-many-valid-expressions-for-countdown-numbers-round).
- [For fun I also threw together a solver for the word round](https://github.com/mfbx9da4/countdown-solver/blob/main/solver/words.ts).
