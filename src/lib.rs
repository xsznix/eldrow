extern crate wasm_bindgen;
use wasm_bindgen::prelude::*;

mod bitfield;
mod dict;
mod guess;
mod serai_cache;
mod visited_guesses;
mod words;

pub use serai_cache::first_guess;

use bitfield::Bitfield;
use guess::Guess;
use visited_guesses::VisitedGuesses;
use words::word_at;

#[wasm_bindgen]
pub fn make_guess(hints: &str) -> Option<String> {
  let mut candidates = Bitfield::new();
  for hint in hints.split(' ') {
    Guess::parse(&hint[..]).apply_to(&mut candidates);
  }
  let num_possible = candidates.count();
  if num_possible == 0 {
    return None;
  }
  if num_possible == 1 {
    for (i, eliminated) in candidates.iter().enumerate() {
      if !eliminated {
        return Some(word_at(i).to_owned());
      }
    }
  }
  let mut best_guess: Option<Evaluation> = None;
  for guess_idx in 0..bitfield::LENGTH {
    let mut worst = bitfield::LENGTH;
    let mut visited = VisitedGuesses::new();
    for (solution_idx, eliminated) in candidates.iter().enumerate() {
      if eliminated {
        continue;
      }
      let guess = Guess::evaluate(word_at(guess_idx), word_at(solution_idx));
      if visited.has(&guess) {
        continue;
      }
      visited.add(&guess);
      let mut my_eliminated = candidates.clone();
      guess.apply_to(&mut my_eliminated);
      let new_eliminated = my_eliminated.count();
      worst = worst.min(new_eliminated);
    }
    let is_candidate = !candidates.get(guess_idx);
    match &best_guess {
      Some(evaluation)
        if worst == bitfield::LENGTH ||
          evaluation.eliminated > worst ||
          evaluation.eliminated == worst &&
            (evaluation.is_candidate || !is_candidate) => {},
      _ if worst != bitfield::LENGTH => {
        best_guess = Some(Evaluation {
          eliminated: worst,
          word_idx: guess_idx,
          is_candidate: is_candidate,
        });
      },
      _ => {},
    }
  }
  best_guess.map(|evaluation| word_at(evaluation.word_idx).to_owned())
}

struct Evaluation {
  eliminated: usize,
  word_idx: usize,
  is_candidate: bool,
}
