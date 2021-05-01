export interface ISlackMessage {
  client_msg_id: string;
  type: string;
  text: string;
  user: string;
  ts: string;
  team: string;
  blocks: Block[];
  channel: string;
  event_ts: string;
  channel_type: string;
}

export interface Block {
  type: string;
  block_id: string;
  elements: BlockElement[];
}

export interface BlockElement {
  type: string;
  elements: ElementElementClass[];
}

export interface ElementElementClass {
  type: string;
  text: string;
}
