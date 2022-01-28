use crate::guess::Guess;

const ELS: usize = 4;
const EL_SIZE: usize = 64;

#[repr(align(32))]
#[derive(Clone)]
pub struct VisitedGuesses {
  pub buf: [u64; ELS],
}

impl VisitedGuesses {
  pub fn new() -> Self {
    VisitedGuesses {
      buf: [0; ELS],
    }
  }

  pub fn has(&self, guess: &Guess) -> bool {
    let index = guess_to_index(guess);
    (self.buf[index / EL_SIZE] & (1u64 << (index % EL_SIZE))) != 0
  }

  pub fn add(&mut self, guess: &Guess) {
    let index = guess_to_index(guess);
    self.buf[index / EL_SIZE] |= 1u64 << (index % EL_SIZE)
  }
}

fn guess_to_index(guess: &Guess) -> usize {
  guess.0[0].1 as usize + 
    guess.0[1].1 as usize * 3 +
    guess.0[2].1 as usize * 9 +
    guess.0[3].1 as usize * 27 +
    guess.0[4].1 as usize * 81
}
