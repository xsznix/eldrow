use crate::bitfield::Bitfield;
use crate::dict::{green, yellow, letter_idx};

#[derive(Clone, Copy, Debug, PartialEq)]
pub enum HintType {
  Black = 0,
  Yellow = 1,
  Green = 2,
}

#[derive(Debug)]
pub struct Guess([(char, HintType); 5]);

impl Guess {
  pub fn parse(input: &str) -> Self {
    let mut chars = input.chars();
    let mut result = Guess([('\0', HintType::Black); 5]);
    for i in 0..5 {
      result.0[i].0 = chars.next().unwrap();
      assert!(result.0[i].0 >= 'a');
      assert!(result.0[i].0 <= 'z');
    }
    for i in 0..5 {
      result.0[i].1 = match chars.next() {
        Some('0') => HintType::Black,
        Some('1') => HintType::Yellow,
        Some('2') => HintType::Green,
        _ => panic!("unexpected input"),
      };
    }
    result
  }

  pub fn evaluate(guess: &str, solution: &str) -> Self {
    debug_assert_eq!(guess.len(), 5);
    debug_assert_eq!(solution.len(), 5);
    let mut result = Guess([('\0', HintType::Black); 5]);
    let mut remaining = [0u8; 5];
    for i in 0..5 {
      remaining[i] = solution.bytes().nth(i).unwrap();
      result.0[i].0 = guess.bytes().nth(i).unwrap() as char;
    }
    for i in 0..5 {
      if guess.bytes().nth(i).unwrap() == solution.bytes().nth(i).unwrap() {
        result.0[i].1 = HintType::Green;
        remaining[i] = 0;
      }
    }
    for i in 0..5 {
      if result.0[i].1 != HintType::Green {
        match remaining.iter().position(|&x| x == result.0[i].0 as u8) {
          Some(match_idx) => {
            result.0[i].1 = HintType::Yellow;
            remaining[match_idx as usize] = 0;
          },
          None => (),
        };
      }
    }
    // println!("{}>{}: {:?}", guess, solution, result);
    result
  }

  pub fn apply_to(&self, candidates: &mut Bitfield) {
    let mut seen_letters = [0u8; 26];

    // greens
    for i in 0..5 {
      let (letter, hint_type) = self.0[i];
      if hint_type == HintType::Green {
        candidates.bitornot_assign(green(letter, i));
        seen_letters[letter_idx(letter)] += 1;
      } else {
        *candidates |= green(letter, i);
      }
    }

    // yellows
    for i in 0..5 {
      let (letter, hint_type) = self.0[i];
      if hint_type == HintType::Yellow {
        let idx = letter_idx(letter);
        candidates.bitornot_assign(yellow(letter, seen_letters[idx] as usize));
        seen_letters[idx] += 1;
      }
    }

    // blacks
    for i in 0..5 {
      let (letter, hint_type) = self.0[i];
      if hint_type == HintType::Black {
        let idx = letter_idx(letter);
        *candidates |= yellow(letter, seen_letters[idx] as usize);
      }
    }
  }
}
