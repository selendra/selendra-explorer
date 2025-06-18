// backend/api/src/handlers/websocket/mod.rs
use crate::AppState;
use axum::{
    extract::{
        State,
        ws::{Message, WebSocket, WebSocketUpgrade},
    },
    response::Response,
};
use futures::{sink::SinkExt, stream::StreamExt};
use serde::{Deserialize, Serialize};
use std::{sync::Arc, time::Duration};
use tokio::time::interval;
use tracing::{error, info, warn};

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum WebSocketMessage {
    #[serde(rename = "subscribe")]
    Subscribe { topic: String },
    #[serde(rename = "unsubscribe")]
    Unsubscribe { topic: String },
    #[serde(rename = "block_update")]
    BlockUpdate { data: serde_json::Value },
    #[serde(rename = "transaction_update")]
    TransactionUpdate { data: serde_json::Value },
    #[serde(rename = "substrate_block_update")]
    SubstrateBlockUpdate { data: serde_json::Value },
    #[serde(rename = "substrate_event_update")]
    SubstrateEventUpdate { data: serde_json::Value },
    #[serde(rename = "error")]
    Error { message: String },
    #[serde(rename = "success")]
    Success { message: String },
}

pub async fn websocket_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
) -> Response {
    ws.on_upgrade(move |socket| handle_socket(socket, state))
}

async fn handle_socket(socket: WebSocket, state: Arc<AppState>) {
    let (mut sender, mut receiver) = socket.split();
    let mut subscribed_topics = Vec::new();
    let mut poll_interval = interval(Duration::from_secs(5)); // Poll every 5 seconds

    info!("WebSocket connection established");

    loop {
        tokio::select! {
            // Handle incoming WebSocket messages
            msg = receiver.next() => {
                match msg {
                    Some(Ok(Message::Text(text))) => {
                        if let Err(e) = handle_client_message(
                            &text,
                            &mut subscribed_topics,
                            &mut sender
                        ).await {
                            error!("Error handling client message: {}", e);
                            break;
                        }
                    }
                    Some(Ok(Message::Close(_))) => {
                        info!("WebSocket connection closed by client");
                        break;
                    }
                    Some(Err(e)) => {
                        error!("WebSocket error: {}", e);
                        break;
                    }
                    None => break,
                    _ => {}
                }
            }

            // Handle periodic updates for all subscribed topics
            _ = poll_interval.tick() => {
                if subscribed_topics.contains(&"blocks".to_string()) {
                    if let Err(e) = send_block_update(&state, &mut sender).await {
                        error!("Error sending EVM block update: {}", e);
                        break;
                    }
                }

                if subscribed_topics.contains(&"transactions".to_string()) {
                    if let Err(e) = send_transaction_update(&state, &mut sender).await {
                        error!("Error sending transaction update: {}", e);
                        break;
                    }
                }

                if subscribed_topics.contains(&"substrate_blocks".to_string()) {
                    if let Err(e) = send_substrate_block_update(&state, &mut sender).await {
                        error!("Error sending substrate block update: {}", e);
                        break;
                    }
                }

                if subscribed_topics.contains(&"substrate_events".to_string()) {
                    if let Err(e) = send_substrate_event_update(&state, &mut sender).await {
                        error!("Error sending substrate event update: {}", e);
                        break;
                    }
                }
            }
        }
    }
}

async fn handle_client_message(
    text: &str,
    subscribed_topics: &mut Vec<String>,
    sender: &mut futures::stream::SplitSink<WebSocket, Message>,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let msg: WebSocketMessage = serde_json::from_str(text)?;

    match msg {
        WebSocketMessage::Subscribe { topic } => {
            // Validate topic before subscribing
            let valid_topics = [
                "blocks",
                "transactions",
                "substrate_blocks",
                "substrate_events",
            ];
            if !valid_topics.contains(&topic.as_str()) {
                let error_response = WebSocketMessage::Error {
                    message: format!(
                        "Invalid topic: {}. Valid topics are: {}",
                        topic,
                        valid_topics.join(", ")
                    ),
                };
                let error_text = serde_json::to_string(&error_response)?;
                sender.send(Message::Text(error_text.into())).await?;
                return Ok(());
            }

            if !subscribed_topics.contains(&topic) {
                subscribed_topics.push(topic.clone());
                info!("Client subscribed to topic: {}", topic);

                let response = WebSocketMessage::Success {
                    message: format!("Subscribed to {}", topic),
                };
                let response_text = serde_json::to_string(&response)?;
                sender.send(Message::Text(response_text.into())).await?;
            }
        }
        WebSocketMessage::Unsubscribe { topic } => {
            subscribed_topics.retain(|t| t != &topic);
            info!("Client unsubscribed from topic: {}", topic);

            let response = WebSocketMessage::Success {
                message: format!("Unsubscribed from {}", topic),
            };
            let response_text = serde_json::to_string(&response)?;
            sender.send(Message::Text(response_text.into())).await?;
        }
        _ => {
            warn!("Unexpected message type from client");
        }
    }

    Ok(())
}

