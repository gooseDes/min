// This file is auto-generated, so do not change it manually

#[flutter_rust_bridge::frb(sync, positional)]
pub fn strip_commands(text: String) -> String {
    if text.starts_with('/') {
        text.lines().skip(1).collect::<Vec<_>>().join("\n")
    } else {
        text
    }
}
#[flutter_rust_bridge::frb(sync, positional)]
pub fn parse_reply_id(content: String) -> Option<i32> {
    content
        .lines()
        .nth(0)?
        .split_whitespace()
        .nth(1)?
        .parse()
        .ok()
}
