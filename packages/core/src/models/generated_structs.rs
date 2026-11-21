// Example code that deserializes and serializes the model.
// extern crate serde;
// #[macro_use]
// extern crate serde_derive;
// extern crate serde_json;
//
// use generated_module::chatData;
//
// fn main() {
//     let json = r#"{"answer": 42}"#;
//     let model: chatData = serde_json::from_str(&json).unwrap();
// }

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatData {
    pub id: i64,

    pub name: String,

    #[serde(rename = "type")]
    pub chat_schema_type: ChatType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ChatType {
    Group,

    Private,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatDataWithParticipants {
    pub id: i64,

    pub name: String,

    pub participants: Vec<Participant>,

    #[serde(rename = "type")]
    pub chat_schema_with_participants_type: ChatType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Participant {
    pub avatar: String,

    pub id: i64,

    pub username: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EmojiData {
    pub id: i64,

    pub name: String,

    pub uploader_id: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MessageData {
    pub chat_id: i64,

    pub content: String,

    pub id: i64,

    pub is_seen: bool,

    pub seen_at: Option<String>,

    pub sender_id: i64,

    pub sent_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MessageDataWithSender {
    pub chat_id: i64,

    pub content: String,

    pub id: i64,

    pub is_seen: bool,

    pub seen_at: Option<String>,

    pub sender: Sender,

    pub sender_id: i64,

    pub sent_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Sender {
    pub avatar: String,

    pub id: i64,

    pub username: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserData {
    pub avatar: String,

    pub id: i64,

    pub username: String,
}