async fn send_block_update(
    state: &Arc<AppState>,
    sender: &mut futures::stream::SplitSink<WebSocket, Message>,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let block_service = state.db.evm_blocks();

    match block_service.get_latest().await {
        Ok(Some(block)) => {
            let block_data = serde_json::to_value(&block)?;
            let message = WebSocketMessage::BlockUpdate { data: block_data };
            let message_text = serde_json::to_string(&message)?;

            sender.send(Message::Text(message_text.into())).await?;
        }
        Ok(None) => {
            // No blocks available yet
        }
        Err(e) => {
            error!("Failed to get latest EVM block: {}", e);
            let error_msg = WebSocketMessage::Error {
                message: "Failed to get latest EVM block".to_string(),
            };
            let error_text = serde_json::to_string(&error_msg)?;
            sender.send(Message::Text(error_text.into())).await?;
        }
    }

    Ok(())
}

async fn send_transaction_update(
    state: &Arc<AppState>,
    sender: &mut futures::stream::SplitSink<WebSocket, Message>,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let transaction_service = state.db.transactions();

    match transaction_service.get_latest().await {
        Ok(Some(transaction)) => {
            let transaction_data = serde_json::to_value(&transaction)?;
            let message = WebSocketMessage::TransactionUpdate {
                data: transaction_data,
            };
            let message_text = serde_json::to_string(&message)?;

            sender.send(Message::Text(message_text.into())).await?;
        }
        Ok(None) => {
            // No transactions available yet
        }
        Err(e) => {
            error!("Failed to get latest transaction: {}", e);
            let error_msg = WebSocketMessage::Error {
                message: "Failed to get latest transaction".to_string(),
            };
            let error_text = serde_json::to_string(&error_msg)?;
            sender.send(Message::Text(error_text.into())).await?;
        }
    }

    Ok(())
}

async fn send_substrate_block_update(
    state: &Arc<AppState>,
    sender: &mut futures::stream::SplitSink<WebSocket, Message>,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let block_service = state.db.substrate_blocks();

    match block_service.get_latest().await {
        Ok(Some(block)) => {
            let block_data = serde_json::to_value(&block)?;
            let message = WebSocketMessage::SubstrateBlockUpdate { data: block_data };
            let message_text = serde_json::to_string(&message)?;

            sender.send(Message::Text(message_text.into())).await?;
        }
        Ok(None) => {
            // No substrate blocks available yet
        }
        Err(e) => {
            error!("Failed to get latest substrate block: {}", e);
            let error_msg = WebSocketMessage::Error {
                message: "Failed to get latest substrate block".to_string(),
            };
            let error_text = serde_json::to_string(&error_msg)?;
            sender.send(Message::Text(error_text.into())).await?;
        }
    }

    Ok(())
}

async fn send_substrate_event_update(
    state: &Arc<AppState>,
    sender: &mut futures::stream::SplitSink<WebSocket, Message>,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    let event_service = state.db.substrate_events();

    // Get recent events from the last hour with a limit of 10
    match event_service.get_recent_events(1, 10).await {
        Ok(events) => {
            if !events.is_empty() {
                let events_data = serde_json::to_value(&events)?;
                let message = WebSocketMessage::SubstrateEventUpdate { data: events_data };
                let message_text = serde_json::to_string(&message)?;

                sender.send(Message::Text(message_text.into())).await?;
            }
        }
        Err(e) => {
            error!("Failed to get recent substrate events: {}", e);
            let error_msg = WebSocketMessage::Error {
                message: "Failed to get recent substrate events".to_string(),
            };
            let error_text = serde_json::to_string(&error_msg)?;
            sender.send(Message::Text(error_text.into())).await?;
        }
    }

    Ok(())
}
