use super::*;

/// Iterator to split a VV8 log record line by the `:` delimiter,
/// considering the possibility of escapes by `\`.
#[derive(new)]
pub struct SplitRecordLine<'a> {
    remaining: &'a str,
}

impl<'a> SplitRecordLine<'a> {
    pub fn drain(&mut self) -> &str {
        let output = self.remaining;
        self.remaining = "";
        output
    }
}

impl<'a> Iterator for SplitRecordLine<'a> {
    type Item = &'a str;

    fn next(&mut self) -> Option<Self::Item> {
        if self.remaining.is_empty() {
            return None;
        }
        let mut index = 0;
        loop {
            match self.remaining.as_bytes().get(index) {
                Some(&char) => match char {
                    // Escape next character.
                    b'\\' => index += 2,
                    // Split on colon. Return previous. Save after the colon.
                    b':' => {
                        let split = &self.remaining[..index];
                        self.remaining = &self.remaining[index + 1..];
                        return Some(split);
                    }
                    _ => index += 1,
                },

                None => {
                    // Fully consumed.
                    let split = &self.remaining[..index];
                    self.remaining = &self.remaining[index..];
                    debug_assert!(self.remaining.is_empty());
                    return Some(split);
                }
            }
        }
    }
}
