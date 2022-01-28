extern crate bitintr;

use self::bitintr::Popcnt;
use std::iter::Iterator;
use std::ops::{BitAndAssign, BitOrAssign};
use std::option::Option;

pub const LENGTH: usize = 12972;
const ELS: usize = 203;
const EL_SIZE: usize = 64;

#[repr(align(32))]
#[derive(Clone)]
pub struct Bitfield {
  pub buf: [u64; ELS],
}

// A bitfield that contains one bit of information for each word in the
// dictionary. The index of the bit within the bitfield corresponds to the index
// of the word in the words array in words.rs.
impl Bitfield {
  pub fn new() -> Self {
    Bitfield {
      buf: [0; ELS],
    }
  }

  pub fn get(&self, index: usize) -> bool {
    (self.buf[index / EL_SIZE] & (1u64 << (index % EL_SIZE))) != 0
  }

  pub fn count(&self) -> usize {
    self.buf.iter().fold(0u64, |acc, x| acc + x.popcnt()) as usize
  }

  pub fn iter<'a>(&'a self) -> Iter<'a> {
    Iter {
      bf: &self,
      idx: 0,
    }
  }

  pub fn bitornot_assign(&mut self, rhs: &Self) {
    for i in 0..ELS {
      self.buf[i] |= !rhs.buf[i];
    }
    self.mask_final();
  }

  fn mask_final(&mut self) {
    self.buf[ELS - 1] &= 0x00000fffffffffff;
  }
}

impl BitAndAssign<&Self> for Bitfield {
  fn bitand_assign(&mut self, rhs: &Self) {
    for i in 0..ELS {
      self.buf[i] &= rhs.buf[i];
    }
    self.mask_final();
  }
}

impl BitOrAssign<&Self> for Bitfield {
  fn bitor_assign(&mut self, rhs: &Self) {
    for i in 0..ELS {
      self.buf[i] |= rhs.buf[i];
    }
    self.mask_final();
  }
}

pub struct Iter<'a> {
  bf: &'a Bitfield,
  idx: usize,
}

impl Iterator for Iter<'_> {
  type Item = bool;

  fn next(&mut self) -> Option<bool> {
    if self.idx == LENGTH {
      None
    } else {
      let idx = self.idx;
      self.idx += 1;
      Some(self.bf.get(idx))
    }
  }
}
